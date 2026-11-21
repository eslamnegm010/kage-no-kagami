/**
 * Service Worker for Kage no Kagami (SMART-LOAD §1).
 * Built by copyServiceWorkerPlugin from src/net/swLogic.js and viewer/sw.js.
 */

/**
 * Pure functions and constants for the Kage no Kagami Service Worker (SMART-LOAD §1).
 */

const CACHE_NAME = 'kage-assets-v1';
const MAX_CACHE_BYTES = 300 * 1024 * 1024; // 300 MB
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Pure function: Classifies a request URL into its caching category.
 * Returns: 'versioned-asset' | 'hashed-bundle' | 'network-first' | 'other'
 */
function classifyUrl(input) {
  if (!input) return 'other';
  const urlStr = typeof input === 'string' ? input : input.url || String(input);

  let pathname = '';
  let search = '';
  try {
    const parsed = new URL(urlStr, 'http://localhost');
    pathname = parsed.pathname;
    search = parsed.search;
  } catch {
    const qIdx = urlStr.indexOf('?');
    if (qIdx >= 0) {
      pathname = urlStr.slice(0, qIdx);
      search = urlStr.slice(qIdx);
    } else {
      pathname = urlStr;
    }
  }

  // Shell & Manifest: Network-first
  if (
    /(^|\/)(game\.html|index\.html|assets-manifest\.json)($|\?)/i.test(pathname) ||
    pathname === '/' ||
    pathname.endsWith('/')
  ) {
    return 'network-first';
  }

  // Versioned asset: ?v= (or &v=) on asset files
  const isVersioned = /[?&]v=[^&#]+/i.test(search);
  const isAssetExt = /\.(glb|webp|ogg|m4a|png|bin|json)$/i.test(pathname);
  if (isVersioned && isAssetExt) {
    return 'versioned-asset';
  }

  // JS/CSS under assets/ (Vite hashed bundles)
  if (/(^|\/)assets\/[^/]+\.(js|css)($|\?)/i.test(pathname)) {
    return 'hashed-bundle';
  }

  return 'other';
}

/**
 * Extracts normalized relative path matching manifest keys.
 * Strips scope (e.g. self.registration.scope or GitHub Pages subpath) and 'models/' prefix.
 */
function normalizeAssetPath(url, scope = '') {
  if (!url) return '';
  const urlStr = typeof url === 'string' ? url : url.url || String(url);
  const clean = urlStr.split(/[?#]/)[0];

  const defaultScope = typeof self !== 'undefined' && self.registration?.scope
    ? self.registration.scope
    : '';
  const effectiveScope = scope || defaultScope;

  let rel = '';
  if (effectiveScope) {
    try {
      const scopeUrl = new URL(effectiveScope, 'http://localhost/');
      const targetUrl = new URL(clean, scopeUrl);
      const scopePath = scopeUrl.pathname.endsWith('/') ? scopeUrl.pathname : scopeUrl.pathname + '/';
      if (targetUrl.origin === scopeUrl.origin && targetUrl.pathname.startsWith(scopePath)) {
        rel = targetUrl.pathname.slice(scopePath.length);
      }
    } catch {
      // Fallback below
    }
  }

  if (!rel) {
    try {
      const parsed = new URL(clean, 'http://localhost/');
      rel = parsed.pathname;
    } catch {
      rel = clean;
    }
  }

  rel = rel.replace(/^(\.\/|\/)+/, '');
  rel = rel.replace(/^models\//, '');
  return rel;
}

/**
 * Extracts hash value from ?v= or &v= parameter.
 */
function extractVersionHash(url) {
  if (!url) return null;
  const urlStr = typeof url === 'string' ? url : url.url || String(url);
  const match = urlStr.match(/[?&]v=([^&#]+)/i);
  return match ? match[1] : null;
}

/**
 * Checks if the lastUsed timestamp is older than 24 hours.
 */
function shouldUpdateLastUsed(lastUsed, now = Date.now()) {
  if (!lastUsed) return true;
  return (now - lastUsed) >= TWENTY_FOUR_HOURS_MS;
}

/**
 * Rewrites cache entry with updated x-kage-used header ONLY if stored
 * timestamp is older than 24 hours. Returns boolean indicating whether rewrite occurred.
 */
async function updateLastUsedHeader(cache, request, cachedResponse, now = Date.now()) {
  const used = cachedResponse?.headers?.get('x-kage-used');
  const lastUsed = used ? parseInt(used, 10) || 0 : 0;
  if (lastUsed && !shouldUpdateLastUsed(lastUsed, now)) {
    return false;
  }
  try {
    const headers = new Headers(cachedResponse.headers);
    headers.set('x-kage-used', String(now));
    const blob = await cachedResponse.clone().blob();
    const modified = new Response(blob, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers,
    });
    if (cache && typeof cache.put === 'function') {
      await cache.put(request, modified);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Stores a fresh network response in cache with x-kage-used timestamp and content-length.
 */
async function storeWithLastUsed(cache, request, response, now = Date.now()) {
  try {
    const blob = await response.clone().blob();
    const headers = new Headers(response.headers);
    headers.set('x-kage-used', String(now));
    if (!headers.get('content-length') && blob.size) {
      headers.set('content-length', String(blob.size));
    }
    const modified = new Response(blob, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    if (cache && typeof cache.put === 'function') {
      await cache.put(request, modified);
    }
    return true;
  } catch {
    try {
      if (cache && typeof cache.put === 'function') {
        await cache.put(request, response.clone());
      }
    } catch {
      /* ignore */
    }
    return false;
  }
}

/**
 * Pure function: Selects cache entries to purge.
 * 1. Deletes versioned (?v=) entries whose path+hash does not match currentManifest.
 * 2. If remaining entries exceed maxBytes, evicts least recently used (LRU by lastUsed)
 *    until total size is under maxBytes.
 */
function selectEntriesToPurge(entries, currentManifest = {}, maxBytes = MAX_CACHE_BYTES, scope = '') {
  const toPurge = [];
  const remaining = [];

  for (const entry of entries) {
    const url = typeof entry === 'string' ? entry : entry.url;
    const versionHash = extractVersionHash(url);

    if (versionHash) {
      const relPath = normalizeAssetPath(url, scope);
      const manifestHash = currentManifest?.[relPath];

      if (!manifestHash || manifestHash !== versionHash) {
        toPurge.push(entry);
        continue;
      }
    }

    remaining.push(entry);
  }

  let totalBytes = remaining.reduce((sum, e) => sum + (e.size || 0), 0);
  if (totalBytes > maxBytes) {
    remaining.sort((a, b) => (a.lastUsed || 0) - (b.lastUsed || 0));

    while (totalBytes > maxBytes && remaining.length > 0) {
      const oldest = remaining.shift();
      toPurge.push(oldest);
      totalBytes -= (oldest.size || 0);
    }
  }

  return toPurge;
}


/**
 * Classic Service Worker for Kage no Kagami (SMART-LOAD §1).
 * Pure functions are defined in src/net/swLogic.js and inlined at build time into sw.js.
 */

/* global CACHE_NAME, MAX_CACHE_BYTES, classifyUrl, selectEntriesToPurge, updateLastUsedHeader, storeWithLastUsed */

// -------------------------------------------------- Service Worker Lifecycle
if (typeof self !== 'undefined' && typeof window === 'undefined' && typeof self.addEventListener === 'function') {
  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      if (self.clients?.claim) await self.clients.claim();
      await cleanupCache();
    })());
  });

  self.addEventListener('fetch', (event) => {
    const kind = classifyUrl(event.request.url);
    if (kind === 'versioned-asset' || kind === 'hashed-bundle') {
      event.respondWith(cacheFirst(event.request));
    } else if (kind === 'network-first') {
      event.respondWith(networkFirst(event.request));
    }
  });
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    updateLastUsedHeader(cache, request, cached).catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (response && response.ok) {
    storeWithLastUsed(cache, request, response).catch(() => {});
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cleanupCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    let manifest = {};
    try {
      const res = await fetch('./assets-manifest.json', { cache: 'no-store' });
      if (res.ok) {
        manifest = await res.json();
      }
    } catch {
      const cached = await cache.match('./assets-manifest.json');
      if (cached) {
        try { manifest = await cached.json(); } catch { /* ignore */ }
      }
    }

    const requests = await cache.keys();
    const entries = [];
    for (const req of requests) {
      const resp = await cache.match(req);
      if (!resp) continue;
      const cl = resp.headers.get('content-length');
      const size = cl ? parseInt(cl, 10) || 0 : 0;
      const used = resp.headers.get('x-kage-used');
      const lastUsed = used ? parseInt(used, 10) || 0 : 0;
      entries.push({ url: req.url, request: req, size, lastUsed });
    }

    const scope = typeof self !== 'undefined' && self.registration?.scope ? self.registration.scope : '';
    const toPurge = selectEntriesToPurge(entries, manifest, MAX_CACHE_BYTES, scope);
    for (const item of toPurge) {
      const target = item.request || item.url || item;
      await cache.delete(target);
    }
  } catch (err) {
    console.warn('[sw] Cleanup failed:', err);
  }
}


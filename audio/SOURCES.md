# Audio Sources and Attribution

All audio files are sourced under CC0 1.0 Universal (Public Domain) licenses from Kenney (kenney.nl) and DAEDAL (daedal.art).
They were trimmed (-50 dB silence threshold), peak-normalized to -3.0 dBFS, downmixed to mono, and converted to `.m4a` (AAC 96 kbps mono) and `.ogg` (Opus 64 kbps mono).

| Converted File | Source Pack | Original Asset Name / Path | License |
| :--- | :--- | :--- | :--- |
| `whoosh_light_1` | DAEDAL Whoosh Library | `DAEDAL_Whoosh_071_Whip_0.5s_RL.wav` | CC0 |
| `whoosh_light_2` | DAEDAL Whoosh Library | `DAEDAL_Whoosh_079_Whip_0.6s_Center.wav` | CC0 |
| `whoosh_light_3` | DAEDAL Whoosh Library | `DAEDAL_Whoosh_042_Swirl_0.5s_LR.wav` | CC0 |
| `whoosh_heavy_1` | DAEDAL Whoosh Library | `DAEDAL_Whoosh_048_Deep_1.0s_LR.wav` | CC0 |
| `whoosh_heavy_2` | DAEDAL Whoosh Library | `DAEDAL_Whoosh_090_Deep_0.5s_RL.wav` | CC0 |
| `hit_flesh_1` | Kenney Impact Sounds | `Audio/impactPunch_heavy_000.ogg` | CC0 |
| `hit_flesh_2` | Kenney Impact Sounds | `Audio/impactPunch_heavy_001.ogg` | CC0 |
| `hit_flesh_3` | Kenney Impact Sounds | `Audio/impactPunch_heavy_002.ogg` | CC0 |
| `hit_metal_1` | Kenney Impact Sounds | `Audio/impactMetal_heavy_000.ogg` | CC0 |
| `hit_metal_2` | Kenney Impact Sounds | `Audio/impactMetal_heavy_001.ogg` | CC0 |
| `clang_1` | Kenney Impact Sounds | `Audio/impactPlate_heavy_000.ogg` | CC0 |
| `clang_2` | Kenney Impact Sounds | `Audio/impactPlate_heavy_001.ogg` | CC0 |
| `clang_3` | Kenney Impact Sounds | `Audio/impactPlate_heavy_002.ogg` | CC0 |
| `parry_ring` | Kenney Impact Sounds | `Audio/impactBell_heavy_000.ogg` | CC0 |
| `cloth_swish_1` | Kenney RPG Audio | `Audio/cloth1.ogg` | CC0 |
| `cloth_swish_2` | Kenney RPG Audio | `Audio/cloth2.ogg` | CC0 |
| `step_dirt_1` | Kenney Impact Sounds | `Audio/footstep_grass_000.ogg` | CC0 |
| `step_dirt_2` | Kenney Impact Sounds | `Audio/footstep_grass_001.ogg` | CC0 |
| `step_dirt_3` | Kenney Impact Sounds | `Audio/footstep_grass_002.ogg` | CC0 |
| `step_dirt_4` | Kenney Impact Sounds | `Audio/footstep_grass_003.ogg` | CC0 |
| `kiai_1` | Kenney Voiceover Pack | `Male/go.ogg` | CC0 |
| `kiai_2` | Kenney Voiceover Pack | `Male/set.ogg` | CC0 |
| `tell_danger` | DAEDAL + Kenney Impact | Mixed: `DAEDAL_Whoosh_090_Deep_0.5s_RL.wav` + `impactWood_heavy_000.ogg` | CC0 |
| `ko_boom` | Kenney Sci-Fi Sounds | `Audio/lowFrequency_explosion_000.ogg` (trimmed to ≤ 1.5s) | CC0 |
| `ui_click` | Kenney Interface Sounds | `Audio/click_001.ogg` | CC0 |
| `ui_reward` | Kenney Interface Sounds | `Audio/confirmation_001.ogg` | CC0 |

## AUDIO-2 additions (2026-11-18)

Built by `tools/audio/prep_music.sh` and `tools/audio/prep_sfx.sh` from `tools/audio/src/` (gitignored, download again with the URLs below).
Music: stereo Opus/AAC 96 kbps, -16 LUFS, 100 ms equal-power loop seam. SFX: mono 64 kbps, peak -3 dBFS.

| Files | Source | Author / license |
| :--- | :--- | :--- |
| `music_lobby` (106 s loop), `music_defeat` | opengameart.org/sites/default/files/Shinrin-Yoku_0.ogg | Varon Kein, CC BY 4.0 |
| `music_duel` (75 s loop) | .../Samurai_0.mp3 | Tad, CC BY 4.0 |
| `music_boss` (70 s loop, 30-100 s of the track) | .../Blackmoor%20Ninjas.mp3 | Matthew Pablo, CC BY 3.0 |
| `music_map` (76 s loop), `music_victory` | .../hot_spring_town_1.ogg | Kistol, CC0 |
| `hit_blade_*`, `hit_heavy_*` | .../sword_-_starninjas_1.zip (sword.N.ogg) | StarNinjas, CC0 |
| `steel_clash_*`, `guard_break`, `parry_bell` | .../sword_clash_-_starninjas_0.zip | StarNinjas, CC0 |
| `body_thump`, `body_fall`, `cloth_tear`, `step_wood_*`, `step_stone_*`, `ui_open`, `ui_coin`, `ui_unlock`, `ui_fight`, `ui_stamp` | .../RPGsounds_Kenney.zip | Kenney, CC0 |
| `ui_tap`, `ui_back` | .../UI_SFX_Set.zip | CC0 |
| `voice_{small,medium,large}_{kiai,hurt,ko}_*` | .../sls.mp3 (7 clips, pitch 1.22 / 1.0 / 0.8) | CC0 |

Selection of clips inside the packs was by description and length only (no listening); swap files in `prep_sfx.sh` if one sounds wrong.
Not replaced: `swish_*` (whooshes), `hit_armor_*`, `hit_metal_1`, `sword_ring`, `cloth_dodge_*`, `step_dirt_*` (all still the earlier CC0 sources above),
`tell_danger`, `ko_impact`, `ui_click`, `ui_reward`, `taiko_drums_loop` (synth-fallback drums).

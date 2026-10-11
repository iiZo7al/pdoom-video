# I'm Upping My P(doom) — Arabic Edition 🇸🇦

An **Arabic edition** of the generative, code-rendered music video **“I'm Upping My P(doom)”**, based on the original project by **[mexicat](https://github.com/mexicat/pdoom-video)**.

This edition adapts the on-screen lyrics and typography into Arabic while preserving the visual style and time-synchronized motion graphics of the original. It includes Windows rendering scripts for multiple resolutions and frame rates, including **4K / 120 FPS**.

## Watch the Arabic Edition

**[Watch the Arabic Edition on YouTube](https://youtu.be/PMNwbxVuXl4)**

**Original English video:** [Watch on YouTube](https://www.youtube.com/watch?v=5EoO5413dBY)

## About this edition

- Arabic lyrics and on-screen text adapted for the video.
- Word-synchronized animated typography and generative visuals.
- Windows `.cmd` render launchers for multiple output qualities, up to 3840×2160 at 120 FPS.
- Source code, timing data, assets, and local preview workflow.

> This is an unofficial Arabic adaptation. The original video, its underlying creative direction, and its engine were created by the original project's author and contributors. This repository does not claim ownership of their work or of the song.

## Project layout

- `audio/pdoom.mp3` — soundtrack (rights belong to the respective creators).
- `lyrics/` — original lyric source material.
- `data/` — audio analysis and lyric timing data, including Arabic adaptation data.
- `analysis/` — Python tools for alignment and audio analysis.
- `app/` — TypeScript / three.js video renderer.
- `app/src/engine/` — renderer core, typography, effects, and playback.
- `app/src/scenes/` — individual animated scenes.
- `app/src/timeline.ts` — scene timing and editing.
- `docs/` — technical documentation and treatment.
- `RENDER-ARABIC-*.cmd` — Windows rendering scripts for different resolutions and frame rates.
- `out/` — local rendered videos (not intended to be committed).

## Requirements

- [Bun](https://bun.sh/)
- Google Chrome
- FFmpeg with `libx264` support
- [uv](https://docs.astral.sh/uv/) — only needed to regenerate audio analysis and alignment data

## Preview the video

From the repository root:

```sh
cd app
bun install
bunx vite
```

Then open **http://localhost:5173**.

| Key | Action |
| --- | --- |
| Space | Play / pause |
| Left / Right | Seek ±1 second (±5 seconds with Shift) |
| `,` / `.` | Step one frame |
| `[` / `]` | Previous / next scene |
| `l` | Loop the current scene |
| `h` | Hide the UI |

## Render the Arabic Edition on Windows

Use one of the included `RENDER-ARABIC-*.cmd` scripts in the repository root. For example:

```cmd
RENDER-ARABIC-1080-60.cmd
RENDER-ARABIC-4K-120.cmd
```

The 4K / 120 FPS option is computationally demanding. Rendered videos are normally written to the project's output directory. See the scripts for exact settings and filenames.

## Original project and credits

**Original video and code project:** **[mexicat / pdoom-video](https://github.com/mexicat/pdoom-video)**. The original concept, treatment, audio/lyric analysis, video engine, animated scenes, and rendering workflow were developed by the original author with **Claude (Opus 5.5) in Claude Code**, as described in the original README.

**Original English video:** https://www.youtube.com/watch?v=5EoO5413dBY

**Arabic edition:** [Zo7al](https://github.com/iiZo7al) — Arabic adaptation and edition. [Arabic video on YouTube](https://youtu.be/PMNwbxVuXl4).

### Music credits

- **Song:** “I'm Upping My P(doom)” — not owned by this repository or the original video project.
- **Lyrics:** [osmarks](https://docs.osmarks.net/hypha/p%28doom%29_song_objectively_correct_interpretation), building on an opening verse and chorus by [MusicPerson](https://www.udio.com/creators/MusicPerson), with suggestions from the EleutherAI Discord and assistance from Claude on the outro and final chorus.
- **Original song:** Generated with Udio and released in November 2024. [Listen](https://www.youtube.com/watch?v=uEB5E67vcPA).
- **Version used for the video:** The “Claude-Pop” version made with Suno, shared by [deckard (@slimer48484)](https://x.com/slimer48484/status/2097752569212756134) in September 2026.

### Fonts

Archivo, IBM Plex Mono, and Cormorant Garamond are licensed under the SIL Open Font License. EMS and Hershey single-stroke fonts are provided under their respective OFL / public-domain terms. See the font license files in `app/public/fonts/`.

## License and attribution

The original project's **code** is released under the [MIT License](LICENSE). Keep its original copyright and permission notices intact when redistributing or modifying the code.

**The MIT license does not grant ownership of the music, lyrics, or separately licensed fonts.** The soundtrack (`audio/`), original lyrics (`lyrics/`, `data/lyrics.json`), and fonts remain subject to their respective owners' rights and licenses. The Arabic adaptation does not replace or cancel those rights.

Please credit **[mexicat/pdoom-video](https://github.com/mexicat/pdoom-video)** when sharing or adapting this project.

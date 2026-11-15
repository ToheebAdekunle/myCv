# FTX documentary video (Remotion)

Video project for *How a 30-Year-Old Lost $8 Billion Overnight*, built with [Remotion](https://www.remotion.dev/) 4.

## Setup

```bash
cd video
npm install
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Opens Remotion Studio to preview and edit compositions |
| `npm run still` | Renders frame 60 of `TitleCard` to `out/title-card.png` |
| `npm run render` | Renders `TitleCard` to `out/title-card.mp4` |
| `npm run render:sinking` | Renders the sinking-car Short to `out/sinking-car.mp4` |
| `npm run render:shadow` | Renders Vyrinx Short #1 "My Shadow Is Lazy" to `out/shadow-lazy.mp4` |
| `npm run typecheck` | Type-checks the project |

## Layout

- `src/index.ts`: entry point (`registerRoot`)
- `src/Root.tsx`: registers compositions (1920×1080, 30 fps)
- `src/TitleCard.tsx`: starter title card with editable props
- `src/sinking/`: Short #1, "Your Car Is Sinking" (1080×1920, 30 s, 3D with `@remotion/three`)
  - `timeline.ts`: car, people and timing; `World.tsx`: lake, camera and effects
  - `Car.tsx`, `Person.tsx`, `Buckle.tsx`: 3D models; `Overlay.tsx`: countdown and captions
- `public/`: put images, narration audio and music here and load them with `staticFile()`

## Browser

Remotion downloads its own headless Chrome on first render. If that download is blocked,
point it at an installed Chrome instead:

```bash
export REMOTION_BROWSER_EXECUTABLE=/path/to/chrome-headless-shell
```

On machines without a GPU, add `--gl=swangle` to render the 3D Shorts.

## Voiceover (sinking-car Short)

The narration is generated offline with [Kokoro TTS](https://github.com/thewh1teagle/kokoro-onnx)
(voice `am_michael`). The script fits each line to its scene and writes the caption timings to
`src/sinking/voice.json`:

```bash
python -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile
# download kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx "model-files-v1.0" release
.venv/bin/python scripts/make_voice.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin --voice am_michael
```

To use your own recording instead, replace the WAV files in `public/voice/sinking/` (one per scene).
Sound effects in `public/sfx/` were synthesised with ffmpeg.

## Vyrinx Short #1: My Shadow Is Lazy

The edit is timed to the narration in `src/vyrinx/shadow-lazy.json` (made by
`scripts/make_voice_vyrinx.py`, Tiko = Kokoro `am_puck`, shadow = `am_onyx` with a whisper effect).

1. Generate each shot from the prompts in the production doc and save it as
   `public/vyrinx/shadow-lazy/shots/NN.mp4` (or `.png`; stills get a slow push-in).
2. List it in `src/vyrinx/media.ts`, e.g. `5: "vyrinx/shadow-lazy/shots/05.mp4",`.
3. `npm run dev` to preview, `npm run render:shadow` to export.

Shots without media show a placeholder card, so the episode can be previewed at any stage.

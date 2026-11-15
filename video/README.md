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

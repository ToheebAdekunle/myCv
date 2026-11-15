"""Generate the narration for the sinking-car Short with Kokoro TTS (offline).

Usage:
  python scripts/make_voice.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin [--voice am_michael]

Writes one WAV per scene to public/voice/sinking/ and src/sinking/voice.json
with each scene's start frame, audio length and caption chunk timings.
Model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
"""
import argparse
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

FPS = 30
ROOT = Path(__file__).resolve().parent.parent

# (start frame, end frame, caption chunks). The narration is the chunks joined.
SCENES = [
    (0, 90, ["Your car just", "rolled into a lake."]),
    (90, 150, ["You have about", "*sixty seconds."]),
    (150, 270, ["Most people", "grab the door.", "*It won't open.", "The water is", "pushing it shut."]),
    (270, 360, ["And the engine", "is dragging", "the nose down."]),
    (360, 420, ["So:", "*seatbelt off."]),
    (420, 510, ["*Open the window", "now, before", "the power dies."]),
    (510, 600, ["Stuck?", "*Smash the side glass,", "not the windshield."]),
    (600, 655, ["*Kids out first."]),
    (655, 720, ["Then you."]),
    (720, 900, ["Because after", "one minute,", "that window", "*is underwater."]),
]


def trim(audio: np.ndarray, sr: int, thresh: float = 0.01) -> np.ndarray:
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    pad = int(0.03 * sr)
    return audio[max(0, idx[0] - pad): idx[-1] + pad]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--voices", required=True)
    ap.add_argument("--voice", default="am_michael")
    ap.add_argument("--speed", type=float, default=1.05)
    args = ap.parse_args()

    kokoro = Kokoro(args.model, args.voices)
    out_dir = ROOT / "public" / "voice" / "sinking"
    out_dir.mkdir(parents=True, exist_ok=True)
    scenes_out = []

    for i, (start, end, chunks) in enumerate(SCENES):
        text = " ".join(c.lstrip("*") for c in chunks)
        lead = 4  # frames of breath before the line
        window = (end - start - lead - 4) / FPS
        speed = args.speed
        for _ in range(4):
            audio, sr = kokoro.create(text, voice=args.voice, speed=speed, lang="en-us")
            audio = trim(audio, sr)
            dur = len(audio) / sr
            if dur <= window or speed >= 1.45:
                break
            speed = min(1.45, speed * dur / window * 1.03)
        name = f"{i:02d}.wav"
        sf.write(out_dir / name, audio, sr)

        # Caption timing: split the spoken length in proportion to characters.
        weights = [len(c.lstrip("*")) + 4 for c in chunks]
        total = sum(weights)
        t = start + lead
        caps = []
        spoken_frames = dur * FPS
        for c, w in zip(chunks, weights):
            length = spoken_frames * w / total
            caps.append({"from": round(t), "text": c.lstrip("*"), "hot": c.startswith("*")})
            t += length
        for j, cap in enumerate(caps):
            cap["to"] = caps[j + 1]["from"] if j + 1 < len(caps) else end
        caps[0]["from"] = start
        scenes_out.append({
            "file": f"voice/sinking/{name}",
            "from": start + lead,
            "frames": int(np.ceil(dur * FPS)),
            "speed": round(speed, 3),
            "captions": caps,
        })
        print(f"scene {i}: {dur:.2f}s / window {window:.2f}s at speed {speed:.2f} :: {text}")

    out = ROOT / "src" / "sinking" / "voice.json"
    out.write_text(json.dumps({"voice": args.voice, "scenes": scenes_out}, indent=2) + "\n")
    print("wrote", out)


if __name__ == "__main__":
    main()

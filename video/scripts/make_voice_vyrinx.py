"""Narration for Vyrinx Short #1 "My Shadow Is Lazy" (Kokoro TTS, offline).

Usage:
  python scripts/make_voice_vyrinx.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin

Writes one WAV per shot to public/vyrinx/shadow-lazy/voice/ and
src/vyrinx/shadow-lazy.json (shot timings + captions) for the Remotion edit.
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

FPS = 30
ROOT = Path(__file__).resolve().parent.parent
OUT_AUDIO = ROOT / "public" / "vyrinx" / "shadow-lazy" / "voice"
OUT_JSON = ROOT / "src" / "vyrinx" / "shadow-lazy.json"

# (shot number, narration, speaker, extra hold frames after the line)
SHOTS = [
    (1, "In my world, your shadow has a life of its own.", "tiko", 6),
    (2, "If it works hard, you get rich.", "tiko", 2),
    (3, "If it exercises, you get healthy. If it gets a job, you get the salary.", "tiko", 4),
    (4, "That's why the richest people in town never lift a finger.", "tiko", 8),
    (5, "My name is Tiko. And my shadow... is lazy.", "tiko", 12),
    (6, "I wake up at six to exercise. It stays in bed.", "tiko", 6),
    (7, "I took it to the gym. It lay on the floor the whole time.", "tiko", 10),
    (8, "Then my neighbor's shadow became a famous businessman.", "tiko", 2),
    (9, "Three weeks later, they bought a mansion.", "tiko", 10),
    (10, "So I trained mine. Expensive equipment. Business school. A personal coach.", "tiko", 6),
    (11, "Nothing worked.", "tiko", 18),
    (12, "Then one morning... my shadow was gone.", "tiko", 10),
    (13, "Under the bed. In the wardrobe. Behind the curtains. Nothing.", "tiko", 8),
    (14, "Then the police called.", "tiko", 8),
    (15, "My shadow had been arrested for stealing fifty million dollars from the National Shadow Bank.", "tiko", 10),
    (16, "But at the station, the police looked terrified.", "tiko", 8),
    (17, "It hadn't stolen anything. It was the richest shadow in the country. And it had been hiding the money... from me.", "tiko", 14),
    (18, "I looked down. Sunglasses. Tiny briefcase. It whispered:", "tiko", 10),
    (19, "You're fired.", "shadow", 45),
]
# Highlighted caption words
HOT = {"shadow", "rich.", "lazy.", "mansion.", "gone.", "police", "fifty", "million", "richest", "fired."}


def trim(audio, sr, thresh=0.01):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    pad = int(0.04 * sr)
    return audio[max(0, idx[0] - pad): idx[-1] + pad]


def chunks(text):
    """Split into caption chunks: break at punctuation, then balance long phrases into 2-3 words."""
    words = text.replace("...", "\u2026").split()
    phrases, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r"[.,?!:\u2026]$", w):
            phrases.append(cur)
            cur = []
    if cur:
        phrases.append(cur)
    out = []
    for ph in phrases:
        n = len(ph)
        parts = max(1, -(-n // 3))  # ceil(n / 3)
        size = -(-n // parts)
        for i in range(0, n, size):
            out.append(" ".join(ph[i:i + size]))
    return out


def whisperify(path: Path):
    """Darker, breathier, slightly echoing voice for the shadow."""
    tmp = path.with_suffix(".tmp.wav")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", str(path), "-af",
        "asetrate=24000*0.86,aresample=24000,atempo=1.0,highpass=f=120,"
        "aecho=0.8:0.6:60|120:0.3|0.2,volume=1.6",
        str(tmp)], check=True)
    tmp.replace(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--voices", required=True)
    ap.add_argument("--tiko-voice", default="am_puck")
    ap.add_argument("--shadow-voice", default="am_onyx")
    ap.add_argument("--speed", type=float, default=1.08)
    args = ap.parse_args()

    kokoro = Kokoro(args.model, args.voices)
    OUT_AUDIO.mkdir(parents=True, exist_ok=True)
    t = 0
    shots = []
    for num, text, speaker, hold in SHOTS:
        voice = args.tiko_voice if speaker == "tiko" else args.shadow_voice
        speed = args.speed if speaker == "tiko" else 0.8
        audio, sr = kokoro.create(text, voice=voice, speed=speed, lang="en-us")
        audio = trim(audio, sr)
        name = f"{num:02d}.wav"
        sf.write(OUT_AUDIO / name, audio, sr)
        if speaker == "shadow":
            whisperify(OUT_AUDIO / name)
            audio, sr = sf.read(OUT_AUDIO / name)
        dur_f = int(np.ceil(len(audio) / sr * FPS))
        lead = 3
        length = lead + dur_f + hold

        parts = chunks(text)
        weights = [len(p) + 3 for p in parts]
        total = sum(weights)
        caps, ct = [], t + lead
        for p, w in zip(parts, weights):
            caps.append({
                "from": round(ct),
                "text": p,
                "hot": any(word.lower() in HOT for word in p.split()),
            })
            ct += dur_f * w / total
        for j, c in enumerate(caps):
            c["to"] = caps[j + 1]["from"] if j + 1 < len(caps) else t + length
        shots.append({
            "shot": num, "from": t, "frames": length, "speaker": speaker,
            "audio": f"vyrinx/shadow-lazy/voice/{name}", "audioFrom": t + lead,
            "text": text, "captions": caps,
        })
        print(f"shot {num:2d}: {length / FPS:5.2f}s  {text}")
        t += length

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({"fps": FPS, "frames": t, "shots": shots}, indent=2) + "\n")
    print(f"total {t / FPS:.1f}s -> {OUT_JSON}")


if __name__ == "__main__":
    main()

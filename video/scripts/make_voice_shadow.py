"""Narration for "My Shadow Is Lazy" starring Toheeb (Kokoro TTS, offline; ElevenLabs later).

Usage:
  python scripts/make_voice_shadow.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin

Writes one WAV per shot to public/me/voice/ and
src/me/shadow.json (shot timings + captions) for the Remotion edit.
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
OUT_AUDIO = ROOT / "public" / "me" / "voice"
OUT_JSON = ROOT / "src" / "me" / "shadow.json"

# (shot number, narration, speaker, extra hold frames after the line)
# (shot number, narration as written, speaker, extra hold frames after the line)
SHOTS = [
    (1, 'In this world, your shadow has its own personality.', "tiko", 5),
    (2, 'If your shadow works hard, you become rich.', "tiko", 5),
    (3, 'If your shadow exercises, you become healthy.', "tiko", 5),
    (4, 'And if your shadow gets a job, you receive its salary.', "tiko", 5),
    (5, "That's why the richest people in town never do anything themselves.", "tiko", 5),
    (6, 'Their shadows run entire businesses.', "tiko", 5),
    (7, 'My name is Toheeb, and I have a serious problem.', "tiko", 5),
    (8, 'My shadow is lazy.', "tiko", 14),
    (9, 'Every morning, I wake up at 6 AM to exercise, but my shadow stays in bed.', "tiko", 5),
    (10, 'I tried taking it to the gym, but it spent the entire session lying on the floor.', "tiko", 5),
    (11, "One day, my neighbor's shadow became a famous businessman.", "tiko", 5),
    (12, 'Within three weeks, his family bought a mansion.', "tiko", 5),
    (13, 'I was jealous.', "tiko", 12),
    (14, 'So I decided to train my shadow.', "tiko", 5),
    (15, 'I bought it expensive gym equipment.', "tiko", 5),
    (16, 'I enrolled it in business school.', "tiko", 5),
    (17, 'I even hired a personal coach.', "tiko", 5),
    (18, 'Nothing worked.', "tiko", 18),
    (19, 'Then one morning, I woke up and discovered my shadow was missing.', "tiko", 5),
    (20, 'I searched everywhere. Under my bed, inside the wardrobe, even behind the curtains.', "tiko", 5),
    (21, 'Then my phone rang.', "tiko", 10),
    (22, 'It was the police.', "tiko", 8),
    (23, 'They told me my shadow had been arrested for stealing 50 million dollars from the national shadow bank.', "tiko", 5),
    (24, 'I rushed to the station.', "tiko", 5),
    (25, 'But when I arrived, the police were terrified.', "tiko", 5),
    (26, "Apparently, my shadow hadn't stolen anything.", "tiko", 5),
    (27, 'It had secretly become the richest shadow in the entire country.', "tiko", 5),
    (28, 'And it had been hiding all its money from me.', "tiko", 5),
    (29, 'I looked down.', "tiko", 12),
    (30, 'My shadow was standing behind me, wearing sunglasses and holding a tiny briefcase.', "tiko", 5),
    (31, 'Then it whispered:', "tiko", 12),
    (32, "You're fired.", "shadow", 50),
]
# Highlighted caption words
HOT = {"rich.", "healthy.", "salary.", "lazy.", "toheeb,", "mansion.", "jealous.", "missing.", "police.", "50", "million", "richest", "fired.", "terrified."}


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
    ap.add_argument("--tiko-voice", default="am_michael")
    ap.add_argument("--shadow-voice", default="am_onyx")
    ap.add_argument("--speed", type=float, default=1.1)
    args = ap.parse_args()

    kokoro = Kokoro(args.model, args.voices)
    OUT_AUDIO.mkdir(parents=True, exist_ok=True)
    t = 0
    shots = []
    for num, text, speaker, hold in SHOTS:
        voice = args.tiko_voice if speaker == "tiko" else args.shadow_voice
        speed = args.speed if speaker == "tiko" else 0.8
        spoken = text.replace("6 AM", "six A.M.").replace("50 million", "fifty million")
        audio, sr = kokoro.create(spoken, voice=voice, speed=speed, lang="en-us")
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
            "audio": f"me/voice/{name}", "audioFrom": t + lead,
            "text": text, "captions": caps,
        })
        print(f"shot {num:2d}: {length / FPS:5.2f}s  {text}")
        t += length

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({"fps": FPS, "frames": t, "shots": shots}, indent=2) + "\n")
    print(f"total {t / FPS:.1f}s -> {OUT_JSON}")


if __name__ == "__main__":
    main()

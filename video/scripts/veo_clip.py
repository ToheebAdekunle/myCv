#!/usr/bin/env python3
"""Animate a still into a 9:16 clip with Google Veo (Gemini API).

Needs GEMINI_API_KEY in the environment. Standard library only.

  python3 scripts/veo_clip.py --check
  python3 scripts/veo_clip.py --shot 8 --image public/me/vertical/hero-v.jpg \
      --prompt "..." [--model veo-3.1-fast-generate-preview] [--seconds 8]

Saves public/me/clips/NN.mp4 and prints the seconds generated, so cost =
seconds x the model's per-second price.
"""
import argparse, base64, json, mimetypes, os, sys, time, urllib.error, urllib.request

API = "https://generativelanguage.googleapis.com/v1beta"


def call(url, body=None, key=None, raw=False):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                                 headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:600]}")
    return data if raw else json.loads(data)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="only check the key and list Veo models")
    ap.add_argument("--shot", type=int)
    ap.add_argument("--image")
    ap.add_argument("--prompt")
    ap.add_argument("--model", default="veo-3.1-fast-generate-preview")
    ap.add_argument("--seconds", type=int, default=8)
    ap.add_argument("--out-dir", default="public/me/clips")
    a = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY is not set")

    models = call(f"{API}/models?pageSize=200", key=key)["models"]
    veo = [m["name"].split("/")[-1] for m in models if "veo" in m["name"]]
    print("Key OK. Veo models:", ", ".join(veo) or "none")
    if a.check:
        return
    if a.model not in veo:
        sys.exit(f"Model {a.model} not available to this key")

    mime = mimetypes.guess_type(a.image)[0] or "image/jpeg"
    img = base64.b64encode(open(a.image, "rb").read()).decode()
    body = {
        "instances": [{"prompt": a.prompt, "image": {"bytesBase64Encoded": img, "mimeType": mime}}],
        "parameters": {"aspectRatio": "9:16", "durationSeconds": a.seconds},
    }
    op = call(f"{API}/models/{a.model}:predictLongRunning", body, key)
    print("Started", op["name"])
    while not op.get("done"):
        time.sleep(10)
        op = call(f"{API}/{op['name']}", key=key)
        print(".", end="", flush=True)
    print()
    if "error" in op:
        sys.exit(f"Veo error: {op['error']}")
    samples = op["response"]["generateVideoResponse"].get("generatedSamples")
    if not samples:
        sys.exit(f"No video returned (filtered?): {json.dumps(op['response'])[:600]}")
    video = call(samples[0]["video"]["uri"], key=key, raw=True)
    os.makedirs(a.out_dir, exist_ok=True)
    out = os.path.join(a.out_dir, f"{a.shot:02d}.mp4")
    open(out, "wb").write(video)
    print(f"Saved {out} ({len(video)//1024} KB), model {a.model}, {a.seconds} s generated")


if __name__ == "__main__":
    main()

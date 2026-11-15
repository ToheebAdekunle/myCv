"""Animate one still into a 9:16 clip with Veo (Gemini API).

    python scripts/veo_clip.py --shot 8 --image public/me/vertical/hero-v.jpg \
        --prompt "..." [--model veo-3.1-fast-generate-preview] [--seconds 4]

Saves public/me/clips/NN.mp4. Needs GEMINI_API_KEY on a project with billing (Veo is paid-only).
"""
import argparse, base64, json, os, sys, time, urllib.request

API = "https://generativelanguage.googleapis.com/v1beta"


def call(url, key, body=None):
    req = urllib.request.Request(url, headers={"x-goog-api-key": key, "Content-Type": "application/json"},
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        return json.load(urllib.request.urlopen(req))
    except urllib.error.HTTPError as e:
        sys.exit(f"{e.code}: {e.read().decode()[:500]}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--shot", type=int, required=True)
    p.add_argument("--image", required=True)
    p.add_argument("--prompt", required=True)
    p.add_argument("--model", default="veo-3.1-fast-generate-preview")
    p.add_argument("--seconds", type=int, default=4)
    a = p.parse_args()
    key = os.environ["GEMINI_API_KEY"].strip().strip("\"'")  # tolerate a quoted secret

    img = base64.b64encode(open(a.image, "rb").read()).decode()
    body = {
        "instances": [{"prompt": a.prompt, "image": {"bytesBase64Encoded": img, "mimeType": "image/jpeg"}}],
        "parameters": {"aspectRatio": "9:16", "durationSeconds": a.seconds, "personGeneration": "allow_adult"},
    }
    op = call(f"{API}/models/{a.model}:predictLongRunning", key, body)
    print("started", op["name"])
    while not op.get("done"):
        time.sleep(10)
        op = call(f"{API}/{op['name']}", key)
        print(".", end="", flush=True)
    print()
    if "error" in op:
        sys.exit(op["error"])
    uri = op["response"]["generateVideoResponse"]["generatedSamples"][0]["video"]["uri"]
    out = f"public/me/clips/{a.shot:02d}.mp4"
    req = urllib.request.Request(uri, headers={"x-goog-api-key": key})
    open(out, "wb").write(urllib.request.urlopen(req).read())
    print("saved", out)


if __name__ == "__main__":
    main()

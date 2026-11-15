import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  OffthreadVideo,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CLIPS } from "./clips";
import data from "./shadow.json";
import { Fx, IMAGES, PLAN, Win } from "./shots";

export const SHADOW_ME_FRAMES = data.frames;

const FONT = "Inter, 'Arial Black', Arial, sans-serif";
const CARD_W = 1080;
const CARD_H = 1350;
const CARD_TOP = 250;
type Shot = (typeof data.shots)[number];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const has = (shot: Shot, fx: Fx) => PLAN[shot.shot].fx?.includes(fx) ?? false;

// Position an image so the given window fills the card.
const placement = (img: { w: number; h: number }, win: Win) => {
  const aspect = CARD_W / CARD_H;
  let winH = win.h * img.h;
  if (winH * aspect > img.w) winH = img.w / aspect;
  const winW = winH * aspect;
  const cx = Math.min(Math.max(win.x * img.w, winW / 2), img.w - winW / 2);
  const cy = Math.min(Math.max(win.y * img.h, winH / 2), img.h - winH / 2);
  const scale = CARD_H / winH;
  return { scale, left: CARD_W / 2 - cx * scale, top: CARD_H / 2 - cy * scale };
};

const lerpWin = (a: Win, b: Win, t: number): Win => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  h: a.h + (b.h - a.h) * t,
});

// ---------- Overlays ----------
const Coins: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  return (
    <>
      {new Array(22).fill(0).map((_, i) => {
        const start = random(`c${i}`) * frames * 0.6;
        const t = (f - start) / 40;
        if (t < 0 || t > 1.4) return null;
        const x = random(`cx${i}`) * CARD_W;
        const y = -80 + t * t * CARD_H * 0.9;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "radial-gradient(circle at 35% 30%, #fff3a6, #f5b700 55%, #b97a00)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.4)",
              color: "#8a5a00",
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `rotateY(${f * 12 + i * 40}deg)`,
            }}
          >
            $
          </div>
        );
      })}
    </>
  );
};

const MissingStamp: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 260 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          transform: `rotate(-10deg) scale(${2.2 - s * 1.2})`,
          opacity: s,
          border: "12px solid #e3262f",
          borderRadius: 18,
          padding: "14px 40px",
          color: "#e3262f",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 110,
          letterSpacing: 6,
          textAlign: "center",
          lineHeight: 1,
          background: "rgba(255,255,255,0.18)",
          textShadow: "0 4px 18px rgba(0,0,0,0.35)",
        }}
      >
        SHADOW
        <br />
        MISSING
      </div>
    </AbsoluteFill>
  );
};

const Phone: React.FC<{ caller: string; police?: boolean }> = ({ caller, police }) => {
  const f = useCurrentFrame();
  const vib = Math.sin(f * 2.2) * 6 * (Math.floor(f / 12) % 2 === 0 ? 1 : 0.2);
  const pulse = 1 + ((f % 30) / 30) * 0.6;
  return (
    <AbsoluteFill style={{ background: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 520,
          height: 1000,
          borderRadius: 70,
          background: police
            ? "linear-gradient(180deg,#1b2a57,#0b1027)"
            : "linear-gradient(180deg,#2a2f3a,#111318)",
          border: "10px solid #050608",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          transform: `translateX(${vib}px) rotate(${vib * 0.3}deg)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 140,
          fontFamily: FONT,
          color: "white",
        }}
      >
        <div style={{ fontSize: 34, opacity: 0.7 }}>Incoming call…</div>
        <div style={{ position: "relative", marginTop: 70, width: 200, height: 200 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 100,
              border: `6px solid ${police ? "#4da3ff" : "#3ddc84"}`,
              transform: `scale(${pulse})`,
              opacity: 2 - pulse * 1.5,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 100,
              background: police ? "#1f6fff" : "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 100,
            }}
          >
            {police ? "🚓" : "👤"}
          </div>
        </div>
        <div style={{ marginTop: 50, fontSize: police ? 70 : 52, fontWeight: 900, letterSpacing: police ? 4 : 0 }}>
          {caller}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 150, marginBottom: 110 }}>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: "#e3262f" }} />
          <div style={{ width: 120, height: 120, borderRadius: 60, background: "#3ddc84" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Siren: React.FC = () => {
  const f = useCurrentFrame();
  const red = Math.floor(f / 7) % 2 === 0;
  const c = red ? "rgba(255,30,50,0.55)" : "rgba(30,110,255,0.55)";
  return (
    <AbsoluteFill
      style={{
        boxShadow: `inset 0 0 220px 60px ${c}`,
        mixBlendMode: "screen",
      }}
    />
  );
};

const News: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = spring({ frame: f, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", fontFamily: FONT }}>
      <div style={{ transform: `translateX(${(1 - inn) * -1100}px)`, marginBottom: 40 }}>
        <div
          style={{
            display: "inline-block",
            background: "#e3262f",
            color: "white",
            fontWeight: 900,
            fontSize: 44,
            padding: "10px 28px",
            letterSpacing: 2,
          }}
        >
          BREAKING NEWS
        </div>
        <div
          style={{
            background: "white",
            color: "#111",
            fontWeight: 900,
            fontSize: 50,
            padding: "16px 28px",
            lineHeight: 1.1,
          }}
        >
          SHADOW ARRESTED: $50,000,000 STOLEN
        </div>
        <div
          style={{
            background: "#111",
            color: "#ffd21f",
            fontWeight: 700,
            fontSize: 34,
            padding: "10px 28px",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span style={{ display: "inline-block", transform: `translateX(${600 - f * 9}px)` }}>
            NATIONAL SHADOW BANK ROBBED • SUSPECT WEARS SUNGLASSES • OWNER &quot;HAD NO IDEA&quot; • NATIONAL SHADOW BANK ROBBED
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- One shot ----------
const ClipView: React.FC<{ shot: Shot; clip: { src: string; seconds: number } }> = ({ shot, clip }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shotSec = shot.frames / fps;
  const rate = clip.seconds < shotSec ? clip.seconds / shotSec : 1;
  const fired = has(shot, "fired");
  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={staticFile(clip.src)}
        muted
        playbackRate={rate}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {fired && (
        <AbsoluteFill
          style={{
            background: "radial-gradient(circle at 60% 40%, transparent 35%, rgba(80,0,140,0.6) 100%)",
            opacity: interpolate(f, [0, 10], [0, 1], clamp),
          }}
        />
      )}
      {has(shot, "news") && <News />}
      {has(shot, "siren") && <Siren />}
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const clip = CLIPS[shot.shot];
  const plan = PLAN[shot.shot];
  const img = IMAGES[plan.img];
  const t = interpolate(f, [0, shot.frames], [0, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const p = placement(img, lerpWin(plan.from, plan.to, t));
  if (clip) return <ClipView shot={shot} clip={clip} />;

  const shakeAmt = has(shot, "shake") ? interpolate(f, [0, 14], [18, 0], clamp) : 0;
  const sx = Math.sin(f * 3.1) * shakeAmt;
  const sy = Math.cos(f * 2.7) * shakeAmt;
  const pop = interpolate(f, [0, 6], [1.05, 1], clamp);
  const blur = has(shot, "whip") ? interpolate(f, [0, 7], [14, 0], clamp) : 0;
  const desat = has(shot, "desat") ? interpolate(f, [0, 20], [0, 0.85], clamp) : 0;
  const fired = has(shot, "fired");

  const imgEl = (extra: React.CSSProperties) => (
    <Img
      src={staticFile(img.src)}
      style={{
        position: "absolute",
        left: p.left,
        top: p.top,
        width: img.w * p.scale,
        height: img.h * p.scale,
        ...extra,
      }}
    />
  );

  return (
    <AbsoluteFill>
      {/* Blurred backdrop fills the frame around the card */}
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={staticFile(img.src)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `blur(40px) brightness(0.45) saturate(1.3) grayscale(${desat})`,
            transform: "scale(1.2)",
          }}
        />
      </AbsoluteFill>
      {/* Main card */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: CARD_TOP,
          width: CARD_W,
          height: CARD_H,
          overflow: "hidden",
          transform: `translate(${sx}px, ${sy}px) scale(${pop})`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {imgEl({ filter: `blur(${blur}px) grayscale(${desat})` })}
        {fired && (
          <AbsoluteFill
            style={{
              background: "radial-gradient(circle at 60% 40%, transparent 30%, rgba(80,0,140,0.65) 100%)",
              opacity: interpolate(f, [0, 10], [0, 1], clamp),
            }}
          />
        )}
        {has(shot, "coins") && <Coins frames={shot.frames} />}
        {has(shot, "news") && <News />}
        {has(shot, "missing") && <MissingStamp at={Math.round(shot.frames * 0.62)} />}
      </div>
      {has(shot, "phone") && <Phone caller="Unknown number" />}
      {has(shot, "police-call") && <Phone caller="POLICE" police />}
      {has(shot, "siren") && <Siren />}
    </AbsoluteFill>
  );
};

// ---------- Captions + title ----------
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  for (const shot of data.shots) {
    const cap = shot.captions.find((c) => f >= c.from && f < c.to);
    if (!cap) continue;
    const isShadow = shot.speaker === "shadow";
    const pop = spring({ frame: f - cap.from, fps, config: { damping: 14, stiffness: 220 } });
    return (
      <AbsoluteFill style={{ alignItems: "center" }}>
        <div
          style={{
            marginTop: isShadow ? 820 : 1640,
            padding: "0 60px",
            textAlign: "center",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: isShadow ? 160 : 86,
            lineHeight: 1.05,
            color: isShadow ? "#ecd4ff" : cap.hot ? "#ffd21f" : "white",
            WebkitTextStroke: isShadow ? "10px #14001f" : "12px black",
            paintOrder: "stroke fill",
            textShadow: isShadow
              ? "0 0 40px rgba(170,90,255,0.95), 0 0 100px rgba(120,40,220,0.8)"
              : "0 8px 18px rgba(0,0,0,0.5)",
            transform: `scale(${0.7 + pop * 0.3})`,
          }}
        >
          {cap.text}
        </div>
      </AbsoluteFill>
    );
  }
  return null;
};

const Title: React.FC = () => {
  const f = useCurrentFrame();
  const current = data.shots.find((s) => f >= s.from && f < s.from + s.frames);
  if (current && CLIPS[current.shot]) return null;
  return (
  <AbsoluteFill style={{ alignItems: "center" }}>
    <div
      style={{
        marginTop: 120,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 54,
        letterSpacing: 3,
        color: "white",
        WebkitTextStroke: "8px black",
        paintOrder: "stroke fill",
      }}
    >
      MY SHADOW IS <span style={{ color: "#ffd21f" }}>LAZY</span> 😴
    </div>
  </AbsoluteFill>
  );
};

// ---------- Sound effects per shot ----------
const sfxFor = (shot: Shot): { src: string; at: number; volume: number }[] => {
  const out: { src: string; at: number; volume: number }[] = [];
  if (has(shot, "coins")) out.push({ src: "me/sfx/coin.wav", at: 8, volume: 0.5 });
  if (has(shot, "whip")) out.push({ src: "me/sfx/whoosh.wav", at: 0, volume: 0.6 });
  if (has(shot, "missing")) out.push({ src: "me/sfx/stamp.wav", at: Math.round(shot.frames * 0.62), volume: 0.9 });
  if (has(shot, "phone") || has(shot, "police-call")) out.push({ src: "me/sfx/ring.wav", at: 0, volume: 0.45 });
  if (shot.shot === 22 || shot.shot === 24) out.push({ src: "me/sfx/siren.wav", at: 0, volume: 0.18 });
  if (has(shot, "fired")) out.push({ src: "me/sfx/boom.wav", at: 0, volume: 0.9 });
  return out;
};

export const ShadowMe: React.FC = () => {
  const f = useCurrentFrame();
  const end = data.frames;
  const black = interpolate(f, [end - 28, end - 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {data.shots.map((shot) => (
        <Sequence key={shot.shot} from={shot.from} durationInFrames={shot.frames}>
          <ShotView shot={shot} />
        </Sequence>
      ))}
      <Title />
      <Captions />
      {data.shots.map((shot) => (
        <Sequence key={`v${shot.shot}`} from={shot.audioFrom} layout="none">
          <Audio src={staticFile(shot.audio)} volume={shot.speaker === "shadow" ? 1.1 : 1} />
        </Sequence>
      ))}
      {data.shots.flatMap((shot) =>
        sfxFor(shot).map((s, i) => (
          <Sequence key={`s${shot.shot}-${i}`} from={shot.from + s.at} layout="none">
            <Audio src={staticFile(s.src)} volume={s.volume} />
          </Sequence>
        )),
      )}
      <AbsoluteFill style={{ backgroundColor: "black", opacity: black }} />
    </AbsoluteFill>
  );
};

import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SHOT_MEDIA } from "./media";
import data from "./shadow-lazy.json";

const FONT = "Inter, 'Arial Black', Arial, sans-serif";
type ShotData = (typeof data.shots)[number];

export const SHADOW_LAZY_FRAMES = data.frames;

// Media for a shot; the shadow's whisper (shot 19) reuses shot 18's picture.
const mediaFor = (shot: number) => SHOT_MEDIA[shot] ?? (shot === 19 ? SHOT_MEDIA[18] : undefined);

const Media: React.FC<{ src: string; frames: number }> = ({ src, frames }) => {
  const f = useCurrentFrame();
  const fill = { width: "100%", height: "100%", objectFit: "cover" as const };
  if (/\.(mp4|mov|webm)$/i.test(src)) {
    return <OffthreadVideo src={staticFile(src)} muted style={fill} />;
  }
  // Still image: slow push-in so it never looks frozen.
  const zoom = interpolate(f, [0, frames], [1.0, 1.08]);
  return <Img src={staticFile(src)} style={{ ...fill, transform: `scale(${zoom})` }} />;
};

const Placeholder: React.FC<{ shot: ShotData }> = ({ shot }) => {
  const label = shot.shot === 19 ? "SHOT 18 (cont.)" : `SHOT ${shot.shot}`;
  return (
    <AbsoluteFill>
      <Img
        src={staticFile("vyrinx/character-sheet.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(18px) brightness(0.45)",
          transform: "scale(1.15)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 330, fontFamily: FONT }}>
        <div style={{ color: "#ffb347", fontSize: 54, fontWeight: 900, letterSpacing: 4 }}>{label}</div>
        <div
          style={{
            marginTop: 26,
            color: "rgba(255,255,255,0.75)",
            fontSize: 34,
            fontWeight: 600,
            textAlign: "center",
            maxWidth: 860,
          }}
        >
          Add clip: public/vyrinx/shadow-lazy/shots/{String(shot.shot === 19 ? 18 : shot.shot).padStart(2, "0")}.mp4
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

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
            marginTop: isShadow ? 820 : 1220,
            padding: "0 70px",
            textAlign: "center",
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: isShadow ? 150 : 88,
            lineHeight: 1.05,
            color: isShadow ? "#e6c8ff" : cap.hot ? "#ffb347" : "white",
            WebkitTextStroke: isShadow ? "10px #14001f" : "13px black",
            paintOrder: "stroke fill",
            textShadow: isShadow
              ? "0 0 40px rgba(170,90,255,0.9), 0 0 90px rgba(120,40,220,0.7)"
              : "0 8px 18px rgba(0,0,0,0.45)",
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

export const ShadowLazy: React.FC = () => {
  const f = useCurrentFrame();
  const end = data.frames;
  // Fade to black on the last second for the punchline beat.
  const black = interpolate(f, [end - 30, end - 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {data.shots.map((shot) => {
        const src = mediaFor(shot.shot);
        return (
          <Sequence key={shot.shot} from={shot.from} durationInFrames={shot.frames}>
            {src ? <Media src={src} frames={shot.frames} /> : <Placeholder shot={shot} />}
          </Sequence>
        );
      })}
      {data.shots.map((shot) => (
        <Sequence key={`a${shot.shot}`} from={shot.audioFrom} layout="none">
          <Audio src={staticFile(shot.audio)} volume={shot.speaker === "shadow" ? 1.1 : 1} />
        </Sequence>
      ))}
      <Captions />
      <AbsoluteFill style={{ backgroundColor: "black", opacity: black }} />
    </AbsoluteFill>
  );
};

import voice from "./voice.json";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const FONT = "Inter, 'Arial Black', Arial, sans-serif";

type Cap = { from: number; to: number; text: string; hot?: boolean };

// Caption timings come from the generated narration (scripts/make_voice.py).
export const CAPTIONS: Cap[] = voice.scenes.flatMap((sc) => sc.captions);

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cap = CAPTIONS.find((c) => f >= c.from && f < c.to);
  if (!cap) return null;
  const pop = spring({ frame: f - cap.from, fps, config: { damping: 14, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center" }}>
      <div
        style={{
          marginTop: 1180,
          padding: "0 60px",
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 92,
          lineHeight: 1.05,
          color: cap.hot ? "#ffe14d" : "white",
          WebkitTextStroke: "14px black",
          paintOrder: "stroke fill",
          textShadow: "0 8px 18px rgba(0,0,0,0.45)",
          transform: `scale(${0.7 + pop * 0.3})`,
        }}
      >
        {cap.text}
      </div>
    </AbsoluteFill>
  );
};

// Countdown: starts at 1:00, ticks each second, freezes green at 0:31 when they surface.
export const Countdown: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FREEZE = 870;
  const secs = Math.max(31, 60 - Math.floor(Math.min(f, FREEZE) / fps));
  const frozen = f >= FREEZE;
  const sinceTick = frozen ? f - FREEZE : f % fps;
  const tickPulse = interpolate(sinceTick, [0, 8], [1.12, 1], { extrapolateRight: "clamp" });
  const appear = spring({ frame: f, fps, config: { damping: 200 } });
  const label = secs === 60 ? "1:00" : `0:${String(secs).padStart(2, "0")}`;
  const color = frozen ? "#2ee86b" : "#ff3b3b";
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          marginTop: 150,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "18px 44px",
          borderRadius: 999,
          background: "rgba(10,14,20,0.78)",
          border: `5px solid ${color}`,
          boxShadow: `0 0 40px ${color}88`,
          transform: `scale(${appear * tickPulse})`,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 96,
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span style={{ fontSize: 64 }}>{frozen ? "✓" : "⏱"}</span>
        {label}
      </div>
    </AbsoluteFill>
  );
};

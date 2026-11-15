import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const FONT = "Inter, 'Arial Black', Arial, sans-serif";

type Cap = { from: number; to: number; text: string; hot?: boolean };

export const CAPTIONS: Cap[] = [
  { from: 0, to: 38, text: "Your car just" },
  { from: 38, to: 90, text: "rolled into a lake." },
  { from: 90, to: 114, text: "You have about" },
  { from: 114, to: 150, text: "sixty seconds.", hot: true },
  { from: 150, to: 172, text: "Most people" },
  { from: 172, to: 200, text: "grab the door." },
  { from: 200, to: 228, text: "It won't open.", hot: true },
  { from: 228, to: 248, text: "The water is" },
  { from: 248, to: 270, text: "pushing it shut." },
  { from: 270, to: 300, text: "And the engine" },
  { from: 300, to: 325, text: "is dragging" },
  { from: 325, to: 360, text: "the nose down." },
  { from: 360, to: 376, text: "So:" },
  { from: 376, to: 420, text: "seatbelt off.", hot: true },
  { from: 420, to: 450, text: "Open the window", hot: true },
  { from: 450, to: 472, text: "now, before" },
  { from: 472, to: 510, text: "the power dies." },
  { from: 510, to: 530, text: "Stuck?" },
  { from: 530, to: 566, text: "Smash the side glass,", hot: true },
  { from: 566, to: 600, text: "not the windshield." },
  { from: 600, to: 660, text: "Kids out first.", hot: true },
  { from: 660, to: 720, text: "Then you." },
  { from: 720, to: 760, text: "Because after" },
  { from: 760, to: 800, text: "one minute," },
  { from: 800, to: 840, text: "that window" },
  { from: 840, to: 900, text: "is underwater.", hot: true },
];

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

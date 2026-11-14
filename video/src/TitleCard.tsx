import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

export const titleCardSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

export const TitleCard: React.FC<z.infer<typeof titleCardSchema>> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 200 } });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b0f14",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          color: "white",
          fontSize: 96,
          fontWeight: 800,
          textAlign: "center",
          maxWidth: 1500,
          lineHeight: 1.1,
          transform: `scale(${0.8 + pop * 0.2})`,
          opacity: pop,
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: "#4fd1c5",
          fontSize: 48,
          marginTop: 40,
          opacity: subtitleOpacity,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};

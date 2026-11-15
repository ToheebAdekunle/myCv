import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { BuckleInsert } from "./Buckle";
import { Captions, Countdown } from "./Overlay";
import { World } from "./World";

export const SinkingCar: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#86cdf2" }}>
      <ThreeCanvas width={width} height={height}>
        <World />
      </ThreeCanvas>
      <Sequence from={360} durationInFrames={60} layout="none">
        <AbsoluteFill>
          <BuckleInsert />
        </AbsoluteFill>
      </Sequence>
      <Countdown />
      <Captions />
    </AbsoluteFill>
  );
};

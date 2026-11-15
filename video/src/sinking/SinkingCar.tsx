import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { BuckleInsert } from "./Buckle";
import { Captions, Countdown } from "./Overlay";
import voice from "./voice.json";
import { World } from "./World";

const TICKS = Array.from({ length: 26 }, (_, i) => 90 + i * 30); // 0:57 .. 0:32

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at, src, volume }) => (
  <Sequence from={at} layout="none">
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

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

      {/* Narration */}
      {voice.scenes.map((sc) => (
        <Sequence key={sc.file} from={sc.from} durationInFrames={sc.frames + 6} layout="none">
          <Audio src={staticFile(sc.file)} volume={1} />
        </Sequence>
      ))}

      {/* Sound effects */}
      <Sfx at={56} src="sfx/splash.wav" volume={0.55} />
      <Sfx at={75} src="sfx/underwater.wav" volume={0.35} />
      {TICKS.map((t) => (
        <Sfx key={t} at={t} src="sfx/tick.wav" volume={0.18} />
      ))}
      <Sfx at={540} src="sfx/shatter.wav" volume={0.45} />
      <Sfx at={870} src="sfx/chime.wav" volume={0.5} />
    </AbsoluteFill>
  );
};

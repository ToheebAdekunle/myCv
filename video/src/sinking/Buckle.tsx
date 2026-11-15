import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { kf } from "./timeline";

// Close-up insert: seatbelt release (sequence-local frames 0..60).
const BuckleScene: React.FC = () => {
  const f = useCurrentFrame();
  const press = kf(f, [8, 16, 24], [0, 1, 0]);
  const slide = kf(f, [18, 40], [0, 1]);
  const strapUp = kf(f, [32, 58], [0, 1]);
  return (
    <>
      <color attach="background" args={["#163b52"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 6]} intensity={2.6} />
      <pointLight position={[-2, 1, 3]} intensity={8} color="#7fd6ff" />
      <group rotation={[0.2, -0.3, Math.PI / 2]} position={[0.1, 0.5, 0]} scale={0.9}>
        {/* Receptacle */}
        <mesh position={[-0.9, 0, 0]}>
          <boxGeometry args={[1.5, 0.55, 0.4]} />
          <meshStandardMaterial color="#1f2226" roughness={0.5} />
        </mesh>
        <mesh position={[-1.05, 0, 0.22 - press * 0.08]}>
          <boxGeometry args={[0.55, 0.32, 0.12]} />
          <meshStandardMaterial color="#e3262f" roughness={0.4} />
        </mesh>
        {/* Thumb */}
        <mesh position={[-1.05, 0.05, 0.6 - press * 0.22]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
          <meshStandardMaterial color="#f1b48f" roughness={0.6} />
        </mesh>
        {/* Tongue + belt */}
        <group position={[slide * 1.4, slide * 0.4 + strapUp * 3, 0]} rotation={[0, 0, slide * 0.5]}>
          <mesh position={[0.25, 0, 0]}>
            <boxGeometry args={[0.7, 0.36, 0.08]} />
            <meshStandardMaterial color="#d9dee4" metalness={0.9} roughness={0.15} />
          </mesh>
          <mesh position={[1.9, 0, 0]}>
            <boxGeometry args={[2.6, 0.4, 0.05]} />
            <meshStandardMaterial color="#2c3036" roughness={0.9} />
          </mesh>
        </group>
      </group>
    </>
  );
};

export const BuckleInsert: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0.4, 0.3, 6.5], fov: 42 }}
    >
      <BuckleScene />
    </ThreeCanvas>
  );
};

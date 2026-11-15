import { V3 } from "./timeline";

type Props = {
  pos: V3;
  shirt: string;
  skin?: string;
  hair: string;
  scale?: number;
  swim?: number; // 0 = sitting, 1 = swimming pose
  frame: number;
};

// Simple stylised figure: head, torso, arms.
export const Person: React.FC<Props> = ({
  pos,
  shirt,
  skin = "#f1b48f",
  hair,
  scale = 1,
  swim = 0,
  frame,
}) => {
  const stroke = Math.sin(frame / 4) * 0.9 * swim;
  return (
    <group position={pos} scale={scale} rotation={[0, 0, swim * 0.2]}>
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color={skin} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.2, -0.02]} scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.175, 24, 24]} />
        <meshStandardMaterial color={hair} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.22, 0]}>
        <capsuleGeometry args={[0.15, 0.3, 8, 16]} />
        <meshStandardMaterial color={shirt} roughness={0.6} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.2, -0.2, 0]}
          rotation={[0, 0, side * (0.15 + swim * 2.2 + stroke)]}
        >
          <capsuleGeometry args={[0.05, 0.3, 6, 10]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      ))}
    </group>
  );
};

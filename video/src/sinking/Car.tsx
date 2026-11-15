import { random } from "remotion";
import { kf, V3 } from "./timeline";

const SILVER = "#c3cad4";
const GLASS = "#9fd4ee";

type Props = { frame: number; pos: V3; tilt: number };

// Low-poly stylised sedan. Nose points +x, driver side faces +z (camera).
export const Car: React.FC<Props> = ({ frame: f, pos, tilt }) => {
  // X-ray view of the engine while "the engine drags the nose down".
  const xray = kf(f, [262, 280, 350, 368], [0, 1, 1, 0]);
  const bodyOpacity = 1 - xray * 0.65;
  const enginePulse = 0.6 + Math.sin(f / 4) * 0.4;

  // Driver window: slides halfway down, sticks, then is smashed.
  const glassDrop = kf(f, [425, 478], [0, 0.34]);
  const stuckSpark = kf(f, [478, 484, 500], [0, 1, 0]);
  const shatter = f >= 540;
  const toolX = kf(f, [512, 538], [0.05, 0.38]);
  const toolZ = kf(f, [512, 538], [0.3, 0.86]);
  const toolOn = f >= 508 && f < 560;

  const wheel = (x: number, z: number) => (
    <mesh position={[x, 0.36, z]} rotation={[Math.PI / 2, 0, 0]} key={`${x}${z}`}>
      <cylinderGeometry args={[0.38, 0.38, 0.28, 24]} />
      <meshStandardMaterial color="#202326" roughness={0.8} />
    </mesh>
  );

  const pillar = (x: number, z: number) => (
    <mesh position={[x, 1.6, z]} key={`p${x}${z}`}>
      <boxGeometry args={[0.1, 0.8, 0.1]} />
      <meshStandardMaterial color={SILVER} metalness={0.4} roughness={0.35} />
    </mesh>
  );

  return (
    <group position={pos} rotation={[0, 0, tilt]}>
      {/* Lower body */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[4, 0.9, 1.9]} />
        <meshStandardMaterial
          key={xray > 0 ? "xray" : "solid"}
          color={SILVER}
          metalness={0.45}
          roughness={0.3}
          transparent={xray > 0}
          opacity={bodyOpacity}
          depthWrite={xray === 0}
        />
      </mesh>
      {/* Bumpers, lights */}
      <mesh position={[2.02, 0.75, 0]}>
        <boxGeometry args={[0.08, 0.3, 1.7]} />
        <meshStandardMaterial color="#3b3f45" />
      </mesh>
      {[-0.65, 0.65].map((z) => (
        <mesh position={[2.04, 0.95, z]} key={`hl${z}`}>
          <boxGeometry args={[0.04, 0.16, 0.36]} />
          <meshStandardMaterial color="#fff6c8" emissive="#fff1a0" emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Door seam + handle on driver side */}
      <mesh position={[-0.2, 0.85, 0.952]}>
        <boxGeometry args={[0.02, 0.7, 0.01]} />
        <meshStandardMaterial color="#7d848e" />
      </mesh>
      <mesh position={[0.6, 1.0, 0.96]}>
        <boxGeometry args={[0.28, 0.06, 0.04]} />
        <meshStandardMaterial color="#6c737c" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Engine block, glows during the x-ray */}
      {xray > 0 && (
        <mesh position={[1.4, 0.78, 0]} scale={0.6 + xray * 0.4}>
          <boxGeometry args={[0.9, 0.6, 1.2]} />
          <meshStandardMaterial
            color="#ff7a1a"
            emissive="#ff5a00"
            emissiveIntensity={0.6 + enginePulse * 1.2}
          />
        </mesh>
      )}
      {/* Cabin: roof + pillars + glass, hollow so people show through */}
      <mesh position={[-0.2, 2.02, 0]}>
        <boxGeometry args={[2.35, 0.1, 1.75]} />
        <meshStandardMaterial color={SILVER} metalness={0.45} roughness={0.3} />
      </mesh>
      {[-1.35, -0.2, 0.95].flatMap((x) => [pillar(x, 0.83), pillar(x, -0.83)])}
      {/* Seats */}
      {[0.1, -1.0].map((x) => (
        <mesh position={[x - 0.15, 1.35, 0]} key={`seat${x}`}>
          <boxGeometry args={[0.16, 0.5, 1.3]} />
          <meshStandardMaterial color="#2d3742" />
        </mesh>
      ))}
      {/* Windscreen, rear glass, passenger-side glass */}
      <mesh position={[0.95, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.6, 0.75]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.28} side={2} />
      </mesh>
      <mesh position={[-1.35, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.6, 0.75]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.28} side={2} />
      </mesh>
      <mesh position={[-0.2, 1.6, -0.86]}>
        <planeGeometry args={[2.3, 0.75]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.3} side={2} />
      </mesh>
      {/* Rear driver-side window */}
      <mesh position={[-0.775, 1.6, 0.86]}>
        <planeGeometry args={[1.05, 0.72]} />
        <meshStandardMaterial color={GLASS} transparent opacity={0.3} side={2} />
      </mesh>
      {/* Driver window glass */}
      {!shatter && (
        <mesh position={[0.375, 1.6 - glassDrop, 0.88]}>
          <boxGeometry args={[1.05, 0.72, 0.02]} />
          <meshStandardMaterial color={GLASS} transparent opacity={0.38} />
        </mesh>
      )}
      {/* Stuck-window spark */}
      {stuckSpark > 0 && (
        <mesh position={[0.75, 1.25, 0.95]} scale={stuckSpark}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshBasicMaterial color="#fff27a" />
        </mesh>
      )}
      {/* Red glass-breaker tool */}
      {toolOn && (
        <group position={[toolX, 1.45, toolZ]} rotation={[Math.PI / 2.4, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.4, 12]} />
            <meshStandardMaterial color="#e3262f" />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <coneGeometry args={[0.05, 0.08, 12]} />
            <meshStandardMaterial color="#d0d4da" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}
      {/* Shards */}
      {shatter &&
        new Array(46).fill(0).map((_, i) => {
          const t = (f - 540) / 30;
          const rx = random(`sx${i}`) - 0.5;
          const ry = random(`sy${i}`) - 0.5;
          const spread = 1 - Math.exp(-t * 1.6);
          return (
            <mesh
              key={i}
              position={[
                0.375 + rx * 1.0 + rx * spread * 1.8,
                1.6 - 0.34 * 0.5 + ry * 0.4 + ry * spread * 1.2 - t * 0.15,
                0.9 + spread * (0.6 + random(`sz${i}`) * 1.4),
              ]}
              rotation={[t * (2 + i % 3), t * 3 * rx, t * 2]}
            >
              <boxGeometry args={[0.06, 0.06, 0.02]} />
              <meshStandardMaterial
                color="#d8f3ff"
                transparent
                opacity={Math.max(0, 0.85 - t * 0.35)}
                metalness={0.2}
                roughness={0.05}
              />
            </mesh>
          );
        })}
      {wheel(1.3, 0.85)}
      {wheel(1.3, -0.85)}
      {wheel(-1.3, 0.85)}
      {wheel(-1.3, -0.85)}
    </group>
  );
};

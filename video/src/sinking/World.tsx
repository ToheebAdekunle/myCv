import { useThree } from "@react-three/fiber";
import { Easing, random, useCurrentFrame } from "remotion";
import { Color, Fog, PerspectiveCamera } from "three";
import { Car } from "./Car";
import { Person } from "./Person";
import {
  add,
  carState,
  kf,
  lerp3,
  personPos,
  toWorld,
  V3,
  WINDOW_LOCAL,
} from "./timeline";

const SKY = new Color("#86cdf2");
const DEEP = new Color("#0e5a7c");
const DEEP_FOG = new Fog("#0e5a7c", 4, 26);

type Shot = { at: number; cam: (f: number) => { pos: V3; look: V3 } };

const win = (f: number) => toWorld(WINDOW_LOCAL, f);
const car = (f: number) => carState(f).pos;

// Camera keys; each key may follow moving targets. Blended with easing.
const SHOTS: Shot[] = [
  { at: 0, cam: () => ({ pos: [-2.2, 3.6, 12.5], look: [-2.6, 0.6, 0] }) },
  { at: 75, cam: (f) => ({ pos: [1.2, 2.6, 10], look: add(car(f), [0, 0.6, 0]) }) },
  { at: 150, cam: (f) => ({ pos: add(win(f), [0.7, 0.35, 3.0]), look: win(f) }) },
  { at: 195, cam: (f) => ({ pos: add(win(f), [3.6, -0.2, 3.4]), look: add(win(f), [0, -0.6, 0.6]) }) },
  { at: 255, cam: (f) => ({ pos: add(win(f), [3.3, -0.3, 3.0]), look: add(win(f), [0, -0.6, 0.6]) }) },
  { at: 295, cam: (f) => ({ pos: add(car(f), [0.4, 0.3, 13.5]), look: add(car(f), [0.4, 0.5, 0]) }) },
  { at: 360, cam: (f) => ({ pos: add(car(f), [0.4, 0.3, 13.5]), look: add(car(f), [0.4, 0.5, 0]) }) },
  { at: 420, cam: (f) => ({ pos: add(win(f), [0.5, 0.15, 2.7]), look: win(f) }) },
  { at: 595, cam: (f) => ({ pos: add(win(f), [0.6, 0.1, 3.1]), look: win(f) }) },
  { at: 680, cam: (f) => ({ pos: add(win(f), [1.8, 1.2, 5.5]), look: add(win(f), [0, 1.0, 0]) }) },
  {
    at: 820,
    cam: (f) => {
      const p = personPos("driver", f);
      return { pos: [p[0] + 0.8, p[1] - 0.6, p[2] + 5.2], look: [p[0], p[1] + 0.2, p[2]] };
    },
  },
  {
    at: 872,
    cam: (f) => {
      const p = personPos("driver", f);
      return { pos: [p[0] + 0.8, -1.2, p[2] + 6.5], look: [p[0], -0.4, p[2]] };
    },
  },
  { at: 900, cam: (f) => ({ pos: [car(f)[0] + 0.8, -1.6, 9], look: add(car(f), [0, 1, 0]) }) },
];

const cameraAt = (f: number) => {
  let i = 0;
  while (i < SHOTS.length - 1 && SHOTS[i + 1].at <= f) i++;
  const a = SHOTS[i];
  const b = SHOTS[Math.min(i + 1, SHOTS.length - 1)];
  const ca = a.cam(f);
  if (a === b) return ca;
  const cb = b.cam(f);
  const t = Easing.inOut(Easing.cubic)((f - a.at) / (b.at - a.at));
  return { pos: lerp3(ca.pos, cb.pos, t), look: lerp3(ca.look, cb.look, t) };
};

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const scene = useThree((s) => s.scene);
  const { pos, look } = cameraAt(frame);
  camera.fov = 42;
  camera.near = 0.05;
  camera.far = 200;
  camera.position.set(...pos);
  camera.lookAt(...look);
  camera.updateProjectionMatrix();
  const under = pos[1] < 0;
  scene.background = under ? DEEP : SKY;
  scene.fog = under ? DEEP_FOG : null;
  return null;
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  const { pos, tilt } = carState(f);

  const childP = personPos("child", f);
  const driverP = personPos("driver", f);
  const swimChild = kf(f, [620, 660], [0, 1]);
  const swimDriver = kf(f, [675, 715], [0, 1]);

  // Water-pressure arrows on the door.
  const arrows = kf(f, [180, 200, 262, 275], [0, 1, 1, 0]);
  const doorPt = toWorld([0.4, 0.95, 0.95], f);

  return (
    <>
      <CameraRig frame={f} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#dff4ff", "#20506a", 0.9]} />
      <directionalLight position={[5, 12, 8]} intensity={2.4} />

      {/* Lake surface (seen from above and below) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial
          color="#2b9ccc"
          transparent
          opacity={0.62}
          roughness={0.15}
          metalness={0.1}
          side={2}
        />
      </mesh>
      {/* Lake bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#5f6f4a" roughness={1} />
      </mesh>
      {/* Far shore so the top shot has a horizon */}
      <mesh position={[0, 1.5, -60]}>
        <boxGeometry args={[220, 3, 4]} />
        <meshStandardMaterial color="#4f9b52" roughness={1} />
      </mesh>

      {/* Jetty */}
      <mesh position={[-8, 0.42, 0]}>
        <boxGeometry args={[10, 0.16, 3]} />
        <meshStandardMaterial color="#9b6b43" roughness={0.9} />
      </mesh>
      {[-12, -9, -6, -3.3].flatMap((x) =>
        [-1.3, 1.3].map((z) => (
          <mesh position={[x, -1.5, z]} key={`post${x}${z}`}>
            <cylinderGeometry args={[0.12, 0.12, 4, 10]} />
            <meshStandardMaterial color="#6e4a2c" />
          </mesh>
        )),
      )}

      <Car frame={f} pos={pos} tilt={tilt} />

      <Person pos={driverP} shirt="#5aa9e6" hair="#2b1d14" frame={f} swim={swimDriver} />
      <Person
        pos={childP}
        shirt="#ffd21f"
        hair="#6b3b1d"
        scale={0.72}
        frame={f}
        swim={swimChild}
      />

      {/* Splash */}
      {f >= 56 && f < 115 &&
        new Array(70).fill(0).map((_, i) => {
          const t = (f - 56) / 30;
          const ang = random(`a${i}`) * Math.PI * 2;
          const sp = 1.2 + random(`s${i}`) * 2.2;
          const up = 3 + random(`u${i}`) * 3;
          const y = up * t - 4.9 * t * t;
          if (y < -0.2) return null;
          return (
            <mesh
              key={`sp${i}`}
              position={[1.6 + Math.cos(ang) * sp * t, y, Math.sin(ang) * sp * t]}
            >
              <sphereGeometry args={[0.07 + random(`r${i}`) * 0.08, 8, 8]} />
              <meshStandardMaterial color="#f2fbff" transparent opacity={0.9} />
            </mesh>
          );
        })}

      {/* Bubbles from the car once it is under */}
      {f > 95 &&
        new Array(40).fill(0).map((_, i) => {
          const period = 50 + random(`bp${i}`) * 40;
          const phase = ((f + random(`bo${i}`) * period) % period) / period;
          const origin = toWorld(
            [(random(`bx${i}`) - 0.5) * 3.6, 1.2 + random(`by${i}`) * 0.8, (random(`bz${i}`) - 0.5) * 2],
            f,
          );
          const y = origin[1] + phase * 4;
          if (y > -0.05) return null;
          return (
            <mesh key={`b${i}`} position={[origin[0] + Math.sin(phase * 9 + i) * 0.1, y, origin[2]]}>
              <sphereGeometry args={[0.035 + random(`bs${i}`) * 0.05, 8, 8]} />
              <meshStandardMaterial color="#e6faff" transparent opacity={0.55} />
            </mesh>
          );
        })}

      {/* Pressure arrows pushing the door shut */}
      {arrows > 0 &&
        [-0.6, 0, 0.6].flatMap((dx) =>
          [-0.25, 0.25].map((dy) => {
            const pulse = (Math.sin(f / 4 + dx * 3) + 1) * 0.12;
            const z = doorPt[2] + 0.25 + pulse;
            return (
              <group
                key={`ar${dx}${dy}`}
                position={[doorPt[0] + dx, doorPt[1] + dy, z]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={arrows}
              >
                <mesh position={[0, -0.45, 0]}>
                  <cylinderGeometry args={[0.06, 0.06, 0.8, 10]} />
                  <meshBasicMaterial color="#e9f6ff" />
                </mesh>
                <mesh position={[0, 0.08, 0]}>
                  <coneGeometry args={[0.16, 0.3, 16]} />
                  <meshBasicMaterial color="#5fd0ff" />
                </mesh>
              </group>
            );
          }),
        )}

      {/* Light shafts near the end */}
      {f > 700 &&
        [-3, -1.2, 0.8, 2.6].map((x, i) => (
          <mesh key={`ray${i}`} position={[x + driverP[0], -3, 1.5]} rotation={[0, 0, 0.18]}>
            <boxGeometry args={[0.5, 7, 0.02]} />
            <meshBasicMaterial color="#cdf3ff" transparent opacity={0.08 * kf(f, [700, 760], [0, 1])} />
          </mesh>
        ))}
    </>
  );
};

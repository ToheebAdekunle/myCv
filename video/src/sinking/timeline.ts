import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const DURATION = 900; // 30 s
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Interpolate with clamping and smooth in-out easing.
export const kf = (
  frame: number,
  input: number[],
  output: number[],
  ease: (t: number) => number = Easing.inOut(Easing.cubic),
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

export type V3 = [number, number, number];

// ---- Car state over time (world space). Water surface is y = 0. ----
export const carState = (f: number) => {
  // Roll along the jetty, tip off the end, splash down, then sink in stages.
  const x = kf(f, [0, 50], [-5.2, 0.4], Easing.in(Easing.quad));
  const y =
    f < 50
      ? 0.55
      : f < 75
        ? kf(f, [50, 75], [0.55, -1.25], Easing.in(Easing.quad))
        : kf(
            f,
            [75, 95, 270, 360, 510, 600, 720, 900],
            [-1.45, -1.05, -1.15, -1.5, -1.75, -2.3, -2.9, -8.5],
          );
  // Nose-down tilt (negative = nose down, nose points +x).
  const tilt =
    f < 50
      ? 0
      : kf(
          f,
          [50, 70, 95, 270, 350, 500, 600, 900],
          [0, -0.45, 0.06, -0.04, -0.32, -0.16, -0.12, -0.55],
        );
  const bob = f > 95 && f < 270 ? Math.sin(f / 9) * 0.04 : 0;
  return { pos: [x, y + bob, 0] as V3, tilt };
};

// Rotate a car-local point by the car tilt (about z) and offset by car position.
export const toWorld = (local: V3, f: number): V3 => {
  const { pos, tilt } = carState(f);
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  return [
    pos[0] + local[0] * c - local[1] * s,
    pos[1] + local[0] * s + local[1] * c,
    pos[2] + local[2],
  ];
};

// Driver's side window centre, car-local.
export const WINDOW_LOCAL: V3 = [0.375, 1.6, 0.9];

export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const lerp3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

// ---- People. Car-local while inside, then out through the window and up. ----
const childInside: V3 = [-0.75, 1.45, 0.25];
const driverInside: V3 = [0.35, 1.5, 0.3];
const windowOut: V3 = [0.375, 1.6, 1.6];

export const personPos = (who: "child" | "driver", f: number): V3 => {
  const [t0, t1] = who === "child" ? [600, 650] : [655, 705];
  const inside = who === "child" ? childInside : driverInside;
  if (f <= t0) return toWorld(inside, f);
  if (f <= t1) {
    // Through the window, still riding with the car.
    const t = kf(f, [t0, t1], [0, 1]);
    const mid: V3 = [0.375, 1.6, 0.85];
    const local =
      t < 0.5 ? lerp3(inside, mid, t * 2) : lerp3(mid, windowOut, (t - 0.5) * 2);
    return toWorld(local, f);
  }
  // Free swim to the surface, starting where they left the car.
  const start = toWorld(windowOut, t1);
  const surfaceAt = who === "child" ? 850 : 870;
  const sideways = who === "child" ? -0.5 : 0.5;
  const t = kf(f, [t1, surfaceAt], [0, 1], Easing.inOut(Easing.sin));
  const swimWobble = Math.sin(f / 5) * 0.06 * (1 - t);
  return [
    start[0] + sideways * t + swimWobble,
    start[1] + (-0.35 - start[1]) * t,
    start[2] + 0.6 * t,
  ];
};

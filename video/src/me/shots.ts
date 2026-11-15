// Visual plan for each narration line (shot numbers match shadow.json).
// Window: x, y = centre as a fraction of the image; h = fraction of image height shown.
export type Win = { x: number; y: number; h: number };
export type Fx =
  | "coins"
  | "shake"
  | "desat"
  | "missing"
  | "phone"
  | "police-call"
  | "news"
  | "siren"
  | "whip"
  | "fired";

export type ShotPlan = { img: string; from: Win; to: Win; fx?: Fx[] };

export const IMAGES = {
  hero: { src: "me/hd/hero.jpg", w: 3344, h: 1882 },
  dream: { src: "me/hd/01-dreaming.jpg", w: 2472, h: 984 },
  bed: { src: "me/hd/02-bed.jpg", w: 2499, h: 984 },
  gym: { src: "me/hd/03-gym.jpg", w: 2472, h: 813 },
  office: { src: "me/hd/04-office.jpg", w: 2499, h: 813 },
  mansion: { src: "me/hd/05-mansion.jpg", w: 2472, h: 957 },
  case: { src: "me/hd/06-briefcase.jpg", w: 2499, h: 957 },
} as const;
export type ImgKey = keyof typeof IMAGES;

const w = (x: number, y: number, h: number): Win => ({ x, y, h });

export const PLAN: Record<number, ShotPlan & { img: ImgKey }> = {
  1: { img: "hero", from: w(0.7, 0.5, 1), to: w(0.68, 0.38, 0.72) },
  2: { img: "office", from: w(0.68, 0.5, 1), to: w(0.68, 0.45, 0.8), fx: ["coins"] },
  3: { img: "gym", from: w(0.3, 0.5, 1), to: w(0.76, 0.5, 1) },
  4: { img: "office", from: w(0.25, 0.5, 1), to: w(0.68, 0.5, 1), fx: ["coins"] },
  5: { img: "mansion", from: w(0.52, 0.5, 1), to: w(0.6, 0.45, 0.82) },
  6: { img: "dream", from: w(0.58, 0.3, 0.62), to: w(0.58, 0.27, 0.5) },
  7: { img: "hero", from: w(0.35, 0.4, 0.78), to: w(0.35, 0.32, 0.6) },
  8: { img: "hero", from: w(0.72, 0.5, 1), to: w(0.68, 0.34, 0.55), fx: ["shake"] },
  9: { img: "bed", from: w(0.33, 0.5, 1), to: w(0.78, 0.5, 1) },
  10: { img: "gym", from: w(0.78, 0.55, 1), to: w(0.78, 0.5, 0.75) },
  11: { img: "mansion", from: w(0.62, 0.5, 0.95), to: w(0.62, 0.42, 0.62) },
  12: { img: "mansion", from: w(0.38, 0.5, 1), to: w(0.72, 0.5, 1) },
  13: { img: "mansion", from: w(0.17, 0.5, 1), to: w(0.17, 0.45, 0.7), fx: ["shake"] },
  14: { img: "dream", from: w(0.24, 0.5, 1), to: w(0.27, 0.42, 0.75) },
  15: { img: "gym", from: w(0.86, 0.45, 1), to: w(0.88, 0.42, 0.8) },
  16: { img: "office", from: w(0.22, 0.55, 1), to: w(0.25, 0.5, 0.8) },
  17: { img: "gym", from: w(0.3, 0.5, 1), to: w(0.3, 0.45, 0.75) },
  18: { img: "hero", from: w(0.35, 0.38, 0.62), to: w(0.35, 0.34, 0.5), fx: ["desat"] },
  19: { img: "bed", from: w(0.36, 0.45, 0.85), to: w(0.38, 0.42, 0.62), fx: ["missing"] },
  20: { img: "bed", from: w(0.18, 0.5, 1), to: w(0.9, 0.5, 1), fx: ["whip"] },
  21: { img: "hero", from: w(0.35, 0.4, 0.8), to: w(0.35, 0.38, 0.7), fx: ["phone"] },
  22: { img: "hero", from: w(0.35, 0.38, 0.7), to: w(0.35, 0.36, 0.62), fx: ["police-call", "siren"] },
  23: { img: "case", from: w(0.66, 0.42, 0.85), to: w(0.66, 0.38, 0.65), fx: ["news", "siren"] },
  24: { img: "hero", from: w(0.35, 0.4, 0.85), to: w(0.35, 0.32, 0.48), fx: ["whip", "siren"] },
  25: { img: "case", from: w(0.3, 0.45, 0.95), to: w(0.3, 0.45, 0.7), fx: ["siren", "shake"] },
  26: { img: "office", from: w(0.66, 0.45, 0.95), to: w(0.66, 0.4, 0.7) },
  27: { img: "dream", from: w(0.58, 0.3, 0.68), to: w(0.58, 0.27, 0.45), fx: ["coins"] },
  28: { img: "mansion", from: w(0.6, 0.5, 1), to: w(0.6, 0.45, 0.78) },
  29: { img: "case", from: w(0.3, 0.45, 1), to: w(0.3, 0.42, 0.72) },
  30: { img: "case", from: w(0.3, 0.5, 1), to: w(0.8, 0.5, 1) },
  31: { img: "case", from: w(0.62, 0.42, 0.85), to: w(0.6, 0.36, 0.6) },
  32: { img: "case", from: w(0.55, 0.45, 1), to: w(0.55, 0.4, 0.72), fx: ["fired", "shake"] },
};

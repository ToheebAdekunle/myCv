// Full-screen media by shot number (AI clips or vertical 9:16 stills).
// Clips: { src: "me/clips/07.mp4", seconds: 5 }  (shorter clips are slowed to fill the line)
// Stills: { src, focus: [x, y] (0-1), zoom: [from, to] }  (slow push toward the focus point)
export type ShotMedia = {
  src: string;
  seconds?: number;
  focus?: [number, number];
  zoom?: [number, number];
};

export const CLIPS: Record<number, ShotMedia> = {
  7: { src: "me/vertical/hero-v.jpg", focus: [0.33, 0.36], zoom: [1.0, 1.28] },
  8: { src: "me/vertical/hero-v.jpg", focus: [0.72, 0.4], zoom: [1.2, 1.55] },
  18: { src: "me/vertical/hero-v.jpg", focus: [0.32, 0.38], zoom: [1.35, 1.5] },
};

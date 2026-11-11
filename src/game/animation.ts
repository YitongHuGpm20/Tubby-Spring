export interface AnimationInfo {
  count: number;
  durations: number[];
  cell: number;
  keptBackground: number[];
  displayScale?: number;
  originX?: number;
  originY?: number;
}
export function animationFrame(
  info: AnimationInfo,
  timeSeconds: number,
  phaseSeconds = 0,
): number {
  const duration = info.durations.reduce((n, t) => n + t, 0);
  if (!duration) return 0;
  let t =
    ((((timeSeconds + phaseSeconds) * 1000) % duration) + duration) % duration;
  for (let i = 0; i < info.count; i++) {
    t -= info.durations[i] ?? duration / info.count;
    if (t < 0) return i;
  }
  return info.count - 1;
}

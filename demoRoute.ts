import type { Position } from './types';

// Ruta de ejemplo en Santo Domingo (aproximada, solo para la demo).
const WAYPOINTS: [number, number][] = [
  [18.4682, -69.9279],
  [18.4709, -69.9186],
  [18.4745, -69.9098],
  [18.4812, -69.902],
  [18.489, -69.908],
  [18.4795, -69.9215],
  [18.4682, -69.9279],
];
const STEPS_PER_LEG = 12;

export function buildDemoRoute(): Position[] {
  const out: Position[] = [];
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const [la1, lo1] = WAYPOINTS[i];
    const [la2, lo2] = WAYPOINTS[i + 1];
    for (let s = 0; s < STEPS_PER_LEG; s++) {
      const t = s / STEPS_PER_LEG;
      out.push({
        latitude: la1 + (la2 - la1) * t,
        longitude: lo1 + (lo2 - lo1) * t,
        speedKmh: 28 + Math.round(Math.random() * 14),
        satellites: 9,
        gpsPositioned: true,
      });
    }
  }
  return out;
}

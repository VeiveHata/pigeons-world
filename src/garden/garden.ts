// The home page garden, where fully grown plants can be planted.
// Positions are percentages of the garden's width (x) and height (y), so a plant keeps
// its spot at any screen size. (x, y) is where the bottom of the plant's image stands.

export type GardenSpot = { x: number; y: number };

// A plant in the garden: first placed in its pot (and still movable),
// then planted in the ground with the shovel, after which it stays put.
export type GardenPlace = GardenSpot & { planted: boolean };

// Plants stand on the ground: the lower part of the garden, away from the edges.
const MIN_X = 5;
const MAX_X = 95;
const MIN_Y = 52;
const MAX_Y = 97;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

// Rounded to 0.1% to keep saves small.
export const toSpot = (x: number, y: number): GardenSpot => ({
  x: Math.round(clamp(x, MIN_X, MAX_X) * 10) / 10,
  y: Math.round(clamp(y, MIN_Y, MAX_Y) * 10) / 10,
});

// Validates a garden place from saved data or an imported file.
// Places saved before planting existed count as still in their pot.
export function readPlace(value: unknown): GardenPlace | null {
  if (typeof value !== "object" || value === null) return null;
  const { x, y, planted } = value as Record<string, unknown>;
  if (typeof x !== "number" || typeof y !== "number") return null;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return { ...toSpot(x, y), planted: planted === true };
}

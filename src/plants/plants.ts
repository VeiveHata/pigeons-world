export const PLANTS = [
  { id: "echeveria", name: "Echeveria" },
  { id: "aloe", name: "Aloe" },
  { id: "jade", name: "Jade plant" },
  { id: "cactus", name: "Cactus" },
] as const;

export type PlantId = (typeof PLANTS)[number]["id"];

// One stage per level; after the last level the plant stays flowering.
export const STAGES = ["Seed", "Sprout", "Young", "Mature", "Flowering"];

export const plantName = (id: PlantId) =>
  PLANTS.find((p) => p.id === id)?.name ?? id;

export const stageFor = (level: number) => Math.min(level, STAGES.length);

export const stageName = (level: number) => STAGES[stageFor(level) - 1];

export const plantImage = (id: PlantId, level: number) =>
  `/plants/${id}/${stageFor(level)}.svg`;

export const PLANTS = [
  { id: "echeveria", name: "Echeveria", latin: "Echeveria elegans" },
  { id: "aloe", name: "Aloe", latin: "Aloe vera" },
  { id: "jade", name: "Jade plant", latin: "Crassula ovata" },
  { id: "cactus", name: "Cactus", latin: "Cereus peruvianus" },
  { id: "haworthia", name: "Haworthia", latin: "Haworthiopsis fasciata" },
  { id: "burros-tail", name: "Burro's tail", latin: "Sedum morganianum" },
  { id: "snake-plant", name: "Snake plant", latin: "Dracaena trifasciata" },
  { id: "lithops", name: "Living stones", latin: "Lithops lesliei" },
  { id: "agave", name: "Agave", latin: "Agave americana" },
  {
    id: "hens-and-chicks",
    name: "Hens and chicks",
    latin: "Sempervivum tectorum",
  },
] as const;

export type PlantId = (typeof PLANTS)[number]["id"];

// One stage per level; after the last level the plant stays flowering.
export const STAGES = ["Seed", "Sprout", "Young", "Mature", "Flowering"];

export const plantName = (id: PlantId) =>
  PLANTS.find((p) => p.id === id)?.name ?? id;

export const plantLatin = (id: PlantId) =>
  PLANTS.find((p) => p.id === id)?.latin ?? "";

export const stageFor = (level: number) => Math.min(level, STAGES.length);

// Reached the last stage (Flowering): can be planted in the home page garden.
export const isFullyGrown = (level: number) =>
  stageFor(level) === STAGES.length;

export const stageName = (level: number) => STAGES[stageFor(level) - 1];

export const plantImage = (id: PlantId, level: number) =>
  `/plants/${id}/${stageFor(level)}.svg`;

// A fully grown plant planted in the garden, without its pot.
export const plantGroundImage = (id: PlantId) => `/plants/${id}/ground.svg`;

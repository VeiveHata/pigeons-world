// Draws the placeholder plant art: one SVG per plant per growth stage.
// Real illustrations can replace these files later; keep the same paths.
// Run with: npm run plants
import { mkdir, writeFile } from "node:fs/promises";

const C = {
  outline: "#2F4B26",
  leafDark: "#7FA65E",
  leaf: "#B7D894",
  leafLight: "#E0F8C7",
  pot: "#C9B8E8",
  potRim: "#B3A0D6",
  soil: "#202734",
  seed: "#8A6E4B",
  trunk: "#6B5B45",
  flower: "#C9B8E8",
  flowerDeep: "#9B7FCF",
};
const BASE_X = 60;
const BASE_Y = 116;
const stroke = `stroke="${C.outline}" stroke-width="1.5" stroke-linejoin="round"`;

const pot = `
  <path d="M32 124 L88 124 L83 156 L37 156 Z" fill="${C.pot}" ${stroke}/>
  <rect x="27" y="114" width="66" height="12" rx="3" fill="${C.potRim}" ${stroke}/>
  <ellipse cx="60" cy="116" rx="29" ry="3" fill="${C.soil}"/>`;

const leafPath = (length, width) =>
  `M0 0 Q ${width} ${-length * 0.55} 0 ${-length} Q ${-width} ${-length * 0.55} 0 0 Z`;

const spikePath = (length, width) =>
  `M${-width} 0 Q ${-width * 0.5} ${-length * 0.6} 0 ${-length} Q ${width * 0.5} ${-length * 0.6} ${width} 0 Z`;

const spread = (n, from, to) =>
  n === 1 ? [0] : Array.from({ length: n }, (_, i) => from + ((to - from) * i) / (n - 1));

function flower(x, y, r = 5) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return `<ellipse cx="${x + Math.cos(a) * r}" cy="${y + Math.sin(a) * r}" rx="${r * 0.7}" ry="${r * 0.7}" fill="${C.flower}" ${stroke}/>`;
  }).join("");
  return `${petals}<circle cx="${x}" cy="${y}" r="${r * 0.6}" fill="${C.leafLight}" ${stroke}/>`;
}

// Stage 1 is the same for every plant: a seed with a tiny green tip.
const seed = `
  <ellipse cx="60" cy="114" rx="6" ry="4" fill="${C.seed}" ${stroke}/>
  <path d="M60 111 Q 58 104 63 101" fill="none" stroke="${C.leafDark}" stroke-width="2.5" stroke-linecap="round"/>`;

// ---- Echeveria: a rosette that gains leaf layers, then a flower stalk ----
const ECHEVERIA = {
  2: [{ n: 5, length: 16, width: 7, color: C.leaf }],
  3: [
    { n: 7, length: 26, width: 10, color: C.leafDark },
    { n: 4, length: 15, width: 7, color: C.leaf },
  ],
  4: [
    { n: 9, length: 36, width: 12, color: C.leafDark },
    { n: 7, length: 25, width: 9, color: C.leaf },
    { n: 3, length: 13, width: 6, color: C.leafLight },
  ],
};
ECHEVERIA[5] = ECHEVERIA[4];

function echeveria(stage) {
  let svg = "";
  if (stage === 5) {
    svg += `<path d="M64 108 Q 78 70 86 34" fill="none" stroke="${C.leafDark}" stroke-width="3" stroke-linecap="round"/>`;
    for (const [x, y] of [[86, 32], [82, 44], [89, 46], [78, 56]]) {
      svg += `<path d="M${x} ${y} l -4 7 h 8 z" fill="${C.flowerDeep}" ${stroke}/>`;
    }
  }
  for (const layer of ECHEVERIA[stage]) {
    for (const angle of spread(layer.n, -88, 88)) {
      svg += `<g transform="translate(60 112) rotate(${angle})"><path d="${leafPath(layer.length, layer.width)}" fill="${layer.color}" ${stroke}/></g>`;
    }
  }
  return svg;
}

// ---- Aloe: a fan of spiky leaves that grows taller, then a flower spike ----
const ALOE = {
  2: [{ n: 3, length: 24, width: 4 }],
  3: [{ n: 6, length: 42, width: 5.5 }],
  4: [
    { n: 8, length: 58, width: 7 },
    { n: 5, length: 40, width: 6 },
  ],
};
ALOE[5] = ALOE[4];

function aloe(stage) {
  let svg = "";
  if (stage === 5) {
    svg += `<path d="M60 112 L60 18" stroke="${C.leafDark}" stroke-width="3" stroke-linecap="round"/>`;
    for (let y = 16; y <= 44; y += 7) {
      svg += `<path d="M60 ${y} l -6 4 M60 ${y} l 6 4" stroke="${C.flowerDeep}" stroke-width="4" stroke-linecap="round"/>`;
    }
  }
  ALOE[stage].forEach((layer, li) => {
    for (const angle of spread(layer.n, -55, 55)) {
      const color = li === 0 ? C.leafDark : C.leaf;
      const dots = [0.3, 0.5, 0.7]
        .map((t) => `<circle cx="0" cy="${-layer.length * t}" r="1.2" fill="${C.leafLight}"/>`)
        .join("");
      svg += `<g transform="translate(60 116) rotate(${angle})"><path d="${spikePath(layer.length, layer.width)}" fill="${color}" ${stroke}/>${dots}</g>`;
    }
  });
  return svg;
}

// ---- Jade plant: a stem that becomes a branching little tree ----
const JADE = {
  2: {
    branches: [[60, 116, 60, 96, 3]],
    clusters: [[60, 95, 4, 0.8], [60, 106, 2, 0.7]],
  },
  3: {
    branches: [[60, 116, 60, 88, 5], [60, 100, 44, 82, 3], [60, 95, 76, 78, 3]],
    clusters: [[44, 80, 5, 1], [76, 76, 5, 1], [60, 86, 5, 1]],
  },
  4: {
    branches: [
      [60, 116, 60, 78, 7],
      [60, 102, 38, 82, 4], [38, 82, 30, 64, 3],
      [60, 92, 84, 72, 4], [84, 72, 92, 56, 3],
      [60, 80, 56, 58, 4],
    ],
    clusters: [[30, 62, 6, 1.15], [38, 82, 4, 1], [92, 54, 6, 1.15], [84, 72, 4, 1], [56, 56, 6, 1.2], [68, 72, 4, 1]],
  },
};
JADE[5] = JADE[4];

function jade(stage) {
  const { branches, clusters } = JADE[stage];
  let svg = branches
    .map(([x1, y1, x2, y2, w]) =>
      `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.trunk}" stroke-width="${w}" stroke-linecap="round"/>`)
    .join("");
  for (const [x, y, n, s] of clusters) {
    for (const angle of spread(n, -70, 70)) {
      svg += `<g transform="translate(${x} ${y}) rotate(${angle})"><ellipse cx="0" cy="${-6 * s}" rx="${4.5 * s}" ry="${6.5 * s}" fill="${C.leaf}" ${stroke}/></g>`;
    }
  }
  if (stage === 5) {
    for (const [x, y] of [[30, 50], [92, 42], [56, 42], [70, 60]]) svg += flower(x, y, 3.5);
  }
  return svg;
}

// ---- Cactus: a ball that becomes a column, grows an arm, then flowers ----
function ribs(x, top, width, bottom) {
  return [-0.25, 0, 0.25]
    .map((t) => `<path d="M${x + width * t} ${top + 6} L${x + width * t} ${bottom - 2}" stroke="${C.leafDark}" stroke-width="1.5"/>`)
    .join("");
}

function spines(x, top, width, bottom) {
  let svg = "";
  for (let y = top + 8; y < bottom - 4; y += 9) {
    for (const t of [-0.38, -0.12, 0.12, 0.38]) {
      svg += `<path d="M${x + width * t - 1.5} ${y} l3 0 M${x + width * t} ${y - 1.5} l0 3" stroke="${C.leafLight}" stroke-width="1"/>`;
    }
  }
  return svg;
}

function cactus(stage) {
  const body = (x, top, width, bottom) =>
    `<rect x="${x - width / 2}" y="${top}" width="${width}" height="${bottom - top}" rx="${width / 2}" fill="${C.leaf}" ${stroke}/>` +
    ribs(x, top, width, bottom) +
    spines(x, top, width, bottom);

  if (stage === 2) return body(60, 96, 22, 118);
  if (stage === 3) return body(60, 70, 26, 118);
  let svg =
    `<path d="M48 96 L36 96 Q 30 96 30 90 L30 74" fill="none" stroke="${C.outline}" stroke-width="13.5" stroke-linecap="round"/>` +
    `<path d="M48 96 L36 96 Q 30 96 30 90 L30 74" fill="none" stroke="${C.leaf}" stroke-width="10.5" stroke-linecap="round"/>` +
    body(60, 48, 30, 118);
  if (stage === 5) svg += flower(60, 46, 6) + flower(30, 68, 4);
  return svg;
}

const DRAW = { echeveria, aloe, jade, cactus };

for (const [id, draw] of Object.entries(DRAW)) {
  const dir = new URL(`../public/plants/${id}/`, import.meta.url).pathname;
  await mkdir(dir, { recursive: true });
  for (let stage = 1; stage <= 5; stage++) {
    // Pot first, then the plant, so leaves overlap the pot rim.
    const plant = stage === 1 ? seed : draw(stage);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="120" height="160">${pot}${plant}</svg>\n`;
    await writeFile(`${dir}${stage}.svg`, svg);
  }
}

console.log("Placeholder plants written to public/plants/");

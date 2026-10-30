// Draws the placeholder plant art: one SVG per plant per growth stage (in a pot),
// plus ground.svg: the fully grown plant planted in the garden, without its pot.
// Real illustrations can replace these files later; keep the same paths.
// Run with: npm run plants
import { mkdir, writeFile } from "node:fs/promises";
import { colors } from "../src/theme/colors.js";

// Plant parts mapped to theme colours (src/theme/colors.js).
const C = {
  outline: colors["green-dark"],
  leafDark: colors["green-mid"],
  leaf: colors["green-light"],
  leafLight: colors["green-pale"],
  pot: colors.lilac,
  potRim: colors["lilac-shade"],
  soil: colors.navy,
  seed: colors.seed,
  trunk: colors.trunk,
  flower: colors.lilac,
  flowerDeep: colors["lilac-deep"],
  sage: colors["succulent-sage"],
  mint: colors["succulent-mint"],
  blush: colors["succulent-blush"],
  peach: colors["succulent-peach"],
  teal: colors["pigeon-teal"],
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
  n === 1
    ? [0]
    : Array.from({ length: n }, (_, i) => from + ((to - from) * i) / (n - 1));

function flower(x, y, r = 5, color = C.flower) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return `<ellipse cx="${x + Math.cos(a) * r}" cy="${y + Math.sin(a) * r}" rx="${r * 0.7}" ry="${r * 0.7}" fill="${color}" ${stroke}/>`;
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
    svg += `<path d="M64 108 Q 78 70 86 34" fill="none" stroke="${C.outline}" stroke-width="2.5" stroke-linecap="round"/>`;
    for (const [x, y] of [
      [86, 32],
      [82, 44],
      [89, 46],
      [78, 56],
    ]) {
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
        .map(
          (t) =>
            `<circle cx="0" cy="${-layer.length * t}" r="1.2" fill="${C.leafLight}"/>`,
        )
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
    clusters: [
      [60, 95, 4, 0.8],
      [60, 106, 2, 0.7],
    ],
  },
  3: {
    branches: [
      [60, 116, 60, 88, 5],
      [60, 100, 44, 82, 3],
      [60, 95, 76, 78, 3],
    ],
    clusters: [
      [44, 80, 5, 1],
      [76, 76, 5, 1],
      [60, 86, 5, 1],
    ],
  },
  4: {
    branches: [
      [60, 116, 60, 78, 7],
      [60, 102, 38, 82, 4],
      [38, 82, 30, 64, 3],
      [60, 92, 84, 72, 4],
      [84, 72, 92, 56, 3],
      [60, 80, 56, 58, 4],
    ],
    clusters: [
      [30, 62, 6, 1.15],
      [38, 82, 4, 1],
      [92, 54, 6, 1.15],
      [84, 72, 4, 1],
      [56, 56, 6, 1.2],
      [68, 72, 4, 1],
    ],
  },
};
JADE[5] = JADE[4];

function jade(stage) {
  const { branches, clusters } = JADE[stage];
  let svg = branches
    .map(
      ([x1, y1, x2, y2, w]) =>
        `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.trunk}" stroke-width="${w}" stroke-linecap="round"/>`,
    )
    .join("");
  for (const [x, y, n, s] of clusters) {
    for (const angle of spread(n, -70, 70)) {
      svg += `<g transform="translate(${x} ${y}) rotate(${angle})"><ellipse cx="0" cy="${-6 * s}" rx="${4.5 * s}" ry="${6.5 * s}" fill="${C.leaf}" ${stroke}/></g>`;
    }
  }
  if (stage === 5) {
    for (const [x, y] of [
      [30, 50],
      [92, 42],
      [56, 42],
      [70, 60],
    ])
      svg += flower(x, y, 3.5);
  }
  return svg;
}

// ---- Cactus: a ball that becomes a column, grows an arm, then flowers ----
function ribs(x, top, width, bottom) {
  return [-0.25, 0, 0.25]
    .map(
      (t) =>
        `<path d="M${x + width * t} ${top + 6} L${x + width * t} ${bottom - 2}" stroke="${C.leafDark}" stroke-width="1.5"/>`,
    )
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

// ---- Haworthia: a small rosette of upright pointed leaves with white bands ----
const HAWORTHIA = {
  2: [{ n: 4, length: 22, width: 5 }],
  3: [
    { n: 7, length: 34, width: 6 },
    { n: 4, length: 22, width: 5 },
  ],
  4: [
    { n: 9, length: 46, width: 7 },
    { n: 6, length: 33, width: 6 },
    { n: 3, length: 20, width: 5 },
  ],
};
HAWORTHIA[5] = HAWORTHIA[4];

function haworthia(stage) {
  let svg = "";
  if (stage === 5) {
    svg += `<path d="M62 108 Q 74 62 68 18" fill="none" stroke="${C.leafDark}" stroke-width="2" stroke-linecap="round"/>`;
    for (const [x, y] of [
      [68, 18],
      [71, 30],
      [72, 42],
      [71, 54],
    ]) {
      svg += `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="2.4" fill="${C.leafLight}" ${stroke}/>`;
    }
  }
  HAWORTHIA[stage].forEach((layer, li) => {
    for (const angle of spread(layer.n, -52, 52)) {
      const bands = [0.3, 0.48, 0.66]
        .map((t) => {
          const half = layer.width * (1 - t) * 0.8;
          return `<path d="M${-half} ${-layer.length * t} h ${half * 2}" stroke="${C.leafLight}" stroke-width="1.6" stroke-linecap="round"/>`;
        })
        .join("");
      svg += `<g transform="translate(60 116) rotate(${angle})"><path d="${spikePath(layer.length, layer.width)}" fill="${li === 0 ? C.leafDark : C.leaf}" ${stroke}/>${bands}</g>`;
    }
  });
  return svg;
}

// ---- Burro's tail: stems hung with plump beads that trail over the pot ----
// Each stem is a curve [x0, y0, cx, cy, x1, y1] with beads along it.
const BURROS = {
  2: [[60, 114, 54, 98, 44, 114]],
  3: [
    [60, 114, 48, 90, 32, 118],
    [60, 114, 72, 90, 88, 120],
  ],
  4: [
    [60, 114, 44, 86, 26, 124],
    [60, 114, 76, 86, 94, 126],
    [60, 114, 54, 92, 48, 134],
    [60, 114, 68, 94, 76, 138],
  ],
};
BURROS[5] = BURROS[4];
// Planted in the ground there's no pot rim to hang over, so the stems arch and rest on the soil.
const BURROS_GROUND = [
  [60, 114, 44, 88, 22, 114],
  [60, 114, 76, 88, 98, 114],
  [60, 114, 50, 82, 38, 102],
  [60, 114, 70, 82, 82, 102],
  [60, 114, 60, 80, 60, 94],
];

function burros(stage, ground = false) {
  let svg = "";
  const stems = ground ? BURROS_GROUND : BURROS[stage];
  const along = (stem, t) => {
    const [x0, y0, cx, cy, x1, y1] = stem;
    return [
      (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1,
      (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1,
    ];
  };
  for (const [x0, y0, cx, cy, x1, y1] of stems) {
    svg += `<path d="M${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}" fill="none" stroke="${C.trunk}" stroke-width="1.6"/>`;
  }
  // Beads cover the stems, thicker and plumper towards the tips.
  for (const [si, stem] of stems.entries()) {
    const beads = stage === 2 ? 5 : 9;
    for (let b = 1; b <= beads; b++) {
      const [x, y] = along(stem, b / beads);
      const r = 2.6 + (b / beads) * 1.3;
      svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${(si + b) % 2 ? C.leaf : C.sage}" ${stroke}/>`;
    }
  }
  if (stage === 5) {
    for (const stem of stems) {
      const [x, y] = along(stem, 1);
      svg += flower(x, y + 3, 3, C.blush);
    }
  }
  return svg;
}

// ---- Snake plant: stiff upright sword leaves with wavy cross bands ----
const SNAKE = {
  2: [
    { angle: -5, length: 30, width: 5 },
    { angle: 6, length: 26, width: 5 },
  ],
  3: [
    { angle: -16, length: 44, width: 6 },
    { angle: -4, length: 56, width: 7 },
    { angle: 7, length: 50, width: 6 },
    { angle: 18, length: 38, width: 6 },
  ],
  4: [
    { angle: -24, length: 52, width: 7 },
    { angle: -12, length: 72, width: 8 },
    { angle: -2, length: 92, width: 9 },
    { angle: 8, length: 80, width: 8 },
    { angle: 17, length: 62, width: 7 },
    { angle: 27, length: 46, width: 6 },
  ],
};
SNAKE[5] = SNAKE[4];

function snake(stage) {
  let svg = "";
  if (stage === 5) {
    svg += `<path d="M66 110 Q 76 70 72 22" fill="none" stroke="${C.leafDark}" stroke-width="2.4" stroke-linecap="round"/>`;
    for (let y = 24; y < 70; y += 9) {
      svg += `<path d="M${72 - (y - 24) * 0.05} ${y} l -4 3 M${72 - (y - 24) * 0.05} ${y} l 4 3" stroke="${C.mint}" stroke-width="3" stroke-linecap="round"/>`;
    }
  }
  for (const [i, leaf] of SNAKE[stage].entries()) {
    const bands = Array.from(
      { length: Math.floor(leaf.length / 10) },
      (_, k) => {
        const y = -8 - k * 10;
        const half = leaf.width * (1 - -y / leaf.length) * 0.85;
        return `<path d="M${-half} ${y} q ${half / 2} -3 ${half} 0 t ${half} 0" fill="none" stroke="${C.leafDark}" stroke-width="1.3"/>`;
      },
    ).join("");
    svg += `<g transform="translate(${60 + (i - SNAKE[stage].length / 2) * 1.5} 116) rotate(${leaf.angle})"><path d="${spikePath(leaf.length, leaf.width)}" fill="${C.leaf}" ${stroke}/>${bands}</g>`;
  }
  return svg;
}

// ---- Lithops: "living stones", pairs of split pebbles that gain size, then flower ----
const LITHOPS = {
  2: [[60, 5.5]],
  3: [
    [48, 8],
    [74, 6],
  ],
  4: [
    [44, 11],
    [76, 10],
    [60, 6],
  ],
};
LITHOPS[5] = LITHOPS[4];

function lithops(stage) {
  let svg = "";
  for (const [x, r] of LITHOPS[stage]) {
    const y = 113 - r * 0.7;
    svg += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.72}" fill="${C.sage}" ${stroke}/>`;
    svg += `<path d="M${x} ${y - r * 0.6} Q ${x - 1.5} ${y} ${x} ${y + r * 0.7}" fill="none" stroke="${C.outline}" stroke-width="1.6"/>`;
    for (const [dx, dy] of [
      [-0.5, -0.2],
      [0.45, -0.25],
      [-0.35, 0.25],
      [0.4, 0.2],
    ]) {
      svg += `<circle cx="${x + dx * r}" cy="${y + dy * r * 0.7}" r="${Math.max(0.9, r * 0.1)}" fill="${C.trunk}"/>`;
    }
  }
  if (stage === 5) {
    for (const [x, y, size] of [
      [44, 94, 9],
      [76, 96, 8],
    ]) {
      svg += `<path d="M${x} ${y + size} L${x} ${y + 14}" stroke="${C.leafDark}" stroke-width="2"/>`;
      const petals = Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return `<ellipse cx="${x + Math.cos(a) * size * 0.55}" cy="${y + Math.sin(a) * size * 0.55}" rx="${size * 0.5}" ry="${size * 0.14}" transform="rotate(${(a * 180) / Math.PI} ${x + Math.cos(a) * size * 0.55} ${y + Math.sin(a) * size * 0.55})" fill="${C.leafLight}" ${stroke}/>`;
      }).join("");
      svg += `${petals}<circle cx="${x}" cy="${y}" r="${size * 0.22}" fill="${C.flowerDeep}" ${stroke}/>`;
    }
  }
  return svg;
}

// ---- Agave: a wide rosette of thick teal leaves, then a tall flowering stalk ----
const AGAVE = {
  2: [{ n: 5, length: 22, width: 7 }],
  3: [
    { n: 7, length: 34, width: 9 },
    { n: 4, length: 22, width: 7 },
  ],
  4: [
    { n: 9, length: 48, width: 12 },
    { n: 7, length: 36, width: 10 },
    { n: 4, length: 22, width: 7 },
  ],
};
AGAVE[5] = AGAVE[4];

function agave(stage) {
  let svg = "";
  if (stage === 5) {
    svg += `<path d="M60 112 L60 10" stroke="${C.trunk}" stroke-width="3.5" stroke-linecap="round"/>`;
    for (const [y, len] of [
      [14, 9],
      [24, 13],
      [36, 16],
    ]) {
      svg += `<path d="M60 ${y + 6} Q ${60 - len} ${y + 4} ${60 - len} ${y - 4} M60 ${y + 6} Q ${60 + len} ${y + 4} ${60 + len} ${y - 4}" fill="none" stroke="${C.trunk}" stroke-width="2"/>`;
      for (const x of [60 - len, 60 + len]) {
        svg += `<circle cx="${x}" cy="${y - 5}" r="3.4" fill="${C.flowerDeep}" ${stroke}/>`;
      }
    }
  }
  AGAVE[stage].forEach((layer, li) => {
    for (const angle of spread(layer.n, -80, 80)) {
      const color = li === 0 ? C.teal : li === 1 ? C.leafDark : C.leaf;
      const tip = `<path d="M-1.6 ${-layer.length + 4} L0 ${-layer.length - 3} L1.6 ${-layer.length + 4} Z" fill="${C.trunk}"/>`;
      const teeth = [0.35, 0.55, 0.75]
        .map(
          (t) =>
            `<path d="M${-layer.width * 0.7} ${-layer.length * t} l-2 -2 M${layer.width * 0.7} ${-layer.length * t} l2 -2" stroke="${C.leafLight}" stroke-width="1"/>`,
        )
        .join("");
      svg += `<g transform="translate(60 114) rotate(${angle})"><path d="${leafPath(layer.length, layer.width)}" fill="${color}" ${stroke}/>${teeth}${tip}</g>`;
    }
  });
  return svg;
}

// ---- Hens and chicks: a pointed rosette with pink tips, and baby rosettes around it ----
function rosette(cx, cy, scale, rings) {
  let svg = "";
  for (const ring of rings) {
    for (const angle of spread(ring.n, -84, 84)) {
      const length = ring.length * scale;
      const width = ring.width * scale;
      svg += `<g transform="translate(${cx} ${cy}) rotate(${angle})"><path d="${leafPath(length, width)}" fill="${ring.color}" ${stroke}/><path d="M${-width * 0.35} ${-length * 0.78} Q 0 ${-length * 1.03} ${width * 0.35} ${-length * 0.78} Q 0 ${-length * 0.7} ${-width * 0.35} ${-length * 0.78} Z" fill="${C.blush}"/></g>`;
    }
  }
  return svg;
}

const HENS = {
  2: { main: [{ n: 5, length: 16, width: 6, color: C.sage }], chicks: [] },
  3: {
    main: [
      { n: 7, length: 26, width: 8, color: C.leafDark },
      { n: 4, length: 15, width: 6, color: C.sage },
    ],
    chicks: [[32, 110, 0.35]],
  },
  4: {
    main: [
      { n: 9, length: 34, width: 10, color: C.leafDark },
      { n: 7, length: 24, width: 8, color: C.sage },
      { n: 3, length: 13, width: 5, color: C.leaf },
    ],
    chicks: [
      [30, 110, 0.4],
      [90, 110, 0.4],
      [44, 114, 0.28],
    ],
  },
};
HENS[5] = HENS[4];

function hens(stage) {
  let svg = "";
  const { main, chicks } = HENS[stage];
  if (stage === 5) {
    svg += `<path d="M60 108 L60 38" stroke="${C.leafDark}" stroke-width="3" stroke-linecap="round"/>`;
    for (const [x, y] of [
      [60, 34],
      [53, 42],
      [67, 42],
      [49, 52],
      [71, 52],
      [60, 24],
    ]) {
      svg += `<path d="M${x} ${y} l -5 -2 l 3 -5 l 5 2 l 3 5 z" fill="${C.flowerDeep}" ${stroke}/>`;
    }
  }
  for (const [x, y, scale] of chicks) svg += rosette(x, y, scale, main);
  svg += rosette(60, 114, 1, main);
  return svg;
}

const DRAW = {
  echeveria,
  aloe,
  jade,
  cactus,
  haworthia,
  "burros-tail": burros,
  "snake-plant": snake,
  lithops,
  agave,
  "hens-and-chicks": hens,
};

for (const [id, draw] of Object.entries(DRAW)) {
  const dir = new URL(`../public/plants/${id}/`, import.meta.url).pathname;
  await mkdir(dir, { recursive: true });
  for (let stage = 1; stage <= 5; stage++) {
    // Pot first, then the plant, so leaves overlap the pot rim.
    const plant = stage === 1 ? seed : draw(stage);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="120" height="160">${pot}${plant}</svg>\n`;
    await writeFile(`${dir}${stage}.svg`, svg);
  }

  // The fully grown plant planted in the garden: no pot, just a mound of soil.
  // Moved down by the pot's height so its base sits near the bottom, like the potted images.
  const ground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="120" height="160"><ellipse cx="60" cy="155" rx="26" ry="5" fill="${C.soil}" opacity="0.85"/><g transform="translate(0 38)">${draw(5, true)}</g><ellipse cx="60" cy="156" rx="16" ry="3" fill="${C.seed}"/></svg>\n`;
  await writeFile(`${dir}ground.svg`, ground);
}

console.log("Placeholder plants written to public/plants/");

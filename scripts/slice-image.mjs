// Cuts each picture in src/pictures/pictures.json into square tiles for the learning tracker.
// Only the tiles are served, so the browser never downloads a whole picture.
//
// For every tile, an id is generated first; the tile file is named by that id and the
// pair (id -> index in the grid, row by row) is added to src/pictures/tile-map.json.
// The map is always rebuilt from scratch; it's an output of this script, never an input.
//
// Ids are derived from the source image, the picture's grid settings and the tile's index,
// so running this again on the same picture gives the same ids and saved progress stays
// valid. Changing the image, grid size or crop gives new ids, as the tiles are different.
//
// Run with: npm run tiles
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const CONFIG = new URL("src/pictures/pictures.json", root);
const TILE_MAP = new URL("src/pictures/tile-map.json", root);

const pictures = JSON.parse(await readFile(CONFIG, "utf8"));

// 8 hex characters from a hash of everything that decides what the tile looks like.
// The source image itself is never served, so ids can't be worked out from positions.
function generateTileId(sourceBytes, settings, index, taken) {
  for (let attempt = 0; ; attempt++) {
    const id = createHash("sha256")
      .update(sourceBytes)
      .update(`${settings}|${index}|${attempt}`)
      .digest("hex")
      .slice(0, 8);
    // All-digit ids would be treated like numbers in JSON objects; keep them clearly ids.
    if (/[a-f]/.test(id) && !taken.has(id)) return id;
  }
}

const tileMap = {};

for (const [pictureId, picture] of Object.entries(pictures)) {
  const source = new URL(picture.source, root).pathname;
  const sourceBytes = await readFile(source);
  const { width, height } = await sharp(sourceBytes).metadata();
  const { cols, rows } = picture;
  const cropTopShare = picture.cropTopShare ?? 0.5;
  const tile = Math.floor(Math.min(width / cols, height / rows));
  const left = Math.floor((width - tile * cols) / 2);
  const top = Math.floor((height - tile * rows) * cropTopShare);
  const settings = `${pictureId}|${cols}x${rows}|${cropTopShare}`;

  const outDir = new URL(`public/tiles/${pictureId}/`, root).pathname;
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const ids = (tileMap[pictureId] = {});
  const taken = new Set();
  for (let index = 0; index < cols * rows; index++) {
    const id = generateTileId(sourceBytes, settings, index, taken);
    taken.add(id);

    const row = Math.floor(index / cols);
    const col = index % cols;
    await sharp(sourceBytes)
      .extract({
        left: left + col * tile,
        top: top + row * tile,
        width: tile,
        height: tile,
      })
      .webp({ quality: 85 })
      .toFile(`${outDir}${id}.webp`);

    ids[id] = index;
  }

  console.log(
    `${pictureId}: ${cols * rows} tiles of ${tile}px in public/tiles/${pictureId}/`,
  );
}

await writeFile(TILE_MAP, JSON.stringify(tileMap, null, 2) + "\n");
console.log("Tile map written to src/pictures/tile-map.json");

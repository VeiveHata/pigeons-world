// Cuts assets-src/pigeon.jpg into square tiles for the learning tracker.
// Only these tiles are served, so the browser never downloads the whole picture.
// Run with: npm run tiles
import { mkdir, readFile, rm } from "node:fs/promises";
import sharp from "sharp";

const grid = JSON.parse(
  await readFile(new URL("../src/tracker/grid.json", import.meta.url)),
);
const SOURCE = new URL("../assets-src/pigeon.jpg", import.meta.url).pathname;
const OUT_DIR = new URL(`../public${grid.tileDir}/`, import.meta.url).pathname;
// Where the crop starts vertically, as a share of the leftover height.
// 0.16 keeps the top of the head, the beak and the purple neck in frame.
const CROP_TOP_SHARE = 0.16;

const { width, height } = await sharp(SOURCE).metadata();
const tile = Math.floor(Math.min(width / grid.cols, height / grid.rows));
const cropWidth = tile * grid.cols;
const cropHeight = tile * grid.rows;
const left = Math.floor((width - cropWidth) / 2);
const top = Math.floor((height - cropHeight) * CROP_TOP_SHARE);

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

for (let row = 0; row < grid.rows; row++) {
  for (let col = 0; col < grid.cols; col++) {
    const index = row * grid.cols + col;
    await sharp(SOURCE)
      .extract({
        left: left + col * tile,
        top: top + row * tile,
        width: tile,
        height: tile,
      })
      .webp({ quality: 85 })
      .toFile(`${OUT_DIR}${index}.webp`);
  }
}

console.log(
  `${grid.cols * grid.rows} tiles of ${tile}px written to public${grid.tileDir}/`,
);

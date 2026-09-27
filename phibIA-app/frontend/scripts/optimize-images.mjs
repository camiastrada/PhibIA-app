/**
 * Convierte y redimensiona los assets raster del proyecto a WebP.
 *
 * Los PNG de este repo son fotografias guardadas como PNG-32bits con canal
 * alfa, que es el peor caso posible para ese formato. Ademas la mayoria estan
 * sobredimensionadas 3-6x respecto a la caja donde se renderizan.
 *
 * Uso:
 *   npm run images:optimize            # solo convierte lo que falte
 *   npm run images:optimize -- --force # regenera todo
 *
 * Los archivos de public/ tambien se procesan aqui: Vite los copia tal cual,
 * sin pasarlos por su pipeline, asi que no hay forma de optimizarlos en build.
 */
import sharp from "sharp";
import { readdir, stat, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");

const RASTER = ["png", "jpg", "jpeg"];

/**
 * Cada regla declara el ancho maximo real que necesita el asset en pantalla.
 * Sin `height` se conserva la proporcion original.
 */
const RULES = [
  // Avatares: circulo de hasta 240px (`size-45 xl:size-60`) -> 448 da margen 2x.
  // SIN recortar a cuadrado: el <img> de ProfilePanel no lleva clase de tamano
  // (solo `size-full` para el invitado), asi que se ajusta a su proporcion
  // intrinseca y `object-cover` nunca actua. Un recorte 1:1 horneado en el
  // archivo seria el unico recorte, y cortaba los lados de la rana en los
  // avatares apaisados (hasta 33% en profileIcon5). Se conserva la proporcion.
  { dir: "src/assets/profileIcons", ext: RASTER, width: 448, quality: 80 },

  // Especies: `w-30 md:w-50` dentro de un circulo `size-40 md:size-60` -> 200px.
  // 448 es 2.2x sobre eso. Bajar mas (400) se nota en pantallas 3x sin ahorrar tanto.
  {
    dir: "src/assets/species",
    ext: RASTER,
    width: 448,
    quality: 78,
    overrides: {
      // RanaToroCard lo muestra a 144px, no necesita 448.
      "ranaToro.jpg": { width: 320, quality: 82 },
    },
  },

  // Sombras: mismo tamano de pantalla, peor compresion por el canal alfa.
  { dir: "src/assets/speciesShadow", ext: RASTER, width: 448, quality: 70 },

  // Iconos de barra lateral y marcadores de mapa: se ven a 24px.
  {
    dir: "src/assets",
    files: ["frog1.png", "frog2.png"],
    width: 96,
    height: 96,
    fit: "cover",
    quality: 82,
  },
  { dir: "src/assets", files: ["singleLogo.png"], width: 270, quality: 85 },

  // public/ -> se copia literal, hay que convertirlo en disco.
  // Los fondos quedan en un panel con un formulario encima: es imagen decorativa,
  // asi que se puede bajar calidad sin que se note.
  { dir: "public/images", files: ["bgMainImage.png"], width: 1920, quality: 70 },
  { dir: "public/images", files: ["loginImage.jpg"], width: 1024, quality: 68 },
  { dir: "public/images", files: ["registerImage.jpg"], width: 768, quality: 72 },
  { dir: "public/images", files: ["logo.png"], width: 512, quality: 85 },
  { dir: "public/images", files: ["whiteLogo.png"], width: 237, quality: 90 },
];

/** Archivos que sobran y conviene borrar. */
const REDUNDANT = [
  // Byte-identico a src/assets/singleLogo.png (sha256 AFD9BE56...) y sin referenciar.
  "public/images/singleLogo.png",
];

/** El favicon se queda en PNG a proposito: es el unico con compatibilidad legacy real. */
const FAVICONS = [
  { file: "favicon.png", size: 64, note: "link rel=icon" },
  { file: "favicon-32.png", size: 32, note: "favicon clasico" },
  { file: "apple-touch-icon.png", size: 180, note: "iOS home screen" },
];

/** Sustituye la extension del raster por .webp conservando la ruta. */
const outName = (src) => src.replace(/\.(png|jpe?g)$/i, ".webp");

async function sizeOf(file) {
  try {
    return (await stat(file)).size;
  } catch {
    return 0;
  }
}

/** El .webp ya existe y es mas nuevo que su origen: no hay que rehacerlo. */
async function isFresh(src, out) {
  if (!existsSync(src) || !existsSync(out)) return false;
  const [s, o] = await Promise.all([stat(src), stat(out)]);
  return o.mtimeMs >= s.mtimeMs;
}

async function targetsFor(rule) {
  const dir = path.join(root, rule.dir);
  if (!existsSync(dir)) return [];
  if (rule.files) {
    return rule.files
      .map((f) => path.join(dir, f))
      .filter((f) => existsSync(f));
  }
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && RASTER.includes(path.extname(e.name).slice(1).toLowerCase()))
    .map((e) => path.join(dir, e.name));
}

const rows = [];
let before = 0;
let after = 0;

for (const rule of RULES) {
  for (const src of await targetsFor(rule)) {
    const name = path.basename(src);
    const cfg = { ...rule, ...(rule.overrides?.[name] ?? {}) };
    const out = outName(src);

    if ((await isFresh(src, out)) && !force) {
      const s = await sizeOf(src);
      const o = await sizeOf(out);
      before += s;
      after += o;
      rows.push({ file: path.relative(root, out), before: s, after: o, skipped: true });
      continue;
    }

    if (!existsSync(src)) continue;

    const s = await sizeOf(src);
    let pipeline = sharp(src).rotate();
    if (cfg.width || cfg.height) {
      pipeline = pipeline.resize({
        width: cfg.width,
        height: cfg.height,
        fit: cfg.fit ?? "inside",
        position: "centre",
        withoutEnlargement: true,
      });
    }
    await pipeline.webp({ quality: cfg.quality, effort: 6 }).toFile(out);

    const o = await sizeOf(out);
    before += s;
    after += o;
    rows.push({ file: path.relative(root, out), before: s, after: o });
  }
}

// Favicons: PNG, multiples tamanos, recorte cuadrado.
// Se regeneran siempre: son 3 archivos triviales y el destino de 64px se
// escribe sobre el propio origen, asi que el chequeo de frescura no aplica.
// Se codifican todos a buffer antes de escribir porque sharp no admite que la
// entrada y la salida sean el mismo archivo.
const faviconSrc = path.join(root, "public/images/favicon.png");
if (existsSync(faviconSrc)) {
  const s = await sizeOf(faviconSrc);
  const encoded = await Promise.all(
    FAVICONS.map(async ({ file, size }) => ({
      file,
      buffer: await sharp(faviconSrc)
        .rotate()
        .resize({ width: size, height: size, fit: "cover", position: "centre" })
        .png({ compressionLevel: 9, palette: true })
        .toBuffer(),
    })),
  );

  for (const { file, buffer } of encoded) {
    const out = path.join(root, "public/images", file);
    await writeFile(out, buffer);
    const { note } = FAVICONS.find((f) => f.file === file);
    before += s;
    after += buffer.length;
    rows.push({
      file: `${path.relative(root, out)}  (${note})`,
      before: s,
      after: buffer.length,
    });
  }
}

// Redundantes.
for (const rel of REDUNDANT) {
  const p = path.join(root, rel);
  if (existsSync(p)) {
    console.log(`  borrado  ${rel} (duplicado sin referencias)`);
    await unlink(p);
  }
}

const kb = (n) => `${(n / 1024).toFixed(1).replace(/\.0$/, "")} KB`;

console.log("");
for (const r of rows) {
  const pct = r.before > 0 ? Math.round((1 - r.after / r.before) * 100) : 0;
  const flag = r.skipped ? "= ya ok" : `-${pct}%`;
  console.log(
    `  ${r.skipped ? "=" : "-"} ${r.file.padEnd(46)} ${kb(r.before).padStart(10)} -> ${kb(r.after).padStart(9)}  ${flag}`,
  );
}

console.log(
  `\n  ${rows.length} assets | ${(before / 1048576).toFixed(2)} MB -> ${(after / 1048576).toFixed(2)} MB ` +
    `(${Math.round((1 - after / before) * 100)}% menos)\n`,
);

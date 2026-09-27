/**
 * Barrera anti-regresion de imagenes. Se ejecuta en `npm run build`.
 *
 * El repo arrastro 59.7 MB de PNG sin optimizar. Este script falla el build
 * si vuelve a colarse un raster sin convertir o demasiado grande, y tambien
 * si una referencia apunta a un archivo inexistente.
 *
 * Uso:  npm run images:check
 */
import { readdir, stat, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Cualquier raster por encima de esto deberia(WebP pese 10-40 KB). */
const LIMIT_KB = 250;

/**
 * Imagenes que se quedan en PNG a proposito: los favicons son el unico
 * formato con soporte real en navegadores antiguos, y pesan ~2 KB.
 */
const ALLOW_RASTER = [
  "public/images/favicon.png",
  "public/images/favicon-32.png",
  "public/images/apple-touch-icon.png",
];

const RASTER = /\.(png|jpe?g)$/i;
const ROOTS = ["src", "public"];

const problems = [];
const warn = (m) => problems.push(m);

async function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === "dist") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = (await Promise.all(ROOTS.map((r) => walk(path.join(root, r))))).flat();

// 1. Rasters sin convertir: si existe un .webp hermano, el .png sobra.
for (const f of files) {
  if (!RASTER.test(f)) continue;
  const rel = path.relative(root, f).replace(/\\/g, "/");
  if (ALLOW_RASTER.includes(rel)) continue;
  if (existsSync(f.replace(RASTER, ".webp"))) {
    warn(`sin convertir y con su .webp ya generado: ${rel}`);
  }
}

// 2. Rasters demasiado grandes.
for (const f of files) {
  if (!RASTER.test(f)) continue;
  const rel = path.relative(root, f).replace(/\\/g, "/");
  if (ALLOW_RASTER.includes(rel)) continue;
  const kb = (await stat(f)).size / 1024;
  if (kb > LIMIT_KB) {
    warn(`demasiado grande (${kb.toFixed(0)} KB > ${LIMIT_KB} KB): ${rel}`);
  }
}

// 3. Referencias a imagenes que no existen en disco.
const SOURCES = files.filter((f) => /\.(ts|tsx|css|html)$/.test(f));
for (const f of SOURCES) {
  const src = await readFile(f, "utf8");
  const rel = path.relative(root, f).replace(/\\/g, "/");

  // import ... from "..." -> relativo a src/, salvo que apunte a public/
  for (const m of src.matchAll(/from\s+["']([^"']+\.(?:webp|png|jpe?g))["']/g)) {
    const ref = m[1];
    const target = ref.startsWith("/")
      ? path.join(root, "public", ref)
      : path.resolve(path.dirname(f), ref);
    if (!existsSync(target)) {
      warn(`importa un asset inexistente: ${rel} -> ${ref}`);
    }
  }

  // "/images/....webp" -> se resuelve contra public/
  for (const m of src.matchAll(/["'`](\/images\/[^"'`]+)["'`]/g)) {
    if (!existsSync(path.join(root, "public", m[1]))) {
      warn(`referencia en public/ inexistente: ${rel} -> ${m[1]}`);
    }
  }

  // url('/images/...') en clases de Tailwind, estilos inline o CSS
  for (const m of src.matchAll(/url\((["']?)(\/[^)"']+)\1\)/g)) {
    if (!existsSync(path.join(root, "public", m[2].replace(/^\//, "")))) {
      warn(`url() a un archivo inexistente: ${rel} -> ${m[2]}`);
    }
  }
}

if (problems.length) {
  console.error(`\n  images:check fallo con ${problems.length} problema(s):\n`);
  for (const p of problems) console.error(`    - ${p}`);
  console.error(
    "\n  Convertilos con:  npm run images:optimize\n" +
      "  (si es una foto nueva, dejala ya en WebP; el script no necesita ejecutarse)\n",
  );
  process.exit(1);
}

const rasters = files.filter((f) => RASTER.test(f));
const webps = files.filter((f) => f.toLowerCase().endsWith(".webp"));
const total = (await Promise.all(files.map((f) => stat(f)))).reduce((a, s) => a + s.size, 0);
console.log(
  `  images:check ok | ${webps.length} webp, ${rasters.length} raster permitidos, ` +
    `assets ${(total / 1048576).toFixed(2)} MB`,
);

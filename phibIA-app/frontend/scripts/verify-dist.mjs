/**
 * Verifica que toda referencia a asset dentro de dist/ resuelva a un archivo real.
 *
 * Complementa a images:check: los archivos de public/ los copia Vite sin
 * validarlos, asi que un nombre mal escrito solo se detecta en runtime (404).
 *
 * Uso:  node scripts/verify-dist.mjs
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

if (!existsSync(dist)) {
  console.error("  dist/ no existe. Ejecuta npm run build primero.");
  process.exit(1);
}

const walk = async (dir) => {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
};

const files = await walk(dist);
const refs = new Map(); // url -> archivo que lo referencia

for (const f of files) {
  if (!/\.(js|css|html)$/.test(f)) continue;
  const src = await readFile(f, "utf8");
  const rel = path.relative(dist, f).replace(/\\/g, "/");

  // assets con hash de Vite: /assets/x-HASH.webp
  for (const m of src.matchAll(/["'`](\/assets\/[^"'`)\s]+\.(?:webp|png|jpg|jpeg|svg|woff2?|css|js))["'`]/g)) {
    if (!refs.has(m[1])) refs.set(m[1], rel);
  }
  // rutas public/ absolutas: /images/x.webp
  for (const m of src.matchAll(/["'`](\/images\/[^"'`)\s]+)["'`]/g)) {
    if (!refs.has(m[1])) refs.set(m[1], rel);
  }
}

const broken = [];
for (const [url, from] of refs) {
  if (!existsSync(path.join(dist, url))) broken.push(`${url}  (referenciado desde ${from})`);
}

// html
const html = files.find((f) => f.endsWith(".html"));
if (html) {
  const src = await readFile(html, "utf8");
  for (const m of src.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
    if (m[1].startsWith("/images/") && !existsSync(path.join(dist, m[1]))) {
      broken.push(`${m[1]}  (referenciado desde ${path.basename(html)})`);
    }
  }
}

if (broken.length) {
  console.error(`\n  verify-dist: ${broken.length} referencia(s) rota(s):\n`);
  for (const b of broken) console.error(`    - ${b}`);
  process.exit(1);
}

const total = (await Promise.all(files.map((f) => stat(f)))).reduce((a, s) => a + s.size, 0);
const rasters = files.filter((f) => /\.(png|jpe?g)$/i.test(f));
console.log(
  `  verify-dist ok | ${refs.size} referencias de assets resueltas | ` +
    `dist ${(total / 1048576).toFixed(2)} MB | ${rasters.length} raster (favicons)`,
);

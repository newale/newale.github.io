#!/usr/bin/env node

const fs   = require("fs");
const path = require("path");
const matter = require("gray-matter");
const os   = require("os");

const VAULT_ROOT   = path.join(os.homedir(), "obsidian vault2050");
const VAULT_IMAGES = path.join(VAULT_ROOT, "images");
const SITE_CONTENT = path.join(__dirname, "../contenido");
const SITE_IMAGES  = path.join(__dirname, "../static/imagenes");

const FRONTMATTER_DEFAULTS = {
  layout: "layouts/garden-entry.html",
};

// ── Slug helpers ─────────────────────────────────────────────────────────────

function slugifyBase(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugifyMd(filename) {
  return slugifyBase(filename.replace(/\.md$/, "")) + ".md";
}

function slugifyImage(filename) {
  const ext  = path.extname(filename).toLowerCase();
  const base = path.basename(filename, path.extname(filename));
  return slugifyBase(base) + ext;
}

// ── Vault scan ───────────────────────────────────────────────────────────────

function walkMd(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkMd(full, results);
    else if (entry.name.endsWith(".md")) results.push(full);
  }
  return results;
}

// Construye un mapa: basename-sin-ext (minúsculas) → { srcPath, slug, garden }
// usado para resolver wikilinks
function buildNoteMap(allMd) {
  const map = new Map();
  for (const src of allMd) {
    const base = path.basename(src, ".md").toLowerCase();
    let garden = false;
    try {
      const raw = fs.readFileSync(src, "utf8");
      const { data } = matter(raw);
      garden = isGardenNote(data);
    } catch {}
    map.set(base, { srcPath: src, slug: slugifyMd(path.basename(src)), garden });
  }
  return map;
}

function isGardenNote(data) {
  return data && (data.garden === true || data.garden === "true");
}

// ── Frontmatter ──────────────────────────────────────────────────────────────

function formatDate(date) {
  const d = new Date(date);
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function buildFrontmatter(raw, src) {
  const parsed = matter(raw);
  const data   = { ...parsed.data };

  if (!data.title) data.title = path.basename(src, ".md");
  if (!data.date)  data.date  = formatDate(fs.statSync(src).mtime);

  for (const [k, v] of Object.entries(FRONTMATTER_DEFAULTS)) {
    if (data[k] === undefined) data[k] = v;
  }

  return matter.stringify(parsed.content, data);
}

// ── Images ───────────────────────────────────────────────────────────────────

function findImageSrc(filename) {
  const candidates = [
    path.join(VAULT_IMAGES, filename),
    path.join(VAULT_ROOT, "knowledge", "images", filename),
    path.join(VAULT_ROOT, filename),
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

const IMAGE_EXTS = /\.(png|jpg|jpeg|gif|webp|svg|avif)$/i;

function processImages(content) {
  fs.mkdirSync(SITE_IMAGES, { recursive: true });
  return content.replace(/!\[\[([^\]]+)\]\]/g, (match, inner) => {
    const parts    = inner.split("|").map(s => s.trim());
    const filename = parts[0];
    if (!IMAGE_EXTS.test(filename)) return match; // embed de nota, no imagen

    // Extraer dimensiones: "336" → width, "256x315" → widthxheight
    let width, height;
    for (const p of parts.slice(1)) {
      const wh = p.match(/^(\d+)[xX×](\d+)$/);
      if (wh) { width = wh[1]; height = wh[2]; }
      else if (/^\d+$/.test(p)) { width = p; }
    }

    const src  = findImageSrc(filename);
    const slug = slugifyImage(filename);
    if (src) {
      fs.copyFileSync(src, path.join(SITE_IMAGES, slug));
      const url = `/static/imagenes/${slug}`;
      if (width || height) {
        const w = width  ? ` width="${width}"`   : "";
        const h = height ? ` height="${height}"` : "";
        return `<img src="${url}" alt="${slug}"${w}${h}>`;
      }
      return `![${slug}](${url})`;
    }
    console.warn(`  ⚠  imagen no encontrada: ${filename}`);
    return ``;
  });
}

// ── Wikilinks ────────────────────────────────────────────────────────────────

function processWikilinks(content, noteMap, currentFile, warnings) {
  // [[Note Name|Alias]] o [[Note Name]]
  return content.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (match, target, alias) => {
    const key     = target.trim().toLowerCase();
    const display = (alias || target).trim();
    const note    = noteMap.get(key);

    if (!note) {
      // No existe ningún archivo con ese nombre
      warnings.push(`  ⚠  link roto [[${target}]] en ${currentFile} (archivo no existe en la bóveda)`);
      return display; // degradar a texto plano
    }

    if (!note.garden) {
      warnings.push(`  ⚠  [[${target}]] en ${currentFile} → archivo existe pero no tiene garden:true (daría 404)`);
      return display; // degradar a texto plano
    }

    const urlSlug = note.slug.replace(/\.md$/, "");
    return `[${display}](/contenido/${urlSlug}/)`;
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

function syncVault() {
  if (!fs.existsSync(VAULT_ROOT)) {
    console.error(`Bóveda no encontrada: ${VAULT_ROOT}`);
    process.exit(1);
  }

  const allMd  = walkMd(VAULT_ROOT);
  const noteMap = buildNoteMap(allMd);

  let synced = 0, skipped = 0;
  const allWarnings = [];

  for (const src of allMd) {
    const raw = fs.readFileSync(src, "utf8");
    let data;
    try { ({ data } = matter(raw)); } catch { skipped++; continue; }
    if (!isGardenNote(data)) { skipped++; continue; }

    const slug = slugifyMd(path.basename(src));
    const dest = path.join(SITE_CONTENT, slug);

    if (fs.existsSync(dest)) {
      const srcMtime  = fs.statSync(src).mtimeMs;
      const destMtime = fs.statSync(dest).mtimeMs;
      if (srcMtime <= destMtime) { skipped++; continue; }
    }

    const relPath  = path.relative(VAULT_ROOT, src);
    const warnings = [];

    let processed = buildFrontmatter(raw, src);
    processed     = processImages(processed);
    processed     = processWikilinks(processed, noteMap, relPath, warnings);

    fs.writeFileSync(dest, processed, "utf8");

    if (warnings.length) {
      allWarnings.push(...warnings);
      console.log(`  ✓  ${relPath} → ${slug}  (con advertencias)`);
    } else {
      console.log(`  ✓  ${relPath} → ${slug}`);
    }
    synced++;
  }

  if (allWarnings.length) {
    console.log("\n── Advertencias ──────────────────────────────────");
    allWarnings.forEach(w => console.log(w));
  }

  console.log(`\nSync: ${synced} actualizados, ${skipped} sin cambios.`);
}

syncVault();

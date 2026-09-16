# aebn.cl

Sitio personal de Alejandro Bustos, construido con [Eleventy](https://www.11ty.dev/) y
desplegado en GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev     # sincroniza el vault y levanta el servidor local
npm run build   # genera _site/
```

En `npm run dev` los borradores se ven; en `npm run build` no se construyen.

## Estructura

- `investigacion/` — las entradas del blog en Markdown. Cada archivo se publica en
  `/investigacion/<slug>/`; el layout y la URL los aporta `investigacion.11tydata.js`.
- `_includes/layouts/` — `base.html` (el shell del sitio), `entrada.html` (las entradas) y
  `musica.html` (la página de música, con su propio diseño hasta que migre a PODs).
- `_data/site.js` — metadatos del sitio: URL, título, descripción, imagen social. Los usan
  el `<head>`, el sitemap, el feed y el JSON-LD.
- `static/` — CSS, imágenes, audios y documentos. Una sola hoja, `static/css/sitio.css`,
  salvo música.
- `scripts/sync-vault.js` — importa al blog las notas con `garden: true` desde el vault de
  Obsidian.
- `feed.liquid`, `sitemap.liquid`, `robots.liquid` — generan `/feed.xml`, `/sitemap.xml` y
  `/robots.txt`.

## Escribir una entrada

Crea un `.md` en `investigacion/`:

```yaml
---
title: "Título de la entrada"
date: 2026-09-16
resumen: "Una línea que aparece en el listado y en el feed."
tags:
  - un-tag
  - otro-tag
draft: false             # true la deja fuera del sitio publicado
---
```

Los **tags** son libres: se escriben acá y ya. Aparecen como distintivos en la entrada y en
su tarjeta, y el listado de `/investigacion/` arma con ellos sus botones de filtro. No
generan una página por tag.

`resumen` no es obligatorio, pero sin él la entrada no tiene descripción propia en
buscadores ni resumen en el feed.

## Aplicaciones

Las aplicaciones que antes vivían en este monorepo están en repositorios propios;
`/aplicaciones` solo enlaza hacia ellos.

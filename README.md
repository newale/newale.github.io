# aebn.cl

Sitio personal de Alejandro Bustos, construido con [Eleventy](https://www.11ty.dev/) y desplegado en GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev     # sincroniza el vault y levanta el servidor local
npm run build   # genera _site/
```

## Estructura

- `articulos/` — los artículos en Markdown. Cada archivo se publica en `/articulos/<slug>/`.
- `_includes/` — layouts y componentes compartidos.
- `_data/` — datos globales de Eleventy.
- `static/` — CSS, imágenes, audios, videos y documentos.
- `scripts/sync-vault.js` — importa notas con `garden: true` desde el vault de Obsidian a `articulos/`.

## Escribir un artículo

Crea un `.md` en `articulos/` con este frontmatter:

```yaml
---
title: "Título del artículo"
date: 2026-09-12
seccion: jardín          # o: investigación
resumen: "Una línea que aparece en el listado."
tags:
  - una-etiqueta
draft: false             # true lo excluye del sitio publicado
---
```

El layout y la URL los aporta `articulos/articulos.json`, así que no hace falta declararlos.

## Aplicaciones

Las aplicaciones que antes vivían en este monorepo ahora están en repositorios propios; `/aplicaciones` solo enlaza hacia ellos.

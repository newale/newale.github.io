# eleventy-plugin-editar

Edita los textos de un sitio [Eleventy](https://www.11ty.dev/) directamente sobre la página, en el navegador, y guárdalos en sus archivos: textos de `_data/*.json`, campos del frontmatter y archivos Markdown completos. Funciona solo con el servidor de desarrollo: el sitio publicado no lleva nada del plugin.

Sirve para revisar redacción y traducciones viendo cada texto en su lugar, con su largo real, y para escribir entradas de blog con vista previa sin salir del sitio.

## Uso

```js
// eleventy.config.js
const editar = require("eleventy-plugin-editar");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(editar, { activo: process.env.EDITAR === "1" });
};
```

```sh
EDITAR=1 npx @11ty/eleventy --serve
```

Aparece una barra abajo a la derecha:

- **Editar textos** deja editables los textos marcados. **Guardar** (⌘S / Ctrl+S) escribe todos los cambios juntos y Eleventy recarga la página. **Enter** termina de editar un texto y **Esc** lo devuelve a como estaba.
- **Editar Markdown** (en páginas hechas desde un `.md`) abre el archivo completo en un panel lateral, con frontmatter, barra de formato, vista previa en vivo y conteo de palabras. Al guardar, la página se recarga y el editor vuelve a abrirse donde estabas.

## Marcar textos en las plantillas

Cada filtro indica de qué archivo y de qué ruta viene el texto. Las partes de la ruta se pueden pasar por separado: se unen con puntos.

```liquid
{# Texto plano de _data/portada.json #}
<h1>{{ portada.nombre | editable: "portada", "nombre" }}</h1>
<p>{{ portada.parrafos[0] | editable: "portada", "parrafos", 0 }}</p>

{# Un archivo por idioma: la ruta se arma con variables #}
{%- assign archivo = "tesis/" | append: t.codigo -%}
<h3>{{ i.titulo | editable: archivo, "abordar.items", i.id, "titulo" }}</h3>

{# Markdown en línea (negritas, cursivas, enlaces): se renderiza siempre;
   al editar se muestra la fuente #}
<li>{{ item | editableMd: "trayectoria", "formacion.items", forloop.index0 }}</li>

{# Campo de una línea del frontmatter de un .md (también en listados) #}
<h1>{{ title | editableFm: page.inputPath, "title" }}</h1>
<span>{{ e.data.resumen | editableFm: e.inputPath, "resumen" }}</span>

{# Habilita el editor de Markdown completo para la página #}
<article{{ page.inputPath | editarMarkdown }}>
```

Si el archivo no se indica (por ejemplo, en una plantilla compartida que a veces recibe textos que no vienen de un JSON), el filtro devuelve el texto sin marcarlo.

## Opciones

| Opción | Por defecto | Qué hace |
|---|---|---|
| `activo` | `process.env.EDITAR === "1"` | Enciende el modo edición. Aun encendido, solo actúa en `--serve`. |
| `carpetaDatos` | `"_data"` | Carpeta donde están los JSON. |
| `raiz` | `process.cwd()` | Raíz del proyecto: no se edita nada fuera de ella. |
| `excluir` | `[]` | Carpetas donde no se editan `.md`, además de `node_modules`, la carpeta de salida y las ocultas. |
| `filtro` | `"editable"` | Nombre base de los filtros (`editable`, `editableMd`, `editableFm`). |
| `prefijo` | `"/__editar"` | Ruta donde el servidor sirve el cliente y recibe los cambios. |
| `abrirEnlacesExternos` | `true` | En Markdown en línea, los enlaces `http(s)` abren en otra pestaña. |

## Garantías

- **Nada llega a producción.** Al construir (`eleventy`), los filtros devuelven el texto (o su HTML) sin tocarlo y no se inyecta ningún script.
- **Solo reemplaza textos que ya existen.** En JSON no crea claves ni cambia números o listas; en el frontmatter solo toca la línea del campo, sin re-serializar el YAML.
- **No pisa cambios ajenos.** Si el archivo cambió desde que cargaste la página, rechaza el guardado. En el editor de Markdown, tu texto queda guardado en la pestaña para no perderlo al recargar.
- **Todo o nada.** Si un cambio falla, no se escribe ninguno. Las escrituras son atómicas.
- **Solo dentro del proyecto.** No escribe fuera de la raíz ni en `node_modules`, la carpeta de salida o carpetas ocultas, ni sigue enlaces simbólicos hacia afuera.
- **Solo desde tu máquina.** El servidor de desarrollo escucha en la red local, así que los endpoints responden únicamente a `localhost`, exigen JSON y rechazan otros orígenes.

## Límites (v0.2)

- Los textos en línea son de una línea. Un valor JSON con HTML se muestra, pero no se edita: conviene escribirlo en Markdown y usar `editableMd`.
- En el frontmatter solo se editan campos de texto de una línea (`title`, `resumen`…); el resto se edita en el panel de Markdown.
- La vista previa del panel renderiza el Markdown, pero no las etiquetas de la plantilla (Liquid, Nunjucks). Al guardar ves la página real.
- No edita archivos de datos `.js`.
- No uses los filtros dentro de atributos (`alt`, `title`, `content`…): ahí romperían el HTML.

## Pruebas

```sh
npm test
```

## Licencia

GPL-3.0-or-later.

---
title: "Hacia nuevas arquitecturas de aplicaciones soberanas"
date: 2026-09-18
resumen: "Llevo años haciendo aplicaciones chicas para resolver problemas míos. El backend siempre fue el punto donde se volvían caras y sospechosas. Solid invierte la relación: el dato vive en el pod del usuario y la app es solo una vista."
draft: false
tipo: apunte
---

Hago aplicaciones chicas para resolver problemas míos. `por-hacer` para los pendientes, `hecho` para registrar lo que efectivamente hice, `escala-notas` para <!-- completar: qué resuelve escala-notas -->. Ninguna tiene usuarios que no sean yo, ninguna necesita escalar, ninguna justifica una arquitectura.

Y sin embargo, todas chocan con el mismo muro: ¿dónde vive el dato?

## El muro

La respuesta barata es el navegador. Las tres guardan su estado en `localStorage` o IndexedDB, y eso funciona sorprendentemente bien: cero infraestructura, cero costo, cero latencia, cero responsabilidad sobre datos ajenos. Una app estática servida desde un subdominio, y listo.

El problema aparece apenas quiero el mismo pendiente en el teléfono. O apenas limpio el navegador. O apenas quiero que `hecho` lea lo que `por-hacer` cerró ayer. El estado no es portable porque no es un dato: es un efecto secundario del navegador donde abrí la app.

La respuesta cara es un backend. Ahí empieza la cadena completa: un servidor, una base de datos, migraciones, autenticación, respaldos, un dominio más que renovar, y —lo que más me incomoda— la custodia. Si algún día una de estas apps la usa otra persona, yo quedo teniendo sus pendientes en mi base de datos. No los quiero. No es humildad, es que no tengo cómo responder por ellos.

Esa es la falsa disyuntiva sobre la que quiero escribir: o el dato es un efecto secundario del navegador, o el dato es propiedad de quien levantó el servidor. Las dos opciones dan por sentado que la capa de datos pertenece a la aplicación.

## Invertir la relación

Solid propone lo contrario. El dato vive en un **pod**: un espacio de almacenamiento HTTP que pertenece al usuario, con su propia identidad (`WebID`) y sus propios permisos. La aplicación no tiene base de datos. La aplicación pide permiso para leer y escribir en el pod de quien la está usando, y ese permiso es revocable.

Dicho de otro modo: la app deja de ser el lugar donde el dato vive y pasa a ser una vista sobre un dato que ya existía y que va a seguir existiendo cuando yo deje de mantener la app. Las tres piezas del protocolo son separables —datos, identidad, aplicaciones— y esa separación es el punto entero.

Levanté un pod propio para probarlo en serio. Es notablemente poco: un servidor Solid corriendo en una máquina modesta, un WebID que me identifica, y una estructura de carpetas que puedo mirar con `curl`. La primera vez que abrí `por-hacer` apuntando al pod y después leí exactamente el mismo archivo desde la terminal, sin pasar por la app, entendí qué estaba comprando.

```js
import { fetch } from "@inrupt/solid-client-authn-browser";

// El pod es de quien usa la app, no mío.
const recurso = `${podUrl}por-hacer/pendientes.json`;

const res = await fetch(recurso);          // fetch autenticado con el WebID del usuario
const pendientes = await res.json();
```

No hay `DATABASE_URL`. No hay tabla `users`. El único identificador que la app maneja es una URL que apunta a un servidor que no controlo.

## La transparencia como condición, no como feature

Acá está lo que más me interesa, y es una tesis sobre diseño más que sobre tecnología.

Una app que guarda datos en un pod ajeno no puede sostenerse sobre la opacidad. Necesita decir, de antemano y de forma legible, qué escribe, dónde lo escribe y con qué forma. Si no lo dice, nadie en su sano juicio le da permiso de escritura sobre su espacio personal. La arquitectura obliga a la declaración; no depende de la buena voluntad del desarrollador ni de una política de privacidad que nadie lee.

Mi instinto inicial fue publicar el JSON Schema de cada app: acá está la forma exacta del dato que escribo, revísala. Solid resuelve eso de una manera más ambiciosa y más incómoda: el contrato no es un esquema privado de mi app, sino un vocabulario compartido —RDF— con formas validables (ShEx o SHACL) y un índice de tipos en el pod que permite que otra aplicación encuentre mis pendientes sin saber nada de `por-hacer`.

La diferencia es concreta. Con JSON Schema, mi app es transparente. Con vocabularios compartidos, mi app es reemplazable: cualquier otra puede leer lo mismo y yo puedo abandonar la mía sin que el usuario pierda nada. La segunda propiedad es la que vale, y es también la más difícil de aceptar para quien escribe la app.

Nada impide guardar JSON plano en un pod —el servidor acepta cualquier archivo— y para empezar es lo razonable. Pero conviene saber que esa decisión cambia la promesa: se conserva la custodia, se pierde la interoperabilidad.

## Lo que Solid no resuelve

Quiero ser preciso porque es fácil entusiasmarse y decir de más.

La app sí ve los datos. Solid no es cifrado extremo a extremo. Cuando autorizo `por-hacer` a leer mi pod, el código de esa app —corriendo en mi navegador, con mi token— accede al contenido completo. Lo que cambia no es el conocimiento, es la custodia: la app no guarda una copia, no acumula, no es el registro de referencia, y yo puedo cortarle el acceso sin pedirle permiso a nadie. Decir "la aplicación jamás conoce tus datos" sería falso; decir "la aplicación nunca los tiene" es exacto.

La infraestructura no desaparece, se muda. Alguien tiene que correr el pod. Lo que gana el modelo es que ese alguien puede ser el propio usuario, o una comunidad que comparte costos, en vez de la empresa dueña de la aplicación. El servidor sigue existiendo; deja de ser condición para usar el software.

El ecosistema es chico y se mueve. Las especificaciones están vivas —hay un esfuerzo en curso por fijar un conjunto estable de versiones para tener contra qué construir— y las bibliotecas cambian. RDF tiene curva de aprendizaje real, el flujo de login con WebID es hostil para cualquiera que no sea técnico, y el pod no ofrece las consultas que uno da por sentadas en una base de datos: filtrar, buscar y paginar quedan del lado del cliente. Para tres apps personales eso es irrelevante. Para algo más grande, no.

## Por qué igual me parece la arquitectura correcta

Porque resuelve mi problema práctico y una incomodidad ética con la misma decisión.

El problema práctico: mis apps dejan de ser prisioneras del navegador donde las abrí, sin que yo tenga que operar un backend. El estado se vuelve un archivo con URL, legible desde la terminal, respaldable con `rsync`, compartible con quien yo decida.

La incomodidad ética: nunca quise quedar custodiando datos de otros como precio de ofrecerles una herramienta útil. Con esta arquitectura ese intercambio desaparece, y desaparece por construcción, no por promesa. La privacidad deja de ser una cláusula que agrego al final y pasa a ser una propiedad del esquema: no puedo filtrar lo que no tengo.

Sospecho que esa es la única forma en que la privacidad se sostiene en el tiempo. Como declaración de intenciones dura hasta el primer cambio de dueño, la primera ronda de inversión, el primer modelo de negocio que necesita datos. Como condición de arquitectura, hay que reescribir el sistema para traicionarla.

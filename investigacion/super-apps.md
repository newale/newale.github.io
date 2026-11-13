---
title: "La super app que no te encierra"
date: 2026-11-09
resumen: "Las super apps prometen todo en un solo lugar a cambio de quedarse con todo. espacio, la app de la cooperativa, se está volviendo una de ellas por otro camino: el de la interoperabilidad."
tipo: ensayo
tags:
  - soberanía digital
  - cooperativa
---

Hay una palabra que circula en las reuniones de producto desde hace unos años: **super app**. Una sola aplicación desde la que se chatea, se paga, se pide comida, se llama un taxi, se agenda una hora médica y se pagan las cuentas. El modelo es WeChat, que nació en 2011 como mensajería y hoy es, para más de mil millones de personas, la puerta de entrada a casi toda la vida digital. Alipay, Grab, Gojek y Rappi siguieron caminos parecidos, y en 2022 Elon Musk anunció que quería convertir Twitter en una *everything app*.

Mi amiga Daphne preparó hace poco una presentación sobre super apps para su trabajo, y gran parte de lo que sigue nace de conversarla.

<!-- completar: cita directa de la presentación de Daphne. Formato sugerido:
> «…»
> Daphne [apellido], *[título de la presentación]* [[1]](#nota-1)
-->

## Lo que promete una super app

<!-- completar con la definición o el marco de Daphne. Mientras tanto, una versión provisoria: -->

Desde el lado de quien la usa, la promesa es comodidad: una sola cuenta, un solo medio de pago, una sola interfaz aprendida. No hay que bajar diez aplicaciones ni recordar diez contraseñas. Desde el lado de quien la construye, la promesa es otra: cada servicio nuevo que entra a la super app llega con los usuarios ya adentro, y cada usuario que entra por un servicio queda expuesto a todos los demás.

<!-- completar: datos o ejemplos de la presentación de Daphne (adopción, modelo de negocio, casos latinoamericanos). -->

## El precio: la super app como recinto

Lo que hace funcionar a una super app es que todo pasa por el mismo lugar. Los datos de lo que compras se cruzan con los de con quién hablas y a dónde vas. Esa integración es la comodidad, pero también es el negocio: un perfil completo de cada persona, en manos de una sola empresa, que además decide qué servicios entran, con qué comisión y bajo qué reglas.

Cory Doctorow describe este proceso como el cierre de un recinto: las plataformas crecen abriéndose y luego, cuando ya no se puede salir, cierran las puertas [[2]](#nota-2). Lo que impide salir no es una ley ni un muro, sino que todo lo tuyo —tus contactos, tu historial, tus archivos— vive adentro y no tiene forma de vivir afuera. La super app es la forma más acabada de ese recinto: no una aplicación que te encierra, sino un mundo entero.

En la [tesis](/soberania-digital/) llamo a esto un problema de dominación en el sentido de Philip Pettit: no hace falta que la empresa abuse de su poder para que haya dominación; basta con que pueda hacerlo sin que tengas cómo resistir [[3]](#nota-3).

## espacio: la super app al revés

Desde que lanzamos [espacio](https://tecnocoop.aebn.cl/espacio/), el escritorio de la [cooperativa](/proyectos/tecnocoop/), me he dado cuenta de que, poco a poco, se está convirtiendo en una super app. Ya tiene archivos, notas, música, un archivador, tareas, un editor de texto y un estudio para publicar música. Se entra con una sola identidad. Todo se ve desde un mismo lugar. Desde afuera, parece lo mismo que critiqué arriba.

La diferencia está en dónde viven los datos. En una super app tradicional, la integración ocurre en el servidor de la empresa: los servicios se hablan porque comparten la misma base de datos, y esa base de datos es de ellos. En espacio, la integración ocurre en el **pod** de cada persona, bajo el estándar [Solid](https://solidproject.org/). Las aplicaciones no guardan nada propio: leen y escriben en tu pod, y tu identidad es un WebID que no le pertenece a ninguna de ellas. Lo expliqué con más detalle en [nuevas arquitecturas de aplicaciones soberanas](/investigacion/arquitecturas-soberanas-solid/).

Eso cambia la dirección de la super app. No es que los servicios entren a un recinto y traigan a sus usuarios; es que cada persona trae su propio recinto, y las aplicaciones son visitas.

## La interoperabilidad, de verdad

Lo que más me ha sorprendido construyendo espacio es lo bien que funciona la interoperabilidad. Como los datos están escritos en vocabularios abiertos y no en el formato privado de cada aplicación, cosas que en el mundo de las plataformas requieren acuerdos comerciales, APIs privadas o exportaciones manuales aquí simplemente ocurren.

<!-- completar: un ejemplo concreto que te haya sorprendido. Por ejemplo: un archivo creado en una app que aparece y se puede usar en otra; una app de terceros que funciona sin que la cooperativa haya hecho nada; cambiar de app manteniendo los datos. -->

Esa es la super app que me interesa: no una que lo hace todo, sino una en la que todo se puede hacer *con* lo tuyo, y desde la que siempre se puede salir sin perder nada. La comodidad de la integración sin el precio del encierro.

## Lo que falta pensar

<!-- completar: tensiones abiertas. Algunas posibles:
  - ¿Quién decide qué apps entran al catálogo de espacio? ¿La cooperativa no vuelve a ser un portero?
  - La interoperabilidad técnica no garantiza la interoperabilidad social: si todos usan espacio, ¿no se recentraliza?
  - ¿Qué dice Daphne sobre la sostenibilidad económica de las super apps y cómo se compara con una cooperativa? -->

No sé todavía si "super app" es la palabra correcta para lo que está pasando con espacio. Quizás sea mejor pensarla como lo contrario: no una aplicación que absorbe servicios, sino un lugar donde las aplicaciones vienen a ti. Lo que sí sé es que la pregunta de quién guarda los datos no es técnica. Es la pregunta de quién manda.

---

<h2 id="notas">Notas</h2>

<p id="nota-1">[1] <!-- completar: Daphne [apellido], título de la presentación, contexto y fecha. --></p>

<p id="nota-2">[2] Doctorow, <em>The Internet Con</em>.</p>

<p id="nota-3">[3] Pettit, <em>Republicanismo</em>.</p>

<h2 id="bibliografia">Bibliografía</h2>

<p>Doctorow, Cory. <em>The Internet Con: How to Seize the Means of Computation</em>. Londres: Verso, 2023.</p>

<p>Pettit, Philip. <em>Republicanismo: una teoría sobre la libertad y el gobierno</em>. Barcelona: Paidós, 1999.</p>

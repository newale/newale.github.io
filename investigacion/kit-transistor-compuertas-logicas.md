---
title: "El transistor y las compuertas lógicas: kit de sensibilización a la programación"
date: 2026-10-14
resumen: "Antes de programar, tocar el interruptor que lo hace posible. Un transistor, un botón y un LED en una protoboard, y después dos transistores en serie que forman una compuerta AND."
draft: false
imagen: "/static/imagenes/kit-AND-001.png"
tipo: apunte
tags:
  - electrónica
  - educación
---

Este es parte del **kit de sensibilización a la programación y la tecnología digital**. <!-- completar: para quién es el kit, dónde se usa (taller, colegio, curso) y qué otras piezas tiene --> La idea es partir por abajo: antes de escribir una línea de código, ver con las propias manos de qué está hecho lo digital.

Y lo digital, en el fondo, está hecho de interruptores. Millones de ellos, apagándose y encendiéndose. Ese interruptor es el **transistor**.

## El transistor como interruptor

Un transistor tiene tres patas. Por dos de ellas circula la corriente que queremos controlar —en este caso, la que enciende un LED—. La tercera, la *base*, es la llave: si le llega una corriente pequeña, el transistor deja pasar la corriente grande; si no, la corta.

El primer circuito del kit es solo eso: un botón que le manda corriente a la base a través de una resistencia, y un LED que se enciende cuando el transistor conduce. Apretar el botón no prende el LED directamente; le *avisa* al transistor que lo prenda. Esa diferencia, aunque parezca mínima, es todo: una señal que controla a otra señal.

<figure class="figura-doble">
  <img src="/static/imagenes/kit-switch-001.png" alt="Protoboard con un pulsador, dos resistencias, un transistor y un LED azul, conectada por cables rojo y negro a una fuente de alimentación.">
  <video src="/static/imagenes/kit-demo-switch.mp4" poster="/static/imagenes/kit-demo-switch-poster.jpg" controls muted loop playsinline preload="none" aria-label="Un dedo aprieta el pulsador de la protoboard y el LED azul se enciende."></video>
  <figcaption>El transistor como interruptor: un pulsador, un transistor y un LED.</figcaption>
</figure>

## Dos transistores: la compuerta AND

Si ponemos dos de esos interruptores en serie, uno detrás del otro, la corriente solo llega al LED cuando **los dos** están cerrados. Con un solo botón apretado no pasa nada; con los dos, el LED se enciende.

| Botón A | Botón B | LED |
|:-:|:-:|:-:|
| no | no | apagado |
| sí | no | apagado |
| no | sí | apagado |
| sí | sí | **encendido** |

Eso es una compuerta lógica **AND** (Y): la salida es verdadera solo si ambas entradas lo son. Es la misma operación que aparece en cualquier lenguaje de programación como `a && b`, pero acá no es una abstracción: es corriente que pasa o no pasa, y se ve.

<figure class="figura-doble">
  <img src="/static/imagenes/kit-AND-001.png" alt="Protoboard con dos pulsadores, cada uno con su resistencia, dos transistores en serie y un LED azul.">
  <video src="/static/imagenes/kit-AND-003.mp4" poster="/static/imagenes/kit-AND-003-poster.jpg" controls muted loop playsinline preload="none" aria-label="Se aprieta un pulsador y el LED sigue apagado; al apretar los dos a la vez, el LED azul se enciende."></video>
  <figcaption>La compuerta AND: dos pulsadores, dos transistores en serie. El LED solo se enciende con ambos apretados.</figcaption>
</figure>

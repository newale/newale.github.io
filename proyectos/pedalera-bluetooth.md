---
title: "Una pedalera bluetooth para Logic Pro"
date: 2026-10-14
resumen: "Cuatro pulsadores, un ESP32 y una caja de cartón piedra: una pedalera que habla MIDI por bluetooth para prender y apagar efectos en Logic Pro sin soltar la guitarra."
draft: false
imagen: "/static/imagenes/pedalera-007.png"
tipo: proyecto
tags:
  - música
  - electrónica
---

Tocando con los efectos en Logic Pro, el problema siempre es el mismo: para prender un delay o cambiar de distorsión hay que soltar la guitarra e ir al computador. Una pedalera resuelve eso, pero las comerciales con MIDI son caras para lo que hacen, que es básicamente mandar un mensaje cuando uno pisa un botón.

Así que armé una. Es la primera pieza física de lo que vengo llamando Ziniestra, el proyecto de pedales y amplificadores.

## Primero en papel

Antes de cortar nada, probé la forma en hojas de papel. Doblándolas se arma la misma caja que después iba a ser de cartón: una cara inclinada para el pie y pestañas que le dan altura. Hice un par de layouts hasta dar con las proporciones.

<figure class="figura-doble">
  <img src="/static/imagenes/pedalera-007.png" alt="Hoja de papel con líneas de doblez horizontales y la anotación a mano 'Layout #1'.">
  <img src="/static/imagenes/pedalera-008.png" alt="Hoja de papel con líneas de doblez, la anotación 'Layout #2' y un cuadrado recortado en el costado izquierdo.">
  <figcaption>Layout #1 y Layout #2: la caja como hoja doblada. El segundo ya tiene un recorte de prueba. <!-- completar: para qué es el recorte cuadrado --></figcaption>
</figure>

En el papel también salieron las medidas. Los cuatro pulsadores quedaron a 7 cm uno del otro, en 4, 11, 18 y 25 cm, sobre una caja de 29 cm de largo. Y como cada pulsador ocupa más altura con su golilla y su tuerca que solo, anoté esas alturas para calcular cuánto espacio tenía que quedar adentro.

<figure>
  <img src="/static/imagenes/pedalera-009.png" alt="Hoja con bocetos a mano: una tira con marcas a 4, 11, 18 y 25 centímetros separadas por 7 centímetros, un esquema de cuatro puntos en línea y cálculos sueltos.">
  <figcaption>La distribución de los pulsadores: 7 cm entre cada uno.</figcaption>
</figure>

<figure class="figura-doble">
  <img src="/static/imagenes/pedalera-010.png" alt="Hoja con el dibujo lateral de un pulsador y anotaciones de su altura con golilla y con tuerca, junto a garabatos.">
  <img src="/static/imagenes/pedalera-011.png" alt="Hoja de papel en blanco con dos líneas de doblez en la parte de abajo y pequeñas marcas donde irían los pulsadores.">
  <figcaption>El pulsador de perfil, con sus alturas, y la plantilla final con las marcas donde va cada uno.</figcaption>
</figure>

## La caja

La base es cartón piedra: una plancha doblada en ángulo, con una pestaña arriba que le da rigidez. Marqué con lápiz y regla dónde iba cada pulsador, perforé y los fijé con sus tuercas.

<figure>
  <img src="/static/imagenes/pedalera-003.png" alt="Plancha de cartón piedra con cuatro pulsadores metálicos de pie alineados, con las marcas de lápiz para centrarlos todavía visibles, sobre una mesa con tuercas sueltas y una regla.">
  <figcaption>Los cuatro pulsadores montados. Todavía se ven las cruces de lápiz con que los centré.</figcaption>
</figure>

<figure>
  <img src="/static/imagenes/pedalera-002.png" alt="Vista de la parte de abajo de la pedalera: cuatro pulsadores negros con sus patas de soldadura asomando por el cartón.">
  <figcaption>Por debajo: las patas de los pulsadores, listas para soldar.</figcaption>
</figure>

## El cerebro: un ESP32

El ESP32 es un microcontrolador barato que trae bluetooth incorporado. Eso lo vuelve ideal para esto: puede presentarse ante el computador como un dispositivo **MIDI por bluetooth (BLE MIDI)**, que macOS reconoce sin drivers. Cada pulsador va a un pin del ESP32; cuando se pisa, el ESP32 envía un mensaje MIDI. <!-- completar: qué mensaje manda cada pedal (Control Change, número de CC, notas) y qué librería usaste para BLE MIDI -->

<figure>
  <img src="/static/imagenes/pedalera-004.png" alt="La pedalera de cartón piedra con un ESP32 negro colocado al centro, entre el segundo y el tercer pulsador.">
  <figcaption>El ESP32 presentado en su lugar, entre los pulsadores del medio.</figcaption>
</figure>

## Del pie a Logic Pro

En el Mac, la pedalera aparece en *Configuración Audio MIDI* como un dispositivo bluetooth más. Una vez conectada, Logic Pro la ve como cualquier controlador MIDI, y con *Asignaciones de controlador* (o *Learn*) cada pedal queda amarrado a lo que uno quiera: activar o saltar un plugin, cambiar de patch, grabar. <!-- completar: qué efectos/acciones asignaste a cada pedal -->

<figure class="figura-doble">
  <img src="/static/imagenes/pedalera-001.png" alt="La pedalera terminada vista de lado, sostenida en la mano: una caja de cartón piedra pintada de negro con pulsadores metálicos arriba y el ESP32 visible por dentro.">
  <img src="/static/imagenes/pedalera-006-prueba.png" alt="Sala de ensayo vista desde arriba: un notebook y una interfaz de audio roja sobre una silla, y en el suelo, sobre una alfombra, la pedalera conectada junto a cables y una guitarra roja.">
  <figcaption>A la izquierda, la caja cerrada y pintada. A la derecha, la primera prueba en la sala de ensayo: notebook con Logic, interfaz de audio y la pedalera en el piso.</figcaption>
</figure>

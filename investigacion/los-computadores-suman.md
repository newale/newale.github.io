---
title: "¿Los computadores suman? Revisemos esta operación matemática en la materialidad computacional"
date: 2026-11-09
resumen: "Qué pasa, físicamente, cuando un procesador resuelve 2 + 2: voltajes, compuertas, acarreos y calor. No para responder si la máquina suma, sino para ver dónde se juega la pregunta."
tipo: ensayo
tags:
  - filosofía de la técnica
  - electrónica
---

> «Poseer una máquina no es conocerla.»
> Gilbert Simondon [[1]](#nota-1)

Escribo `2 + 2` en una calculadora y aparece un `4`. Nadie dudaría en decir que el computador sumó. Lo decimos con la misma naturalidad con que decimos que el reloj *marca* la hora o que el termómetro *sabe* cuánta fiebre tenemos. Pero basta bajar un par de niveles —sacar la carcasa, mirar el chip, poner un transistor en una protoboard— para que la frase empiece a incomodar. Ahí abajo no hay números. Hay corriente que pasa o no pasa, voltajes altos y bajos, calor. La pregunta de este texto es aparentemente ingenua: **¿los computadores suman?** No pretendo responderla. Me interesa más recorrer cómo ocurre, materialmente, una suma tan simple como 2 + 2 dentro de un procesador, y ver en qué punto de ese recorrido la pregunta se vuelve difícil.

Este texto nace de los [kits de sensibilización a la programación](/investigacion/kit-transistor-compuertas-logicas/), donde un transistor, un botón y un LED bastan para armar una compuerta lógica. La compuerta AND de ese kit, como veremos, es la mitad de una suma.

## Del número al voltaje

Lo primero que desaparece en el camino hacia el chip es el número. Un procesador no guarda "dos": guarda un patrón de interruptores. En binario, el 2 se escribe `10` y el 4 se escribe `100`. Cada dígito —cada *bit*— corresponde a un cable o a una celda de memoria que está a un voltaje alto o a uno bajo. Por convención, alto es 1 y bajo es 0.

Esa convención es importante, y es lo primero que conviene subrayar: el voltaje no *es* un 1. Un cable a 3,3 voltios es un cable a 3,3 voltios. Que lo leamos como 1, y que leamos `10` como el número dos y no, por ejemplo, como "verdadero, falso" o como la décima letra de algún alfabeto, es una decisión de diseño que viene de afuera del cable. John Searle lo formuló con brusquedad: la sintaxis no es intrínseca a la física [[2]](#nota-2). Lo físico es el voltaje; lo binario ya es una lectura.

Así que el "2 + 2" que llega al procesador es, en concreto, esto: dos grupos de cables, cada uno con el patrón alto-bajo (`10`), esperando a ser combinados.

## La suma como compuertas

Sumar en binario es más simple que sumar en decimal, porque solo hay cuatro casos posibles por columna:

| A | B | Suma | Acarreo |
|:-:|:-:|:-:|:-:|
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | **1** |

La última fila es la que todos aprendimos en el colegio con otro nombre: "uno más uno, cero, y me llevo uno". Esa tabla, mirada con calma, son dos compuertas lógicas puestas una al lado de la otra:

- La columna **Acarreo** es una compuerta **AND**: vale 1 solo cuando A y B valen 1. Es exactamente el circuito del kit, dos transistores en serie que encienden un LED solo si ambos botones están apretados.
- La columna **Suma** es una compuerta **XOR** (o exclusivo): vale 1 cuando las entradas son *distintas*. Una XOR se puede construir con cuatro compuertas NAND, y cada NAND con un par de transistores.

Juntas forman lo que en electrónica se llama un **semisumador**. Si se le agrega la capacidad de recibir el acarreo de la columna anterior, se llama **sumador completo**, y encadenando sumadores completos —uno por bit— se obtiene un sumador de tantos bits como se quiera. Charles Petzold muestra en *Code* que todo esto puede construirse con relés de telégrafo [[3]](#nota-3): no hay nada en la suma que exija silicio.

Ahora sí, 2 + 2, columna por columna, de derecha a izquierda:

| Columna | A | B | Acarreo que entra | Suma | Acarreo que sale |
|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 (unidades) | 0 | 0 | 0 | 0 | 0 |
| 2 (doses) | 1 | 1 | 0 | 0 | **1** |
| 3 (cuatros) | 0 | 0 | 1 | **1** | 0 |

El resultado se lee de abajo hacia arriba: `100`. Cuatro. Pero lo que de verdad ocurrió fue más humilde: en la segunda columna, dos voltajes altos llegaron a una AND, la AND dejó pasar corriente, y esa corriente viajó hasta la tercera columna, donde una XOR la dejó salir como voltaje alto. Eso es "me llevo uno": una corriente que se desplaza un par de micrómetros hacia la izquierda.

<!-- completar: foto o video del semisumador armado en el kit, con dos LED (suma y acarreo) -->

## Dentro del procesador

En un procesador real, ese recorrido está rodeado de muchas otras cosas, y cada una agrega una capa entre el `2 + 2` que escribimos y la corriente que se mueve.

**El programa.** Si escribo `x = 2 + 2` en un lenguaje como C, es probable que el procesador nunca haga esa suma. El compilador, al ver dos constantes, calcula el 4 por adelantado y deja en el programa solo la instrucción "guarda 4 en x". La suma la hizo otro programa, en otro momento, quizás en otro computador. Para que el procesador sume de verdad, los números tienen que llegar en tiempo de ejecución: desde un teclado, un archivo, una red.

**La instrucción.** Cuando la suma sí llega, toma la forma de una instrucción de máquina, algo como `ADD`, que a su vez es otro patrón de bits. El procesador lo decodifica y, como consecuencia, abre los caminos que conectan dos registros —pequeñas celdas de memoria dentro del chip— con la **unidad aritmético-lógica** (ALU), donde están los sumadores.

**El reloj.** Nada de esto ocurre de forma continua. Un oscilador marca el ritmo del procesador miles de millones de veces por segundo, y en cada pulso los registros capturan lo que haya en sus entradas. El sumador tiene que terminar antes del pulso siguiente. Y aquí la materialidad se vuelve un problema de diseño: el acarreo de nuestra tabla tiene que *viajar*, columna por columna, y en un sumador de 64 bits ese viaje puede ser demasiado lento. Por eso los procesadores usan sumadores con **anticipación de acarreo**, que calculan de antemano, con más compuertas, si cada columna va a recibir un acarreo o no. Se gastan transistores para ganar tiempo. La aritmética no cambia; lo que cambia es la geografía del circuito.

**El calor.** Finalmente, la suma calienta. En parte por razones de ingeniería —cada transistor que conmuta disipa energía—, pero también por una razón más profunda. Rolf Landauer mostró en 1961 que toda operación lógicamente irreversible, toda operación que borra información, tiene un costo energético mínimo que se libera como calor [[4]](#nota-4). La suma es irreversible: de un 4 no se puede saber si vino de 2 + 2, de 3 + 1 o de 4 + 0. Algo se perdió, y esa pérdida tiene temperatura.

## ¿Dónde está la suma?

Recorrido el camino, la pregunta del principio se puede plantear de varias maneras, y ninguna me parece del todo satisfactoria.

Se puede decir que **sí, el computador suma**, porque realiza fielmente la función de la suma: para cualquier par de entradas, entrega el resultado correcto. Pero "cualquier" es una palabra grande. Un procesador de 64 bits, ante números que no caben en 64 bits, desborda y entrega otra cosa; y Saul Kripke, leyendo a Wittgenstein, mostró que ninguna cantidad finita de casos correctos basta para fijar que alguien sigue la regla de la suma y no otra que coincide con ella hasta cierto punto [[5]](#nota-5). Si eso vale para nosotros, vale con más razón para una máquina.

Se puede decir que **no, el computador solo conmuta corrientes**, y que la suma está en quien lee los LED. Es la posición de Searle, y tiene la ventaja de la sobriedad. Pero deja algo sin explicar: la corriente no se movió de cualquier manera. Se movió exactamente según la tabla del colegio, porque alguien diseñó el circuito para que lo hiciera. La suma no está solo en quien lee el resultado; también quedó inscrita en el cobre.

Simondon ofrece una tercera vía, que no resuelve la pregunta sino que la desplaza. Para él, el objeto técnico no es ni un simple instrumento ni un ser autónomo: es la cristalización de un **esquema de funcionamiento**, un gesto humano que se volvió estructura material [[1]](#nota-1). El sumador sería, en ese sentido, la suma *hecha cosa*: no un pensamiento, pero tampoco algo ajeno a él. La pregunta deja de ser si la máquina suma y pasa a ser si nosotros podemos ver ese esquema o si nos queda oculto. En el [seminario sobre IA y libertad](/investigacion/ia-libertad-puc/) llamé a esa diferencia fanerotecnia y criptotecnia: objetos que muestran su funcionamiento y objetos que lo esconden.

Un procesador moderno es criptotécnico por necesidad: miles de millones de transistores en un centímetro cuadrado no se pueden mirar. La calculadora del teléfono lo es por diseño: muestra un 4 y nada más. Como la *nurturing room* de Bradbury en [La Pradera que nos devora](/investigacion/la-pradera-que-nos-devora/), funciona tan bien que deja de parecer técnica. La protoboard, en cambio, es fanerotécnica: el acarreo es un LED que se enciende y un cable que uno mismo conectó.

## Lo que deja la pregunta

No sé si los computadores suman. Sé que, después de armar una compuerta AND con dos transistores, la frase "el computador sumó" me suena distinta. Ya no puedo oírla sin ver detrás la tabla de cuatro filas, el voltaje que viaja una columna hacia la izquierda, el reloj que no espera, el calor que queda.

Quizás esa sea la utilidad de la pregunta: no que se responda, sino que obligue a bajar. A abrir la carcasa, a mirar qué gesto humano quedó cristalizado ahí y a decidir, con más conocimiento, cuánto de nuestro propio juicio le estamos delegando a una máquina cuando aceptamos su 4 sin pensar. Ese es el sentido de los kits: no formar ingenieros, sino devolverle a cualquiera la posibilidad de ver cómo funciona lo que usa todos los días.

---

<h2 id="notas">Notas</h2>

<p id="nota-1">[1] Simondon, <em>El modo de existencia de los objetos técnicos</em>.</p>

<p id="nota-2">[2] Searle, “Is the Brain a Digital Computer?”.</p>

<p id="nota-3">[3] Petzold, <em>Code</em>.</p>

<p id="nota-4">[4] Landauer, “Irreversibility and Heat Generation in the Computing Process”.</p>

<p id="nota-5">[5] Kripke, <em>Wittgenstein on Rules and Private Language</em>.</p>

<h2 id="bibliografia">Bibliografía</h2>

<p>Kripke, Saul A. <em>Wittgenstein on Rules and Private Language</em>. Cambridge, MA: Harvard University Press, 1982.</p>

<p>Landauer, Rolf. “Irreversibility and Heat Generation in the Computing Process.” <em>IBM Journal of Research and Development</em> 5, n.º 3 (1961): 183–191.</p>

<p>Petzold, Charles. <em>Code: The Hidden Language of Computer Hardware and Software</em>. Redmond, WA: Microsoft Press, 2000.</p>

<p>Searle, John R. “Is the Brain a Digital Computer?” <em>Proceedings and Addresses of the American Philosophical Association</em> 64, n.º 3 (1990): 21–37.</p>

<p>Simondon, Gilbert. <em>El modo de existencia de los objetos técnicos</em>. Buenos Aires: Prometeo Libros, 2007.</p>

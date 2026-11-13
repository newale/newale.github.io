---
title: "Viejito-Perro: cómo hacer sensible un dato doméstico"
date: 2026-11-09
resumen: "Raúl Zuleta convirtió un notebook heredado en una estación ambiental para su casa. Mi parte fue pensar la interfaz: cómo devolverle a una persona, como algo que se siente, lo que los sensores convierten en números."
tipo: ensayo
tags:
  - electrónica
  - interfaces
---

Mi amigo Raúl Zuleta tiene en su casa un computador viejo que se llama Viejito-Perro. Era un notebook querido que le heredaron, y en vez de dejarlo morir lo convirtió en servidor doméstico. Después le fue agregando placas y sensores: temperatura, humedad, presión, luz, algo de actividad acústica. Hoy dos nodos, uno en la sala y otro en el dormitorio, registran cómo varía la vivienda y lo guardan dentro de la casa. Raúl lo documenta en su sitio como un proyecto de [ecología audiovisual](https://razc.cl/proyecto.html?id=ecologia-audiovisual), y lo que sigue no reemplaza esa página: es lo que vi desde mi lado.

La pregunta de Raúl es de antropólogo: **¿cómo conocer un ambiente sin dejar de habitarlo?** Los sensores producen datos, los datos se promedian, los promedios se grafican, y en algún punto del camino la casa desaparece. Uno sabe que la humedad del dormitorio subió un 12 % a las ocho de la mañana, pero ya no siente la ducha. La pregunta que me quedó a mí fue más de ingeniero: **si el dato ya existe, ¿cómo se lo devolvemos al cuerpo?**

## El problema de la pantalla

La salida natural de un proyecto así es un dashboard: curvas, números, colores de alerta. Es lo que hacen todas las aplicaciones de casa inteligente, y tiene un problema que ya traté en [La Pradera que nos devora](/investigacion/la-pradera-que-nos-devora/): una interfaz que traduce todo a números le pide a la persona que salga del ambiente para mirarlo. Hay que sacar el teléfono, abrir la app, leer. El dato se vuelve algo que se *consulta*, no algo que se *percibe*.

Raúl ya había dado un paso en otra dirección: los LED del nodo respiran, con pulsaciones alternadas que expresan la diferencia de temperatura entre la sala y el dormitorio. No dicen "1,8 °C". Dicen, con un ritmo, que una pieza está más tibia que la otra. Eso me pareció la pista correcta.

## La interfaz que propuse

<!-- completar: describir la interfaz que diseñaste. Preguntas para guiar:
  - ¿Qué variable(s) se hacen sensibles y con qué medio (luz, sonido, vibración, temperatura, movimiento)?
  - ¿Dónde está físicamente la interfaz y cómo se la encuentra la persona en su día?
  - ¿Qué se traduce: el valor absoluto, la diferencia entre piezas, el cambio en el tiempo, lo anómalo?
  - ¿Cómo se diferencia del dashboard? ¿Qué se pierde a propósito?
  - Bocetos, fotos o video del prototipo. -->

## Por qué la diferencia y no el valor

Una idea que comparto con el trabajo de Raúl es que lo que importa casi nunca es el número sino la relación. El archivo de Viejito-Perro mostró que los nodos no describen "la sala" y "el dormitorio", sino posiciones concretas: cerca de una ventana, en una corriente de aire, al lado de la cocina. Los ciclos del día, los ritmos domésticos y los acontecimientos breves —cocinar, ventilar— aparecen como diferencias, no como valores.

El cuerpo funciona igual. No sentimos 21 grados; sentimos que al entrar a una pieza hace más frío que en la otra. Una interfaz que quiera ser sensible tiene que trabajar con eso: con contrastes, con cambios, con ritmos, y no con magnitudes absolutas que solo un instrumento calibrado puede dar —y que Viejito-Perro, como Raúl advierte con honestidad, no pretende dar.

## Hacer visible lo que se mide

Hay una segunda razón, que me importa más. Un dashboard esconde el instrumento: los números aparecen limpios, como si vinieran del ambiente mismo. Pero cada lectura depende de dónde está el sensor, de cómo se montó, de si se cayó detrás de un mueble. En los [kits de compuertas lógicas](/proyectos/kit-transistor-compuertas-logicas/) hablo de **fanerotecnia**: objetos que muestran cómo funcionan. Una interfaz fanerotécnica para Viejito-Perro no solo debería expresar el dato, sino dejar ver que es un dato: parcial, situado, producido por un aparato con límites.

<!-- completar: cómo tu interfaz deja ver el instrumento, si lo hace. -->

## Lo que sigue

Viejito-Perro está en funcionamiento, pero sigue abierto: la carcasa del nodo 02 se está imprimiendo, faltan sensores de presencia y una de las líneas pendientes es justamente desarrollar maneras visuales, sonoras e históricas de relacionarse con los registros. Ahí es donde espero que esta interfaz encuentre su lugar.

<!-- completar: estado de tu prototipo y próximos pasos. -->

El proyecto es de Raúl; el dibujo del personaje es de Constanza Tizzoni, y Nicolás Müller lo ha acompañado en lo técnico. Toda la documentación está en [razc.cl](https://razc.cl/proyecto.html?id=ecologia-audiovisual).

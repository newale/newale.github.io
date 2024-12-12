---
title: "Desarrollando montos accesibles para la web"
date: 2023-11-04T00:00:00-03:00
draft: false
categories: ["accesibilidad"]
# cover:
#     image: "posts/ensayos/autopoiesis-2.png"
#     alt: imagen post
#     caption: imagen ilustrativa abstracta
---

Cuando se desarrolla contenido digital que esté expresando montos numéricos, de dinero o descuento por ejemplo, es muy importante velar por una buena compresión de lo que se expresa. En esta guía abordaremos una forma de hacer que los montos tengan una lectura accesible, y que cuiden la comprensión por parte del usuario.

# Montos

La presentación de montos numericos es un componente esencial en la mayoría de los sitios web comerciales hoy en dia. Pero distintas experiencias se pueden obtener cuando se trata de montos, pues cada lector de pantalla, interpreta de forma distinta un monto. . Si los precios no son fáciles de leer o interpretar, especialmente para usuarios que dependen de lectores de pantalla, la experiencia puede verse significativamente afectada, llevando a frustración y potencial pérdida de clientes.

![El precio se podría estructurar como simbolo de peso, separador de miles y separador de decimales](/posts/a11y/precios-accesibilidad-price_structure.png)

Los precios en Chile no contemplan decimales, pero si quisieramos mostrar un monto que si tenga, estos se separan por coma (`,`). Para el separador de miles, se usa el punto (`.`). Y para el caso del simbolo de dinero, usamos el peso $, seguido de un espacio comunmente.

Si hemos usado una planilla excel/google sheets, seguro hemos lidiado con estos formatos, al usar moneda si la configuración por defecto no es la correcta, al usar formatos de fechas y de monedas, no se ven como si fueran de Chile. 

# Desafíos en la Lectura de Precios para Usuarios con Discapacidades

## Dificultades con lectores de pantalla

Un problema común es que los lectores de pantalla pueden leer los símbolos y números de manera literal, interrumpiendo el flujo natural de la información. Por ejemplo, “$ 1.000” puede ser leído como “símbolo de dólar uno punto cero cero cero”, lo que no transmite claramente el monto en palabras, como “mil pesos”. Esto dificulta que el usuario entienda rápidamente el valor sin un trabajo cognitivo adicional.

## Variaciones en formatos numéricos regionales
Si bien este artículo no contempla ejemplos para montos fuera de Chile, lo cierto es que todo cambia significativamente entre diferentes regiones y culturas, lo que de ser el caso, presenta una complejidad que se debe abordar de manera unificadda.

# Cómo abordar el problema

El primer desafío es consistencia. Cuando nos encontremos con esta dificultad, debemos abordarla de manera transversal, en general, un Sistema de Diseño nos pudiera proveer algún componente de utilidad para este fin, y que asi abstraiga el acuerdo que se haya tomado a nivel de contenido. Por lo que asunto debiese involucrar a Desarrollo y Contenido por lo menos para el lineamiento inicial.

Los montos luego tendrán un lugar en alguna interfaz, que quizás muestre solo el precio en alguna tarjeta ("card") junto a otros elementos de precio en interacción. Tal podría ser el caso de algún elemento con descuento, en donde queremos que el usuario sepa que existe un porcentaje de descuento particular, o si le facilitamos el cálculo mostrando el precio actual y el previo al descuento. O quizás son montos de cuotas o el porcentaje de CAE de un crédito. Los escenarios son variados.



## Implementación

La implementación técnica adecuada es fundamental para asegurar que los precios sean accesibles. Utilizar etiquetas HTML semánticas, como <span> o <div> con clases específicas, ayuda a estructurar la información de manera lógica. Además, se pueden utilizar atributos ARIA (Accessible Rich Internet Applications) para mejorar la interpretación por parte de los lectores de pantalla.

Por ejemplo, usar aria-label para proporcionar una descripción adicional del precio puede ser útil:

```
<span aria-label="Mil pesos">$1.000</span>
```

Esto permite que el lector de pantalla pronuncie “mil pesos” en lugar de “dólar uno punto cero cero cero”, mejorando la comprensión del usuario.

## Experiencia mejorada

Si bien esto podría ser suficiente, en ocasiones queremos complementar la lectura del contenido con información que no esté visible en la interfaz.

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

Supongamos que queremos hacer algo como en la imágen:

![Imagen muestra un botón que tiene por etiqueta "Comprar" y un texto para el lector de pantalla con mas detalles incluyendo el precio](/posts/a11y/precios-accesibilidad-button_read.png)


Para algo como esto vamos a suponer el siguiente código HTML:

```html
<button>
  Comprar
  <span class="sr-only">calcetas por diez mil pesos</span>
</button>

```

### Ejemplos prácticos de implementación
A continuación, se presentan ejemplos de cómo implementar precios accesibles en HTML:


```
<!-- Precio simple -->
<span aria-label="Mil pesos">$1.000</span>

<!-- Precio con descuento -->
<p>
  Precio original: <span aria-label="Dos mil pesos">$2.000</span><br>
  Descuento: <span aria-label="Quinientos pesos">$500</span><br>
  Precio con descuento: <span aria-label="Mil quinientos pesos">$1.500</span>
</p>

<!-- Precio con financiamiento -->
<p>
  Precio total con financiamiento: <span aria-label="Mil doscientos pesos"> $1.200</span>
</p>
````

Estos ejemplos aseguran que, independientemente de cómo se configure el lector de pantalla, el usuario reciba una interpretación clara y comprensible de los montos.


## Mejores prácticas y recomendaciones finales
Para desarrollar precios accesibles en la web, es importante seguir una serie de mejores prácticas:

1. **Consistencia en el formato**: Mantener un formato uniforme en toda la web para evitar confusiones. Si se utiliza el punto como separador de miles y la coma para decimales en una sección, se debe mantener igual en todas las demás.

1. **Uso de etiquetas semánticas y atributos ARIA**: Implementar etiquetas HTML semánticas y utilizar atributos ARIA cuando sea necesario para mejorar la comprensión de los precios por parte de los lectores de pantalla.

1. **Pruebas regulares de accesibilidad**: Realizar pruebas continuas utilizando herramientas especializadas para asegurar que no surjan nuevos problemas a medida que el sitio evoluciona.

1. **Capacitación y concienciación del equipo**: Asegurarse de que todos los miembros del equipo de desarrollo y diseño comprendan la importancia de la accesibilidad y estén capacitados para implementarla correctamente.

1. **Evitar formatos mixtos**: No mezclar diferentes formatos numéricos en una misma página o sección, ya que esto puede generar confusión. Seleccionar un estándar y adherirse a él estrictamente.

1. **Proporcionar alternativas textuales cuando sea necesario**: En casos donde los precios son representados de manera compleja visualmente, considerar proporcionar una descripción textual adicional que facilite la comprensión.

---

La accesibilidad en la lectura de montos numericos en general, es una faceta importante del diseño web inclusivo. Al centrarse en cómo se presentan los montos monetarios, se puede mejorar significativamente en la simpleza de la interfaz, un codigo semanticamente correcto y mejorar la experiencia de uso, especialmente aquellas personas que dependen de la asistencias de lectores de pantalla. 

---

- Referencias y Recursos Adicionales
  - WCAG (Web Content Accessibility Guidelines)
  - NVDA - NonVisual Desktop Access
  - VoiceOver
  - AXE Accessibility Checker
  - WAVE Evaluation Tool
  - Ley de Inclusión Digital en Chile
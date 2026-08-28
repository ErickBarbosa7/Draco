# Documento de Diseño (UI/UX) y Experiencia de Usuario

## 1. Filosofía de Diseño
*   **Dashboard Moderno y Analítico:** La interfaz debe transmitir limpieza y claridad, utilizando un diseño de "tarjetas flotantes" (floating cards) sobre un fondo neutro para destacar la información clave. Un estilo ideal para un sistema de gestión empresarial intuitivo.
*   **Interacciones Fluidas:** Cambios de moneda y recálculo de totales sin recargar la página, manteniendo la atención en los datos.
*   **Jerarquía Visual Clara:** Uso de contrastes fuertes entre el texto principal y los elementos secundarios, con bordes muy redondeados que suavizan la vista.

## 2. Paleta de Colores y Tipografía
*   **Color de Fondo:** Gris muy claro / Off-white (ej. Tailwind `bg-slate-50`).
*   **Superficies (Cards):** Blanco puro (`bg-white`) con sombras difusas y amplias (`shadow-sm` a `shadow-md` con opacidad baja) y bordes muy redondeados (`rounded-2xl` o `rounded-3xl`).
*   **Color Principal (Acciones):** Azul muy oscuro, casi negro (`bg-slate-900` o `#0F172A`) para botones principales y alto contraste.
*   **Acentos y Estados:** 
    *   Píldoras de estado (Badges) con colores de fondo suaves y texto fuerte (ej. Verde para "Aceptada" o variaciones positivas: `bg-green-100 text-green-700`).
*   **Texto:** Negro/Gris muy oscuro para títulos y datos principales (`text-slate-900`), gris medio para etiquetas y descripciones (`text-slate-500`).
*   **Tipografía:** Sans-serif geométrica y limpia (ej. Inter o Roboto).

## 3. Estructura de la Pantalla del Cotizador (Layout)
### 3.1. Navegación (Sidebar/Navegación)
*   Menú lateral o superior muy limpio, con indicadores de sección activa en forma de píldora (pill-shaped) sutil, separando la navegación del área de trabajo.

### 3.2. Encabezado (Overview Cards)
*   Uso de tarjetas flotantes en la parte superior para organizar los datos clave (ej. Datos del cliente en una tarjeta, resumen de la orden y tipo de cambio en otra).
*   Controles principales (Toggle MXN/USD, Botón de Guardar) ubicados en la parte superior derecha con botones de alto contraste.

### 3.3. Cuerpo Principal (La Tabla)
*   Contenida dentro de una gran tarjeta blanca con padding amplio.
*   Cabeceras de tabla minimalistas, sin bordes verticales cerrados. Uso exclusivo de líneas divisorias horizontales muy tenues (`border-b border-gray-100`) para separar filas.
*   Fondo de celdas alternas opcional, pero manteniendo la máxima limpieza visual.

## 4. Comportamientos Específicos
*   **Toggle de Moneda:** Un switch estilizado o botones segmentados tipo "píldora".
*   **Imágenes de Producto:** Miniaturas pequeñas con bordes suaves (`rounded-lg`) integradas directamente en la primera columna de la tabla.
# DESIGN.md

> Una herramienta cartográfica clara y confiable: primero ubicar, después comparar, finalmente decidir.

## 1. Visual Theme & Atmosphere

**Style**: Map-first Utility
**Keywords**: cartográfico, claro, inmediato, compacto, confiable, táctil, urbano
**Tone**: aplicación de movilidad cotidiana con controles precisos y contenido real, no landing promocional ni dashboard decorativo
**Feel**: abrir el mapa y entender en segundos dónde hay combustible, sin atravesar una portada ni descifrar la interfaz.

**Interaction Tier**: L1, estático refinado
**Dependencies**: CSS only; React Leaflet y Lucide ya presentes se conservan.

La estructura toma de Google Maps el protagonismo del mapa y de Airbnb la búsqueda accesible, la jerarquía táctil y las superficies limpias. No replica marcas, logotipos ni color corporativo de ninguna referencia.

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #f7f8fa;
  --surface: #ffffff;
  --surface-alt: #f1f3f5;
  --surface-hover: #eef4ff;

  /* Borders */
  --border: #dfe3e8;
  --border-hover: #aeb8c4;

  /* Text */
  --text: #17202a;
  --text-secondary: #4f5d6b;
  --text-tertiary: #718090;
  --text-inverse: #ffffff;

  /* Accent */
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-soft: #e8f0ff;
  --accent-pressed: #1e40af;

  /* RGB variants */
  --bg-rgb: 247, 248, 250;
  --surface-rgb: 255, 255, 255;
  --text-rgb: 23, 32, 42;
  --accent-rgb: 37, 99, 235;

  /* Semantic fuel and system states */
  --success: #178754;
  --success-soft: #e9f7ef;
  --warning: #c77800;
  --warning-soft: #fff4dc;
  --error: #cf3c3c;
  --error-soft: #fff0f0;
  --info: #2563eb;
}
```

**Color Rules:**

- Todo color de componentes debe usar variables; queda prohibido introducir hexadecimales sueltos.
- `--accent` se reserva para selección, botones principales, ubicación y foco.
- Verde, ámbar y rojo se reservan para saldo alto, medio, bajo y mensajes semánticos. Nunca son colores decorativos.
- El mapa suministra la mayor parte del color visual; la interfaz permanece neutral.
- No usar gradientes, cristal, fondos beige, texturas ni grandes superficies saturadas.

## 3. Typography Rules

**Font Stack:**

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');

:root {
  --font-ui: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| App title | Manrope | 18px | 700 | 1.2 | -0.02em |
| Panel count | Manrope | 24px | 700 | 1.2 | -0.025em |
| Station name | Manrope | 14px | 700 | 1.35 | -0.01em |
| Body / controls | Manrope | 14px | 500 | 1.45 | 0 |
| Secondary body | Manrope | 13px | 400 | 1.45 | 0 |
| Label | Manrope | 11px | 600 | 1.3 | 0.02em |
| Metadata | Manrope | 11px | 500 | 1.4 | 0 |

**Typography Rules:**

- La aplicación utiliza una sola familia sans-serif.
- Los nombres de estaciones admiten como máximo dos líneas antes de truncar.
- Evitar títulos grandes: ningún texto funcional supera 28px.
- Las etiquetas pueden usar mayúsculas, pero nunca texto auxiliar o párrafos completos.
- **NEVER use**: Fraunces, Playfair Display, Instrument Serif, fuentes manuscritas, fuentes monoespaciadas decorativas.

**Text Decoration:**

- Sin gradiente, `text-shadow`, texto con contorno ni subrayados decorativos.
- Los enlaces usan subrayado convencional con `text-underline-offset: 3px`.
- Los estados se comunican mediante color, icono y texto; nunca solo color.

## 4. Component Stylings

### Buttons

```css
.button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--accent);
  color: var(--text-inverse);
  font: 600 14px/1 var(--font-ui);
  cursor: pointer;
  transition: background-color 160ms ease, box-shadow 160ms ease, transform 100ms ease;
}
.button:hover { background: var(--accent-hover); }
.button:active { background: var(--accent-pressed); transform: scale(0.98); }
.button:focus-visible { outline: 3px solid rgba(var(--accent-rgb), 0.28); outline-offset: 2px; }
.button:disabled { background: var(--surface-alt); color: var(--text-tertiary); cursor: not-allowed; transform: none; }
.button--secondary { background: var(--surface); color: var(--text); border-color: var(--border); }
.button--secondary:hover { background: var(--surface-alt); border-color: var(--border-hover); }
```

### Filter controls and search

```css
.control {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text);
  box-shadow: none;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}
.control:hover { border-color: var(--border-hover); }
.control:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.14); }
.control[aria-disabled='true'] { background: var(--surface-alt); color: var(--text-tertiary); }
.control input, .control select { font: 500 14px/1.4 var(--font-ui); color: var(--text); }
.control input::placeholder { color: var(--text-tertiary); opacity: 1; }
```

### Station rows

```css
.station-row {
  padding: 16px;
  border: 0;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  transition: background-color 160ms ease;
}
.station-row:hover { background: var(--surface-alt); }
.station-row[aria-selected='true'] {
  background: var(--accent-soft);
  box-shadow: inset 3px 0 0 var(--accent);
}
.station-row:focus-visible { outline: 3px solid rgba(var(--accent-rgb), 0.28); outline-offset: -3px; }
```

Las estaciones no son tarjetas elevadas. Son filas escaneables dentro de una lista con desplazamiento propio.

### Status badges

```css
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 3px 8px;
  border-radius: 999px;
  font: 600 11px/1 var(--font-ui);
}
.status--high { color: var(--success); background: var(--success-soft); }
.status--medium { color: var(--warning); background: var(--warning-soft); }
.status--low { color: var(--error); background: var(--error-soft); }
```

### Navigation and toolbar

```css
.app-header {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.filter-toolbar {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(150px, .8fr) minmax(240px, 1.4fr) 44px;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
```

### Map, popups and markers

```css
.map-shell { position: relative; min-width: 0; overflow: hidden; background: var(--surface-alt); }
.map-control {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(var(--text-rgb), 0.14);
}
.map-control:hover { background: var(--surface-alt); }
.map-control:focus-visible { outline: 3px solid rgba(var(--accent-rgb), 0.28); outline-offset: 2px; }
.station-marker { border: 3px solid var(--surface); border-radius: 50%; box-shadow: 0 1px 5px rgba(var(--text-rgb), 0.25); }
.map-popup { min-width: 240px; color: var(--text); }
```

### Modals

```css
.modal {
  width: min(560px, calc(100vw - 32px));
  max-height: min(760px, calc(100vh - 32px));
  overflow: auto;
  padding: 24px;
  border: 0;
  border-radius: 16px;
  background: var(--surface);
  color: var(--text);
  box-shadow: 0 20px 60px rgba(var(--text-rgb), 0.22);
}
.modal::backdrop { background: rgba(var(--text-rgb), 0.52); }
```

### Links

```css
a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
a:hover { color: var(--accent-hover); }
a:focus-visible { outline: 3px solid rgba(var(--accent-rgb), 0.28); outline-offset: 2px; }
```

## 5. Layout Principles

**Container:**

- Aplicación de ancho completo; no usa contenedor centrado de landing.
- Altura: `100dvh` con encabezado y barra de filtros fijos dentro del flujo.
- Panel de estaciones: 380px en escritorio, 340px en tablet.
- Mapa: ocupa todo el espacio restante.

**Spacing Scale:**

- Base: 4px.
- Escala: 4, 8, 12, 16, 20, 24, 32px.
- Separación entre controles: 10px.
- Padding de fila: 16px.
- No usar espacios decorativos superiores a 32px en la vista principal.

**Grid:**

```css
.app-main {
  height: calc(100dvh - 64px);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.workspace {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr);
}
.station-panel { min-height: 0; display: flex; flex-direction: column; }
.station-list { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
```

El mapa debe ser visible inmediatamente. No existe hero, portada, sección promocional ni scroll vertical de página en escritorio.

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | Sin sombra; borde `--border` | Header, toolbar, filas, panel lateral |
| Subtle | `0 2px 8px rgba(var(--text-rgb), .14)` | Controles flotantes del mapa |
| Elevated | `0 8px 28px rgba(var(--text-rgb), .16)` | Menú de departamentos, popups |
| Modal | `0 20px 60px rgba(var(--text-rgb), .22)` | Modal de precios y reportes |

Las sombras comunican superposición real. No se usan para decorar cada superficie.

## 7. Animation & Interaction

**Motion Philosophy**: feedback corto y espacialmente predecible; los datos aparecen inmediatamente.
**Tier**: L1

### Dependencies

```html
<!-- Sin dependencias adicionales de animación -->
```

### Entrance Animation

```css
@keyframes appFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.app-shell { animation: appFadeIn 220ms cubic-bezier(.16, 1, .3, 1) both; }
```

No se anima cada estación al cargar. Una lista larga debe estar disponible inmediatamente.

### Hover & Focus States

```css
button, [role='button'], input, select { transition-duration: 160ms; transition-timing-function: ease; }
button:active, [role='button']:active { transform: scale(.98); }
:focus-visible { outline: 3px solid rgba(var(--accent-rgb), .28); outline-offset: 2px; }
```

### Map transitions

- Cambio de departamento: `setView`, sin vuelo largo entre países.
- Cambio de ciudad: zoom directo y predecible, máximo 250ms si se anima.
- Clic en marcador: abre popup sin mover el mapa.
- Clic en fila: centra la estación con una transición máxima de 250ms.
- Los cambios SSE actualizan datos sin animar posiciones ni reorganizar agresivamente la lista durante una interacción.

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 8. Do's and Don'ts

### Do

- Mostrar el mapa y los filtros en el primer viewport.
- Mantener la lista con desplazamiento propio y barra visible.
- Ordenar sin ubicación por saldo, venta activa y venta reciente.
- Ordenar con ubicación por cercanía y saldo, mostrando distancia.
- Mantener etiquetas persistentes sobre controles; el placeholder nunca reemplaza una etiqueta.
- Mostrar actualización, errores y estados vacíos con texto directo.
- Utilizar Lucide para iconografía consistente.
- Conservar atribución de OpenStreetMap y CARTO visible.
- Mantener objetivos táctiles de al menos 44px.
- Utilizar datos reales; no inventar cantidades, porcentajes ni tiempos de espera.

### Don't

- ❌ No añadir hero, slogan gigante, eyebrow decorativo ni texto promocional.
- ❌ No usar serif, beige, textura de papel, grano, glassmorphism ni gradientes.
- ❌ No envolver cada estación en una tarjeta flotante.
- ❌ No usar sombras y bordes simultáneamente en todas las superficies.
- ❌ No exceder 16px de radio; los radios grandes quedan reservados para píldoras de estado y controles circulares.
- ❌ No animar listas largas ni usar parallax, scroll reveal o movimiento cinematográfico.
- ❌ No mover el mapa al pulsar un marcador.
- ❌ No aceptar geolocalización imprecisa o fuera de Bolivia para validar reportes.
- ❌ No mezclar el catálogo de precios con los productos de disponibilidad.
- ❌ No expresar `alto/medio/bajo` como porcentajes o litros.
- ❌ No ocultar la barra de desplazamiento de estaciones.
- ❌ No usar color como único medio para comunicar estado.

## 9. Responsive Behavior

**Breakpoints:**

| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1100px | Panel 380px, mapa visible, filtros en una fila |
| Tablet | 700px–1100px | Panel 340px, filtros en dos filas, mapa visible |
| Mobile | < 700px | Mapa/lista alternados mediante tabs inferiores; filtros en hoja compacta |

**Touch Targets:** mínimo 44×44px.

**Collapsing Strategy:**

- Escritorio y tablet mantienen lista y mapa simultáneos mientras exista ancho útil.
- Móvil muestra mapa por defecto y permite alternar a lista; nunca intenta comprimir ambos paneles.
- Departamento, ciudad y combustible permanecen accesibles sin scroll horizontal.
- La búsqueda ocupa una fila completa en móvil.
- Los modales usan ancho de viewport menos 16px por lado y respetan áreas seguras.

```css
@media (max-width: 1100px) {
  .filter-toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .search-control { grid-column: 1 / -1; }
  .workspace { grid-template-columns: 340px minmax(0, 1fr); }
}

@media (max-width: 700px) {
  .app-header { min-height: 56px; padding: 0 12px; }
  .filter-toolbar { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 10px; }
  .workspace { display: block; }
  .station-panel, .map-shell { height: calc(100dvh - 230px); }
  .station-panel[hidden], .map-shell[hidden] { display: none; }
  .search-control { grid-column: 1 / -1; }
  .mobile-tabs { display: flex; padding-bottom: env(safe-area-inset-bottom); }
}

@media (max-width: 430px) {
  .filter-toolbar { grid-template-columns: 1fr; }
  .search-control { grid-column: auto; }
  .station-panel, .map-shell { height: calc(100dvh - 330px); }
}
```

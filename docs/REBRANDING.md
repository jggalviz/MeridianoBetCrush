# Rebranding a Meridianobet Crush (rojo / oro / azul de consola)

La interfaz esta partida en dos capas para poder cambiar la identidad visual
**sin tocar la logica del juego** ni el pipeline de cache:

| Capa | Archivo | Se edita para |
| --- | --- | --- |
| Maqueta base | `public/src/css/style.css` | Geometria, arte (marcos, consola), animaciones |
| Marca | `public/src/css/theme.css` | Paleta, acentos, superficies, tipografia, relieve |

`theme.css` se carga **despues** de `style.css` (ambos en `public/index.html`) y
todos sus selectores llevan el prefijo `html[data-theme="meridianobet"]`, asi
que ganan por especificidad sin `!important` y sin duplicar la maqueta.

## Que puede repintar el tema (y que no)

No todo el juego es CSS. La ultima capa de `style.css` viste la maquina con
**arte bitmap** colocado por porcentajes medidos sobre cada dibujo, asi que hay
que distinguir dos grupos antes de tocar nada:

| Superficie | Como se pinta | Editable desde `theme.css` |
| --- | --- | --- |
| Barra superior, boton "Fichas de Prueba", modal, anillo de foco | CSS | **Si** |
| Marco interior del tablero (`.board`, `.tile`) | Gradientes CSS | **Si** |
| Carcasa de controles, placas y botones (escritorio) | Recortes de `d2.webp` | No: reexportar arte |
| Nube del logo (`.machine__hero`, escritorio) | `d2.webp` | No: reexportar arte |
| Marco del tablero (escritorio) | `d1.webp` | No: reexportar arte |
| Carcasa movil (`.machine__table`, `.controls`) | `marco_movil.webp`, `consola_movil.webp` | No: reexportar arte |
| Fondo de escenario y logotipo | `fondo_desktop` / `fondo_movil`, `PANA-CRUSH-LOGO.webp` | No: reexportar arte |
| Simbolos del tablero | `public/src/assets/symbols/*.png` | No: reexportar arte |

La barra superior y las 30 casillas se pintan con el **azul de la consola**:
`theme.css` define `--brand-blue` / `--brand-blue-deep` (los mismos tonos que
`--gbtn-blue-*` en `style.css`) y `--brand-blue-ink` para contornos y sombras. La
barra es vidrio translucido (degradado con alfa + `backdrop-filter`) y las
casillas son vidrio claro sobre el **panel marino** del tablero, asi la ventana
del `d1` —azul profundo con filo dorado— queda integrada con el arte en vez de
abrir un hueco claro dentro de una maquina oscura.

El interior del tablero no lo pinta el arte: el hueco del `d1.webp` es
transparente y lo rellena `.board`. `style.css` deja ahi el panel marino de
partida y `theme.css` lo repite con los tokens de marca (brillo de estadio
arriba, reflejo dorado al pie y filo dorado). Las casillas bajan a vidrio con
alfa para que el panel se siga leyendo por detras y el filo blanco translucido
mantiene separadas las 30 celdas.

Consecuencia practica: los tokens de caramelo de `style.css`
(`--candy-solid-body`, `--candy-solid-wash`, `--candy-rim`, `--candy-depth`,
`--gbtn-*`) **ya no se ven** en la maqueta final: el arte ocupa su lugar. Por eso
`theme.css` no los reasigna: hacerlo no cambiaria un pixel y confundiria al
siguiente que lo lea. Cuando se reexporte el arte con la paleta de marca, esos
tokens se pueden retirar de `style.css` o reutilizarse para las piezas nuevas.

## Activar / desactivar el tema

El tema **ya esta activo**: `public/index.html` abre con

```html
<html lang="es" data-theme="meridianobet">
```

Para volver al look candy original (comparativa o rollback) borra el atributo:

```html
<html lang="es">
```

Despues de editar el HTML:

```bash
npm run build:index     # public/index.html -> server/generated/indexHtml.js
npm start
```

El test `test/deploymentConfig.test.js` falla si te olvidas del `build:index`.

## Paleta

Todo se define una vez, en el bloque `:root` de `theme.css`:

```css
--brand-red: #c8102e;        /* accion, cifras, acentos */
--brand-red-dark: #8f0a1f;   /* bordes y relieve */
--brand-red-soft: #e04a5f;   /* hover / degradados */
--brand-white: #ffffff;      /* superficies */
--brand-grey-50: #f7f8fa;
--brand-grey-100: #eef0f4;
--brand-grey-200: #dcdfe6;   /* bordes */
--brand-grey-700: #4a505b;   /* texto secundario */
--brand-ink: #1b1e23;        /* texto principal */
```

Los tokens historicos del tema base magenta (`--mint`, `--coral`, `--mango`) se
remapean a la paleta de marca dentro del bloque del tema. `--gold` y `--lime` se
dejan **intactos** a proposito: son el color del premio (saldo, simbolo `S9`,
placa MAX) y siguen leyendose bien sobre las superficies nuevas. Si cambia el
rojo corporativo, basta con editar `--brand-red` y sus dos variantes.

Tipografia: `--brand-font` y `--brand-font-display` ya apuntan a los WOFF2
locales (Fredoka / Lilita One, servidos desde `public/src/assets/fonts`). Para
cambiar de familia hay que anadir los `@font-face` en `style.css` y actualizar
estas dos variables; la CSP (`font-src 'self'`) exige servir las fuentes desde
el propio origen.

## Logotipo

1. Deja el maestro en `design/` (fuera de `public/`, no viaja al CDN).
2. Optimiza el asset servido dentro de `public/src/assets/`.
3. Cambia solo el `src` (y el `alt`) de:

```html
<img class="machine__logo" src="/src/assets/MERIDIANOBET-CRUSH-LOGO.webp"
     alt="MeridianoBet Crush" width="480" height="240" fetchpriority="high" />
```

   El tamano reservado (`width`/`height`) evita saltos de layout y declara la
   proporcion real del arte, **2:1** (900 x 450, sin margen transparente). En
   movil la caja del logo (`--logo-w` / `--logo-h` en `style.css`) usa esa misma
   proporcion y la imagen la rellena entera; si se cambia el arte por otro de
   distinta relacion hay que actualizar ambos sitios o el `object-fit: contain`
   devolvera el aire dentro de la caja.
   La caja movil apunta al **78 % del ancho del marco** con un tope por el cielo
   real (`--logo-sky`): en telefonos altos manda el 78 % y el logo se apoya sobre
   la franja de monedas y banderines del marco, justo encima del HUD; en 320 px
   manda el tope y la pegatina se queda con el aire justo, sin tocar la barra
   superior ni generar scroll horizontal.
   Entre **600 y 899 px** (tablets verticales y escritorios pequenos con alto de
   sobra, `min-height: 521px`) el marco se estira hasta la barra superior y su
   unico cielo es ese 19,87 % del arte, asi que la chapa se quedaba en el 27 % del
   marco. Ese tramo reserva un aire vertical propio (`--logo-air`: 8 % del alto
   del escenario, 78 px de techo) que se descuenta del alto libre de la maquina
   via `--m-w`; la mitad de arriba entra en `--logo-sky` y el logo sube al 36 %
   del marco (247 px a 768 x 1024, 289 px a 899 x 1200) manteniendo su base, la
   holgura sobre el HUD y el aire bajo la barra superior. El tablero pierde como
   mucho un 8 % de ancho en ese tramo; por debajo de 600 px y por encima de
   900 px no cambia nada.
   La barra del navegador movil usa la meta `theme-color`, ya en rojo de marca:
   `<meta name="theme-color" content="#c8102e" />`.

   En escritorio (`min-width: 900px`) el logo no va en una tarjeta: se pega en el
   hueco azul de la nube que dibuja `d2.webp`, centrado en el 50 % / 21,6 % de ese
   lienzo. La caja mide el **43,2 % del ancho** del lienzo (283 x 141,5 px sobre
   655 x 928), que es el 120 % del 36 % anterior: el interior azul liso de la nube
   mide 397 x 179 px, asi que quedan ~20 px de aire arriba y abajo y la animacion
   (`pana-logo-breathe`, sube 7 px y escala un 3 %) no toca el borde dorado. En
   ventanas bajas (`max-height: 660px`) el lienzo se queda en ~340 px de ancho y el
   logo baja al 39,6 % (120 % del 33 % anterior) con el centro en 21,8 %.

Pendiente de arte (ver la tabla de alcance): las carcasas moviles
(`marco_movil.webp`, `consola_movil.webp`) y los simbolos del tablero. El arte de
escritorio ya es el del tema: el marco (`d1.webp`) y la columna lateral entera
(`d2.webp`, que funde la nube del logo, las placas y la consola en una pieza).
Mientras el movil siga con el arte original, esa vista se lee como "interfaz de
marca dentro del marco candy".

Los simbolos del tablero (20 PNG en `public/src/assets/symbols/`) se mapean en
`ui/lib/format.js` (`SYMBOL_IMAGE_PATH`). Si se sustituyen por iconografia de
marca, hay que conservar los nombres `candy_*.png` o actualizar ese mapeo;
`test/frontendAssets.test.js` valida que las 11 imagenes existan.

Ese set **no es deportivo y no debe serlo**: la tematica de balones, monedas y
banderines vive solo en el marco (`d1`/`d2`) y en los fondos. Las casillas que
giran son caramelos, gominolas, galletas y piruletas, y un test
(`los simbolos del tablero giran con caramelos, no con arte deportivo`) falla si
el mapa apunta a otra carpeta o a un asset con nombre deportivo. `ui/` es la
fuente: `npm run build:ui` materializa el espejo byte a byte de `public/ui/`.

## Textos y componentes

| Zona | Archivo |
| --- | --- |
| Cabecera, HUD, botones, modal | `public/index.html` |
| Renderer del tablero, HUD, modal de reglas, overlay WIN | `ui/renderers/GameView.js` |
| Efectos (chispas, lluvia de monedas, cartel de premio) | `ui/renderers/fx.js` |
| Niveles de premio y umbrales | `ui/lib/winLevel.js` |
| Formato de importes | `ui/lib/format.js` |
| Estilos | `public/src/css/style.css` + `public/src/css/theme.css` |

Reglas de arquitectura que **no** se deben romper (`test/uiArchitecture.test.js`):
`ApiClient` es el unico modulo con red, `GameController` no toca el DOM, y los
renderers solo pintan el payload del servidor (la cifra final siempre viene del
backend).

## Cache y publicacion

- `public/ui/**` es un espejo generado desde `ui/`: tras editar `ui/` ejecuta
  `npm run build:ui` (o `npm start`, que lo hace en `prestart`). El test
  `uiArchitecture.test.js` falla si el espejo queda desactualizado.
- Ningun asset lleva hash en el nombre: Express sirve `public/**` con
  `Cache-Control: no-cache` y `vercel.json` revalida `/src/(.*)` y `/ui/(.*)`.
  Un cambio de CSS o JS se ve al recargar; no hay que tocar versiones.
- `theme.css` vive en `public/src/css/`, cubierto por la regla `/src/(.*)` de
  `vercel.json`, asi que hereda la misma politica sin cambios de configuracion.

## Checklist al terminar el rebranding

1. `html data-theme="meridianobet"` en `public/index.html` (ya puesto).
2. `npm run build:index && npm run build:ui && npm run build:config`.
3. `npm test`: la unica familia de tests que fija la identidad candy es
   `test/frontendAssets.test.js` (respaldo `#0a1c4a`, fondo de escritorio
   `fondo_desk_meridino_crush.webp`, arte `d1/d2` y geometria del marco). Esas
   aserciones describen la maqueta base; si el rebranding tambien cambia el arte,
   hay que actualizar esos valores en el test junto con `style.css`. El mismo test
   comprueba que `theme.css` siga siendo CSS plano, sin `!important`, con prefijo
   de tema y sin medidas.
4. Revisar contraste de texto (WCAG AA) sobre blanco y sobre el rojo.
5. `npm start` + `/api/health` deben seguir mostrando `operator.mode =
   LOCAL_VIRTUAL_DEMO` y una ronda completa debe pagar igual que antes: el
   rebranding es solo presentacion.
6. Si se reexportan los assets, actualizar tambien la tabla de alcance de este
   documento y quitar de `theme.css` las excepciones que dejen de aplicar.

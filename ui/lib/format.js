/**
 * Metadatos de simbolos y formateo. Nada de logica de juego: el cliente solo
 * pinta lo que recibe del servidor.
 */

import { GRID } from '../config/gameConfig.js';

/*
 * Mapa visual de los 11 simbolos del motor sobre los assets de MERIDIANOBET
 * CRUSH. El tablero solo usa los dos motivos de la marca:
 *
 *   - Las nueve pelotas deportivas (`s1.png` .. `s9.png`), de la que menos
 *     paga a la que mas: el numero del archivo coincide con el tramo de la
 *     tabla de pagos.
 *   - El logotipo de MeridianoBet (`s10.png`), que entra por dos puertas: como
 *     scatter (SC), el simbolo que mejor paga, y como multiplicador (MX), que
 *     se pinta con su valor encima (2x .. 250x) y sobrevive a las cascadas.
 *
 * `image` es la fuente principal de la casilla; `glyph` queda como fallback
 * accesible si la imagen no llega a cargar.
 */
const SYMBOL_IMAGE_PATH = '/src/assets/slot/';
const BRAND_LOGO_IMAGE = `${SYMBOL_IMAGE_PATH}s10.png`;

export const SYMBOLS = Object.freeze({
  S1: { glyph: '⚾', name: 'Béisbol', image: `${SYMBOL_IMAGE_PATH}s1.png` },
  S2: { glyph: '⚽', name: 'Balón de fútbol', image: `${SYMBOL_IMAGE_PATH}s2.png` },
  S3: { glyph: '🎾', name: 'Pelota de tenis', image: `${SYMBOL_IMAGE_PATH}s3.png` },
  S4: { glyph: '🏈', name: 'Balón de fútbol americano', image: `${SYMBOL_IMAGE_PATH}s4.png` },
  S5: { glyph: '🏀', name: 'Balón de básquet', image: `${SYMBOL_IMAGE_PATH}s5.png` },
  S6: { glyph: '⛳', name: 'Pelota de golf', image: `${SYMBOL_IMAGE_PATH}s6.png` },
  S7: { glyph: '🏐', name: 'Balón de vóley', image: `${SYMBOL_IMAGE_PATH}s7.png` },
  S8: { glyph: '🎱', name: 'Bola 8', image: `${SYMBOL_IMAGE_PATH}s8.png` },
  S9: { glyph: '🎳', name: 'Bola de bolos', image: `${SYMBOL_IMAGE_PATH}s9.png` },
  SC: { glyph: '✨', name: 'Logo MeridianoBet (scatter)', image: BRAND_LOGO_IMAGE },
  MX: { glyph: '💠', name: 'Logo MeridianoBet (multiplicador)', image: BRAND_LOGO_IMAGE }
});

export const SYMBOL_KEYS = Object.freeze(['S9', 'S8', 'S7', 'S6', 'S5', 'S4', 'S3', 'S2', 'S1']);

const CREDIT_FORMAT = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const PLAIN_FORMAT = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

/** Centimos enteros -> "1.234,56" */
export function formatCents(cents) {
  const value = Number(cents);
  if (!Number.isFinite(value)) return '0,00';
  return CREDIT_FORMAT.format(value / 100);
}

/** Creditos (numero con decimales) -> "1.234,56" */
export function formatCredits(credits) {
  const value = Number(credits);
  if (!Number.isFinite(value)) return '0,00';
  return CREDIT_FORMAT.format(value);
}

/** Numero generico sin ceros forzados. */
export function formatPlain(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return PLAIN_FORMAT.format(n);
}

export function formatMultiplier(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `${PLAIN_FORMAT.format(n)}×`;
}

export function formatPercent(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${(n * 100).toFixed(digits)} %`;
}

export function symbolMeta(symbol) {
  return SYMBOLS[symbol] || { glyph: '❔', name: symbol || '—' };
}

/** Celda -> clave de celda usada por las animaciones. */
export function cellKey(r, c, cols = GRID.cols) {
  return r * cols + c;
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

/** Identificador de ronda para la clave de idempotencia (32 hex). */
export function makeRoundRef() {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Semilla informativa del cliente (ASCII imprimible, max 64). */
export function makeClientSeed() {
  return makeRoundRef().slice(0, 24);
}

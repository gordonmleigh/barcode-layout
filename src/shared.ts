import { random } from "lodash-es";
import luhn from "luhn-js";

export interface ElementClickData {
  element: HTMLElement;
  offset: Point;
}

export interface Point {
  x: number;
  y: number;
}

export function generateEAN13() {
  return generateEanCheckDigit(generateRandomNumber(12));
}

export function generateIMEI(tac = "35671211") {
  return luhn.generate(tac + generateRandomNumber(6));
}

export function generateICCID() {
  return luhn.generate("89" + generateRandomNumber(17));
}

export function generateUPC() {
  return generateEanCheckDigit(generateRandomNumber(11));
}

function generateRandomNumber(n: number): string {
  let snr = "";
  for (let i = 0; i < n; ++i) {
    snr += random(0, 9);
  }
  return snr;
}

function generateEanCheckDigit(text: string): string {
  return text + eanCheckDigit(text);
}

function eanCheckDigit(text: string): string {
  const len = text.length;
  let sum = 0;

  for (let i = 0; i < len; i++) {
    const ch = parseInt(text[i], 10);
    const n = ch - 0;
    const weight = (len - i) % 2 === 1 ? 3 : 1;
    sum += weight * n;
  }

  const check = Math.ceil(sum / 10) * 10 - sum;
  return `${check}`;
}

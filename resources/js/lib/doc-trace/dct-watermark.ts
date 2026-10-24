/**
 * Invisible watermark: the document code is hidden in the luma channel by nudging two mid-frequency DCT
 * coefficients of every 8x8 block (their difference encodes one bit). Each bit is repeated over many blocks and
 * recovered by vote, so it survives JPEG recompression (quality >= ~70) and light brightness/contrast changes.
 * It does not survive cropping off the 8-pixel grid, heavy resizing, rotation or a photo of a screen.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const CODE_CHARS = 10;
const DATA_BITS = CODE_CHARS * 5;
const BITS = DATA_BITS + 16; // + CRC-16, so a wrong decode is rejected instead of guessed

/** Difference we force between the two coefficients. Higher survives more, but is easier to see. */
export const STRENGTH = 24;

const C = Array.from({ length: 8 }, (_, u) =>
    Array.from({ length: 8 }, (_, x) => Math.sqrt(u === 0 ? 1 / 8 : 2 / 8) * Math.cos(((2 * x + 1) * u * Math.PI) / 16)),
);
// coefficient pair: (row 2, col 3) against (row 3, col 2)
const [A_V, A_U, B_V, B_U] = [2, 3, 3, 2];

function crc16(bits: number[]): number {
    let crc = 0xffff;
    for (const bit of bits) {
        const top = ((crc >> 15) & 1) ^ bit;
        crc = (crc << 1) & 0xffff;
        if (top) crc ^= 0x1021;
    }
    return crc;
}

export function codeToBits(code: string): number[] {
    const bits: number[] = [];
    for (const ch of code.toUpperCase().padEnd(CODE_CHARS, 'A').slice(0, CODE_CHARS)) {
        const v = ALPHABET.indexOf(ch);
        for (let i = 4; i >= 0; i--) bits.push((v >> i) & 1);
    }
    const crc = crc16(bits);
    for (let i = 15; i >= 0; i--) bits.push((crc >> i) & 1);

    return bits;
}

export function bitsToCode(bits: number[]): string | null {
    const data = bits.slice(0, DATA_BITS);
    const crc = bits.slice(DATA_BITS).reduce((a, b) => (a << 1) | b, 0);
    if (crc16(data) !== crc) return null;
    let code = '';
    for (let i = 0; i < DATA_BITS; i += 5) code += ALPHABET[data.slice(i, i + 5).reduce((a, b) => (a << 1) | b, 0)];

    return code;
}

/** Which payload bit a block carries. Spreads bits across both axes so any region holds the whole payload. */
const bitIndex = (bx: number, by: number) => (Math.imul(bx, 73856093) ^ Math.imul(by, 19349663)) >>> 0;

function forward(y: Float32Array, w: number, x0: number, y0: number, out: Float64Array) {
    const tmp = new Float64Array(64);
    for (let r = 0; r < 8; r++)
        for (let v = 0; v < 8; v++) {
            let s = 0;
            for (let c = 0; c < 8; c++) s += y[(y0 + r) * w + x0 + c] * C[v][c];
            tmp[r * 8 + v] = s;
        }
    for (let v = 0; v < 8; v++)
        for (let u = 0; u < 8; u++) {
            let s = 0;
            for (let r = 0; r < 8; r++) s += tmp[r * 8 + u] * C[v][r];
            out[v * 8 + u] = s;
        }
}

function inverse(coef: Float64Array, y: Float32Array, w: number, x0: number, y0: number) {
    const tmp = new Float64Array(64);
    for (let v = 0; v < 8; v++)
        for (let c = 0; c < 8; c++) {
            let s = 0;
            for (let u = 0; u < 8; u++) s += coef[v * 8 + u] * C[u][c];
            tmp[v * 8 + c] = s;
        }
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
            let s = 0;
            for (let v = 0; v < 8; v++) s += tmp[v * 8 + c] * C[v][r];
            y[(y0 + r) * w + x0 + c] = s;
        }
}

/** Embeds the code into a luma plane in place. */
export function embedLuma(luma: Float32Array, w: number, h: number, code: string, strength = STRENGTH) {
    const bits = codeToBits(code);
    const coef = new Float64Array(64);
    for (let by = 0; by < Math.floor(h / 8); by++)
        for (let bx = 0; bx < Math.floor(w / 8); bx++) {
            forward(luma, w, bx * 8, by * 8, coef);
            const want = bits[bitIndex(bx, by) % BITS] ? strength : -strength;
            const diff = coef[A_V * 8 + A_U] - coef[B_V * 8 + B_U];
            if (want > 0 ? diff < want : diff > want) {
                const shift = (want - diff) / 2;
                coef[A_V * 8 + A_U] += shift;
                coef[B_V * 8 + B_U] -= shift;
                inverse(coef, luma, w, bx * 8, by * 8);
            }
        }
}

/** Reads the code back from a luma plane, or null when no valid payload is found. */
export function extractLuma(luma: Float32Array, w: number, h: number, strength = STRENGTH): string | null {
    const score = new Float64Array(BITS);
    const coef = new Float64Array(64);
    let blocks = 0;
    for (let by = 0; by < Math.floor(h / 8); by++)
        for (let bx = 0; bx < Math.floor(w / 8); bx++) {
            forward(luma, w, bx * 8, by * 8, coef);
            const diff = coef[A_V * 8 + A_U] - coef[B_V * 8 + B_U];
            score[bitIndex(bx, by) % BITS] += Math.max(-1, Math.min(1, diff / strength)); // clipped, so one loud block cannot swing a bit
            blocks++;
        }
    if (blocks < BITS * 2) return null; // too small to hold the payload twice

    return bitsToCode(Array.from(score, (s) => (s > 0 ? 1 : 0)));
}

function lumaOf(img: ImageData): Float32Array {
    const { data, width, height } = img;
    const y = new Float32Array(width * height);
    for (let i = 0; i < y.length; i++) y[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];

    return y;
}

/** Hides the code in the picture's brightness; colour is left as it was. */
export function embedImageData(img: ImageData, code: string, strength = STRENGTH) {
    const before = lumaOf(img);
    const after = Float32Array.from(before);
    embedLuma(after, img.width, img.height, code, strength);
    const d = img.data;
    for (let i = 0; i < before.length; i++) {
        const delta = after[i] - before[i];
        if (delta === 0) continue;
        for (let k = 0; k < 3; k++) d[i * 4 + k] = Math.max(0, Math.min(255, Math.round(d[i * 4 + k] + delta)));
    }
}

export function extractImageData(img: ImageData, strength = STRENGTH): string | null {
    return extractLuma(lumaOf(img), img.width, img.height, strength);
}

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
    return toHex(await crypto.subtle.digest('SHA-256', data as BufferSource));
}

const N = 32;
const KEEP = 8;
const COS = Array.from({ length: KEEP }, (_, u) => Array.from({ length: N }, (_, x) => Math.cos(((2 * x + 1) * u * Math.PI) / (2 * N))));

/**
 * 64-bit perceptual hash (pHash): shrink to 32x32 grey, take the 8x8 lowest DCT frequencies,
 * and set each bit by whether it is above the median. Survives recompression and light resizing.
 */
export function phashFromCanvas(source: CanvasImageSource): string {
    const c = document.createElement('canvas');
    c.width = c.height = N;
    const ctx = c.getContext('2d', { willReadFrequently: true })!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, N, N);
    ctx.drawImage(source, 0, 0, N, N);
    const px = ctx.getImageData(0, 0, N, N).data;
    const grey = new Float64Array(N * N);
    for (let i = 0; i < N * N; i++) grey[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];

    // separable DCT, only the KEEP x KEEP corner is needed
    const rows = new Float64Array(N * KEEP);
    for (let y = 0; y < N; y++)
        for (let u = 0; u < KEEP; u++) {
            let s = 0;
            for (let x = 0; x < N; x++) s += grey[y * N + x] * COS[u][x];
            rows[y * KEEP + u] = s;
        }
    const coef: number[] = [];
    for (let v = 0; v < KEEP; v++)
        for (let u = 0; u < KEEP; u++) {
            let s = 0;
            for (let y = 0; y < N; y++) s += rows[y * KEEP + u] * COS[v][y];
            coef.push(s);
        }

    const sorted = coef.slice(1).sort((a, b) => a - b); // median without the DC term
    const median = sorted[Math.floor(sorted.length / 2)];
    let hex = '';
    for (let i = 0; i < 64; i += 4) {
        let nib = 0;
        for (let b = 0; b < 4; b++) nib = (nib << 1) | (coef[i + b] > median ? 1 : 0);
        hex += nib.toString(16);
    }
    return hex;
}

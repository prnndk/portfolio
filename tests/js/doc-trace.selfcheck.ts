// Run: npm run test:doc-trace   (bundles with esbuild, runs on Node; no browser needed)
import assert from 'node:assert/strict';
import { readTraceMeta, writeTraceMeta } from '../../resources/js/lib/doc-trace/image-meta';
import { bitsToCode, codeToBits, embedLuma, extractLuma } from '../../resources/js/lib/doc-trace/dct-watermark';
import { fillFooter, fillLines, fillTemplate, layoutMarks, parseRange, styleForPage, DEFAULT_SETTINGS } from '../../resources/js/lib/doc-trace/template';

// ── payload round trip and CRC rejection
assert.equal(bitsToCode(codeToBits('K7QZ2MNPA4')), 'K7QZ2MNPA4');
const bad = codeToBits('K7QZ2MNPA4');
bad[3] ^= 1;
assert.equal(bitsToCode(bad), null, 'a flipped bit must be rejected, not guessed');

// ── DCT watermark survives JPEG-style quantisation of the luma channel
const W = 512;
const H = 384;
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const photo = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) photo[y * W + x] = 128 + 60 * Math.sin(x / 37) * Math.cos(y / 23) + (rnd() - 0.5) * 24;

const marked = Float32Array.from(photo);
embedLuma(marked, W, H, 'K7QZ2MNPA4');
assert.equal(extractLuma(marked, W, H), 'K7QZ2MNPA4', 'clean extract');
assert.equal(extractLuma(photo, W, H), null, 'unmarked picture must not decode');

const Q50 = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 100, 72, 92, 95, 98, 112, 100, 103, 99];
const Cm = Array.from({ length: 8 }, (_, u) => Array.from({ length: 8 }, (_, x) => Math.sqrt(u === 0 ? 1 / 8 : 2 / 8) * Math.cos(((2 * x + 1) * u * Math.PI) / 16)));
function jpegLuma(src: Float32Array, quality: number): Float32Array {
    const scale = quality < 50 ? 5000 / quality : 200 - quality * 2;
    const out = Float32Array.from(src).map((v) => Math.round(Math.max(0, Math.min(255, v)))); // 8-bit rounding like a real decode
    for (let by = 0; by < H / 8; by++)
        for (let bx = 0; bx < W / 8; bx++) {
            const co = new Float64Array(64);
            for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) {
                let s = 0;
                for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) s += (out[(by * 8 + r) * W + bx * 8 + c] - 128) * Cm[v][r] * Cm[u][c];
                const q = Math.max(1, Math.floor((Q50[v * 8 + u] * scale + 50) / 100));
                co[v * 8 + u] = Math.round(s / q) * q;
            }
            for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
                let s = 0;
                for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) s += co[v * 8 + u] * Cm[v][r] * Cm[u][c];
                out[(by * 8 + r) * W + bx * 8 + c] = Math.round(Math.max(0, Math.min(255, s + 128)));
            }
        }
    return out;
}
for (const q of [90, 80, 70]) assert.equal(extractLuma(jpegLuma(marked, q), W, H), 'K7QZ2MNPA4', `survives JPEG quality ${q}`);

// brightness / contrast change
const contrast = marked.map((v) => Math.max(0, Math.min(255, (v - 128) * 0.9 + 140)));
assert.equal(extractLuma(contrast, W, H), 'K7QZ2MNPA4', 'survives light contrast/brightness change');

// ── metadata survives in PNG text chunks and JPEG comments (hand-built minimal files)
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0, 0, 0, 0]);
assert.equal(readTraceMeta(png), null);
assert.equal(readTraceMeta(writeTraceMeta(png, 'K7QZ2MNPA4')), 'K7QZ2MNPA4', 'png tEXt round trip');
const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2]);
assert.equal(readTraceMeta(writeTraceMeta(jpg, 'K7QZ2MNPA4')), 'K7QZ2MNPA4', 'jpeg COM round trip');

// ── templates and per-page rules
const ctx = { recipient: 'Budi', issuer: 'Arya', date: '1 Jan', year: '2026', page: 2, pages: 5, code: 'K7QZ2MNPA4', pageCode: 'ABCDEFGH' };
assert.equal(fillTemplate('{recipient} p{page}/{pages} {nope}', ctx), 'Budi p2/5 {nope}');
assert.deepEqual(fillLines('CONFIDENTIAL\n{recipient}', { ...ctx, recipient: '' }), ['CONFIDENTIAL'], 'empty variable drops its line');
const foot = '© {year} {issuer} · Provided only to {recipient} · {date} · ID {code}-{pageCode} · Do not distribute';
assert.equal(fillFooter(foot, ctx), '© 2026 Arya · Provided only to Budi · 1 Jan · ID K7QZ2MNPA4-ABCDEFGH · Do not distribute');
assert.equal(fillFooter(foot, { ...ctx, recipient: '', issuer: '', code: '', pageCode: '' }), '1 Jan · Do not distribute', 'unregistered footer has no dangling parts');
assert.deepEqual([...parseRange('1-3, 5, 9', 6)], [1, 2, 3, 5]);
const s = { ...DEFAULT_SETTINGS, rules: [{ range: '1-2', style: { text: 'DRAFT' } }, { range: '2', style: { enabled: false } }] };
assert.equal(styleForPage(s, 1, 5).text, 'DRAFT');
assert.equal(styleForPage(s, 2, 5).enabled, false);
assert.equal(styleForPage(s, 3, 5).text, DEFAULT_SETTINGS.watermark.text);

// ── layout: a tile covers the page, tighter gaps give more copies, single layouts give one
const tile = DEFAULT_SETTINGS.watermark;
const loose = layoutMarks(595, 842, 180, 30, { ...tile, gapX: 2, gapY: 5 }).length;
const tight = layoutMarks(595, 842, 180, 30, { ...tile, gapX: 0.2, gapY: 0.5 }).length;
assert.ok(tight > loose && loose > 3, `tight ${tight} > loose ${loose}`);
assert.equal(layoutMarks(595, 842, 180, 30, { ...tile, layout: 'center' }).length, 1);
assert.ok(layoutMarks(100, 100, 1, 1, { ...tile, gapX: 0, gapY: 0 }).length <= 1500, 'mark count is capped');

console.log('doc-trace self-check OK');

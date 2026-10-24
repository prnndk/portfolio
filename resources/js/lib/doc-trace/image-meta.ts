/** Tiny readers/writers for the trace code stored in a PNG text chunk or a JPEG comment. No library needed. */

const KEY = 'GadingTrace';
const te = new TextEncoder();

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});
const crc32 = (bytes: Uint8Array) => {
    let c = 0xffffffff;
    for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};

const isPng = (b: Uint8Array) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
const isJpeg = (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8;

/** Returns a copy of the picture with the code written into its metadata. Other formats come back unchanged. */
export function writeTraceMeta(file: Uint8Array, code: string): Uint8Array {
    if (isPng(file)) {
        const data = te.encode(`${KEY}\0${code}`);
        const chunk = new Uint8Array(12 + data.length);
        const dv = new DataView(chunk.buffer);
        dv.setUint32(0, data.length);
        chunk.set(te.encode('tEXt'), 4);
        chunk.set(data, 8);
        dv.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
        const at = 8 + 25; // signature + IHDR chunk
        const out = new Uint8Array(file.length + chunk.length);
        out.set(file.subarray(0, at));
        out.set(chunk, at);
        out.set(file.subarray(at), at + chunk.length);

        return out;
    }
    if (isJpeg(file)) {
        const data = te.encode(`${KEY}=${code}`);
        const seg = new Uint8Array(4 + data.length);
        seg.set([0xff, 0xfe, (data.length + 2) >> 8, (data.length + 2) & 0xff]);
        seg.set(data, 4);
        const out = new Uint8Array(file.length + seg.length);
        out.set(file.subarray(0, 2));
        out.set(seg, 2);
        out.set(file.subarray(2), 2 + seg.length);

        return out;
    }

    return file;
}

/** Reads the trace code back, if the picture still carries it. */
export function readTraceMeta(file: Uint8Array): string | null {
    const td = new TextDecoder();
    const dv = new DataView(file.buffer, file.byteOffset, file.byteLength);
    if (isPng(file)) {
        for (let p = 8; p + 12 <= file.length; ) {
            const len = dv.getUint32(p);
            const type = td.decode(file.subarray(p + 4, p + 8));
            if (type === 'tEXt') {
                const m = td.decode(file.subarray(p + 8, p + 8 + len)).match(new RegExp(`^${KEY}\\0([A-Z2-7]{10})$`));
                if (m) return m[1];
            }
            if (type === 'IDAT' || type === 'IEND') break;
            p += 12 + len;
        }
    } else if (isJpeg(file)) {
        for (let p = 2; p + 4 <= file.length && file[p] === 0xff; ) {
            const marker = file[p + 1];
            const len = dv.getUint16(p + 2);
            if (marker === 0xfe) {
                const m = td.decode(file.subarray(p + 4, p + 2 + len)).match(new RegExp(`^${KEY}=([A-Z2-7]{10})$`));
                if (m) return m[1];
            }
            if (marker === 0xda) break;
            p += 2 + len;
        }
    }

    return null;
}

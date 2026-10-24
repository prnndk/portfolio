/**
 * The passphrase never leaves the browser. One PBKDF2 run yields two keys:
 *  - encKey encrypts the details (AES-256-GCM) and is never sent anywhere;
 *  - authKey is sent to the server as proof of knowledge, so ciphertext can only be fetched through a throttled endpoint.
 */
export const KDF = { alg: 'PBKDF2-SHA256' as const, iter: 600_000 };

export const toB64 = (b: ArrayBuffer | Uint8Array) => {
    const bytes = b instanceof Uint8Array ? b : new Uint8Array(b);
    let s = '';
    for (const x of bytes) s += String.fromCharCode(x);
    return btoa(s);
};
export const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export const randomB64 = (bytes: number) => toB64(crypto.getRandomValues(new Uint8Array(bytes)));

export interface Details {
    purpose?: string;
    note?: string;
    originalFilename?: string;
    issuerContact?: string;
}

export async function deriveKeys(passphrase: string, saltB64: string, iter: number) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase.normalize('NFKC')), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(
        await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(saltB64) as BufferSource, iterations: iter }, base, 512),
    );
    const encKey = await crypto.subtle.importKey('raw', bits.slice(0, 32), 'AES-GCM', false, ['encrypt', 'decrypt']);

    return { encKey, authKey: toB64(bits.slice(32, 64)) };
}

export async function encryptDetails(encKey: CryptoKey, details: Details) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encKey, new TextEncoder().encode(JSON.stringify(details)));

    return { ciphertext: toB64(data), iv: toB64(iv) };
}

export async function decryptDetails(encKey: CryptoKey, ciphertext: string, iv: string): Promise<Details> {
    const data = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) as BufferSource }, encKey, fromB64(ciphertext) as BufferSource);

    return JSON.parse(new TextDecoder().decode(data));
}

/** 0-4, rough guide only: length and character variety. */
export function passphraseStrength(p: string): number {
    if (p.length < 10) return 0;
    const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
    return Math.min(4, (p.length >= 16 ? 2 : 1) + (kinds >= 3 ? 2 : kinds >= 2 ? 1 : 0));
}

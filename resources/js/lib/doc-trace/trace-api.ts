import { type Details, KDF, deriveKeys, encryptDetails, randomB64 } from './passphrase';
import type { ProtectSettings, TraceMode } from './template';

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public errors: Record<string, string[]> = {},
    ) {
        super(message);
    }
}

const xsrf = () => decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1] ?? '');

async function post<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-XSRF-TOKEN': xsrf() },
        credentials: 'same-origin',
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message =
            res.status === 429
                ? 'Too many attempts. Please wait a moment and try again.'
                : (data.message as string) || `Request failed (${res.status})`;
        throw new ApiError(res.status, message, data.errors);
    }

    return data as T;
}

export interface TraceInput {
    kind: 'pdf' | 'image';
    mode: TraceMode;
    pages: number;
    recipient: string;
    issuer: string;
    details: Details;
    passphrase: string;
    settings: ProtectSettings;
}

export interface CreatedTrace {
    code: string;
    pageCodes: string[];
    verifyUrl: string;
    token: string;
}

/** Registers a draft. The details are encrypted here; the server only ever sees ciphertext and a proof-of-knowledge key. */
export async function createTrace(i: TraceInput): Promise<CreatedTrace> {
    const salt = randomB64(16);
    const { encKey, authKey } = await deriveKeys(i.passphrase, salt, KDF.iter);
    const hasDetails = Object.values(i.details).some(Boolean);
    const enc = hasDetails ? await encryptDetails(encKey, i.details) : null;

    const r = await post<{ code: string; page_codes: string[]; verify_url: string; finalize_token: string }>('/tools/trace', {
        rights: true,
        kind: i.kind,
        mode: i.mode,
        recipient_name: i.recipient,
        issuer_name: i.issuer || null,
        page_count: i.pages,
        settings: i.settings,
        details_ciphertext: enc?.ciphertext ?? null,
        details_iv: enc?.iv ?? null,
        details_salt: salt,
        details_kdf: KDF,
        auth_key: authKey,
        website: '', // honeypot
    });

    return { code: r.code, pageCodes: r.page_codes, verifyUrl: r.verify_url, token: r.finalize_token };
}

export const finalizeTrace = (code: string, token: string, sha256: string, phashes: string[]) =>
    post<{ seal: string }>(`/tools/trace/${code}/finalize`, { token, sha256, phashes });

export interface VerifyResult {
    status: 'authentic' | 'registered' | 'modified' | 'revoked' | 'unknown';
    matched_by: 'sha256' | 'page_code' | 'code' | 'phash' | null;
    seal_valid: boolean;
    pages: number[];
    public_key: string | null;
    trace: null | {
        code: string;
        kind: 'pdf' | 'image';
        mode: TraceMode;
        recipient_name: string;
        issuer_name: string | null;
        page_count: number;
        issued_at: string;
        revoked_at: string | null;
        has_details: boolean;
        kdf: { alg: string; iter: number; salt: string };
    };
}

export const verifyRequest = (body: { sha256?: string; code?: string; page_codes?: string[]; phashes?: string[] }) =>
    post<VerifyResult>('/tools/verify', body);

export async function unlockDetails(code: string, authKey: string) {
    return post<{ ciphertext: string; iv: string }>(`/tools/verify/${code}/unlock`, { auth_key: authKey });
}

export const revokeTrace = (code: string, authKey: string) => post<{ revoked: boolean }>(`/tools/trace/${code}/revoke`, { auth_key: authKey });

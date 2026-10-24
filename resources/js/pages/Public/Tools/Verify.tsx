import { Field, Panel, inputCls } from '@/components/doc-trace/fields';
import { ToolShell } from '@/components/doc-trace/tool-shell';
import { Button } from '@/components/ui/button';
import { type Details, decryptDetails, deriveKeys } from '@/lib/doc-trace/passphrase';
import { ApiError, type VerifyResult, revokeTrace, unlockDetails, verifyRequest } from '@/lib/doc-trace/trace-api';
import { type Extracted, extractFromFile } from '@/lib/doc-trace/verify';
import { cn } from '@/lib/utils';
import { BadgeCheck, CircleHelp, FileSearch, FileWarning, Loader2, LockKeyhole, ShieldAlert, ShieldX, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

type Initial = Omit<VerifyResult, 'public_key'> | null;

const STATUS = {
    authentic: {
        icon: BadgeCheck,
        tone: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
        title: 'Authentic',
        body: 'This is the exact file that was issued, and its seal is valid.',
    },
    registered: {
        icon: FileSearch,
        tone: 'border-sky-500/40 bg-sky-500/5 text-sky-600 dark:text-sky-400',
        title: 'Record found',
        body: 'A document with this code was issued. Upload the file to prove it is the same one.',
    },
    modified: {
        icon: FileWarning,
        tone: 'border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400',
        title: 'Traced, but not the original',
        body: 'This is not the exact file that was issued, yet it carries the identifiers of the record below. It was edited, re-saved or re-exported.',
    },
    revoked: {
        icon: ShieldX,
        tone: 'border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400',
        title: 'Revoked',
        body: 'The issuer has revoked this document. Do not rely on it.',
    },
    unknown: {
        icon: CircleHelp,
        tone: 'border-border bg-muted/40 text-muted-foreground',
        title: 'No record found',
        body: 'Nothing in the registry matches this file. It may never have been registered, or it was changed too much to be recognised.',
    },
} as const;

const MATCHED = { sha256: 'exact file hash', page_code: 'page code', code: 'document code', phash: 'perceptual (look-alike) hash' } as const;

const dateFmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });

export default function Verify({ initial, publicKey }: { initial: Initial; publicKey: string | null }) {
    const [result, setResult] = useState<Initial>(initial);
    const [found, setFound] = useState<Extracted | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [manual, setManual] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [details, setDetails] = useState<Details | null>(null);
    const [authKey, setAuthKey] = useState<string | null>(null);
    const [confirmRevoke, setConfirmRevoke] = useState(false);

    const show = (r: Initial) => {
        setResult(r);
        setDetails(null);
        setAuthKey(null);
        setConfirmRevoke(false);
    };

    const onDrop = useCallback(async (accepted: File[]) => {
        const file = accepted[0];
        if (!file) return;
        try {
            setBusy('Reading the file…');
            const x = await extractFromFile(file, (n, t) => setBusy(`Checking page ${n} of ${t}…`));
            setFound(x);
            setBusy('Looking it up…');
            show(await verifyRequest({ sha256: x.sha256, code: x.code ?? undefined, page_codes: x.pageCodes, phashes: x.phashes }));
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : 'This file could not be checked.');
            console.error(e);
        } finally {
            setBusy(null);
        }
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: { 'application/pdf': ['.pdf'], 'image/*': [] },
    });

    const lookup = async () => {
        const v = manual.trim().toUpperCase().replace(/\s/g, '');
        // a pasted verify link or "CODE-PAGECODE" both work
        const m = v.match(/([A-Z2-7]{10})(?:-([A-Z2-7]{8}))?$/) ?? v.match(/^([A-Z2-7]{8})$/);
        if (!m) return toast.error('Enter a 10-character document code or an 8-character page code.');
        setFound(null);
        try {
            setBusy('Looking it up…');
            show(
                m[0].length === 8
                    ? await verifyRequest({ page_codes: [m[0]] })
                    : await verifyRequest({ code: m[1], page_codes: m[2] ? [m[2]] : undefined }),
            );
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : 'Lookup failed.');
        } finally {
            setBusy(null);
        }
    };

    const trace = result?.trace;
    const unlock = async () => {
        if (!trace) return;
        try {
            setBusy('Unlocking…');
            const { encKey, authKey: key } = await deriveKeys(passphrase, trace.kdf.salt, trace.kdf.iter);
            const { ciphertext, iv } = await unlockDetails(trace.code, key);
            setDetails(await decryptDetails(encKey, ciphertext, iv));
            setAuthKey(key);
            setPassphrase('');
        } catch (e) {
            toast.error(e instanceof ApiError ? (e.status === 403 ? 'Wrong passphrase.' : e.message) : 'Could not unlock the details.');
        } finally {
            setBusy(null);
        }
    };
    const revoke = async () => {
        if (!trace || !authKey) return;
        try {
            await revokeTrace(trace.code, authKey);
            toast.success('Document revoked.');
            setResult({ ...result!, status: 'revoked', trace: { ...trace, revoked_at: new Date().toISOString() } });
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : 'Could not revoke.');
        }
        setConfirmRevoke(false);
    };

    const s = result ? STATUS[result.status] : null;

    return (
        <ToolShell
            title="Verify Document"
            subtitle="Check where a PDF or picture came from • the file stays on your device"
            seoTitle="Verify a Document – Trace a Shared PDF or Image Back to Its Source"
            description="Upload a PDF or picture to find out whether it is an authentic, registered document, who it was prepared for and whether it was altered. Only hashes and codes are sent; the file never leaves your browser."
            url="/tools/verify"
            icon={FileSearch}
        >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            'flex min-h-[14rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition-colors',
                            isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5',
                        )}
                    >
                        <input {...getInputProps()} />
                        {busy ? <Loader2 className="h-9 w-9 animate-spin text-primary" /> : <Upload className="h-9 w-9 text-primary" />}
                        <div aria-live="polite">
                            <h2 className="text-lg font-semibold">
                                {busy ?? (isDragActive ? 'Drop the file here' : 'Drop a PDF or picture to verify')}
                            </h2>
                            <p className="text-sm text-muted-foreground">Hashes and codes are read in your browser. The file is never uploaded.</p>
                        </div>
                    </div>

                    <Panel title="Or look up a code">
                        <Field label="Document code, page code or verify link">
                            <div className="flex gap-2">
                                <input
                                    value={manual}
                                    onChange={(e) => setManual(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && lookup()}
                                    placeholder="e.g. K7QZ2MNPA4 or K7QZ2MNPA4-ABCDEFGH"
                                    className={`${inputCls} font-mono`}
                                    spellCheck={false}
                                />
                                <Button type="button" onClick={lookup} disabled={!!busy}>
                                    Look up
                                </Button>
                            </div>
                        </Field>
                        <p className="text-xs text-muted-foreground">
                            A code only shows that a record exists. To prove a file is the original, drop the file above.
                        </p>
                    </Panel>

                    {publicKey && (
                        <details className="rounded-2xl border border-border bg-card p-4 text-sm">
                            <summary className="cursor-pointer font-medium">Seal public key (Ed25519)</summary>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Every sealed document is signed by this server with the matching private key, so the seal can be checked independently
                                of this page.
                            </p>
                            <p className="mt-2 font-mono text-xs break-all">{publicKey}</p>
                        </details>
                    )}
                </div>

                <div className="flex flex-col gap-4">
                    {!result || !s ? (
                        <div className="flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                            <ShieldAlert className="h-9 w-9" />
                            <p className="text-sm">The result appears here.</p>
                        </div>
                    ) : (
                        <>
                            <div className={cn('flex flex-col gap-2 rounded-2xl border p-5', s.tone)} role="status">
                                <div className="flex items-center gap-3">
                                    <s.icon className="h-7 w-7 shrink-0" />
                                    <h2 className="font-heading text-2xl font-extrabold tracking-[-0.03em]">{s.title}</h2>
                                </div>
                                <p className="text-sm text-foreground/80">{s.body}</p>
                            </div>

                            {trace && (
                                <Panel title="Record">
                                    <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
                                        <dt className="text-muted-foreground">Prepared for</dt>
                                        <dd className="font-medium">{trace.recipient_name}</dd>
                                        {trace.issuer_name && (
                                            <>
                                                <dt className="text-muted-foreground">Issued by</dt>
                                                <dd>{trace.issuer_name}</dd>
                                            </>
                                        )}
                                        <dt className="text-muted-foreground">Issued</dt>
                                        <dd>{dateFmt(trace.issued_at)}</dd>
                                        <dt className="text-muted-foreground">Document code</dt>
                                        <dd className="font-mono">{trace.code}</dd>
                                        <dt className="text-muted-foreground">Type</dt>
                                        <dd>
                                            {trace.kind === 'pdf' ? `PDF, ${trace.page_count} page${trace.page_count === 1 ? '' : 's'}` : 'Picture'}
                                        </dd>
                                        {result.matched_by && (
                                            <>
                                                <dt className="text-muted-foreground">Matched by</dt>
                                                <dd>{MATCHED[result.matched_by]}</dd>
                                            </>
                                        )}
                                        {result.matched_by &&
                                            result.matched_by !== 'code' &&
                                            trace.kind === 'pdf' &&
                                            result.pages.length < trace.page_count && (
                                                <>
                                                    <dt className="text-muted-foreground">Pages found</dt>
                                                    <dd className="font-mono">{result.pages.join(', ')}</dd>
                                                </>
                                            )}
                                        <dt className="text-muted-foreground">Seal</dt>
                                        <dd>{result.seal_valid ? 'Valid signature' : 'Not applicable to this file'}</dd>
                                        {trace.revoked_at && (
                                            <>
                                                <dt className="text-muted-foreground">Revoked</dt>
                                                <dd>{dateFmt(trace.revoked_at)}</dd>
                                            </>
                                        )}
                                    </dl>
                                    {found && found.layers.length > 0 && (
                                        <p className="text-xs text-muted-foreground">Found in the file: {found.layers.join(', ')}.</p>
                                    )}
                                </Panel>
                            )}

                            {trace?.has_details && (
                                <Panel title="Private details">
                                    {details ? (
                                        <>
                                            <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
                                                {details.purpose && (
                                                    <>
                                                        <dt className="text-muted-foreground">Purpose</dt>
                                                        <dd>{details.purpose}</dd>
                                                    </>
                                                )}
                                                {details.note && (
                                                    <>
                                                        <dt className="text-muted-foreground">Notes</dt>
                                                        <dd className="whitespace-pre-wrap">{details.note}</dd>
                                                    </>
                                                )}
                                                {details.originalFilename && (
                                                    <>
                                                        <dt className="text-muted-foreground">Original file</dt>
                                                        <dd className="break-all">{details.originalFilename}</dd>
                                                    </>
                                                )}
                                                {details.issuerContact && (
                                                    <>
                                                        <dt className="text-muted-foreground">Issuer contact</dt>
                                                        <dd>{details.issuerContact}</dd>
                                                    </>
                                                )}
                                            </dl>
                                            {!trace.revoked_at &&
                                                (confirmRevoke ? (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm">Revoke permanently?</span>
                                                        <Button type="button" size="sm" variant="destructive" onClick={revoke}>
                                                            Yes, revoke
                                                        </Button>
                                                        <Button type="button" size="sm" variant="outline" onClick={() => setConfirmRevoke(false)}>
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        className="self-start"
                                                        onClick={() => setConfirmRevoke(true)}
                                                    >
                                                        Revoke this document
                                                    </Button>
                                                ))}
                                        </>
                                    ) : (
                                        <>
                                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <LockKeyhole className="h-4 w-4" />
                                                Locked with the creator's passphrase. It is checked in your browser.
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="password"
                                                    value={passphrase}
                                                    onChange={(e) => setPassphrase(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && passphrase && unlock()}
                                                    className={inputCls}
                                                    placeholder="Passphrase"
                                                    autoComplete="off"
                                                    aria-label="Passphrase"
                                                />
                                                <Button type="button" onClick={unlock} disabled={!passphrase || !!busy}>
                                                    Open
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Panel>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ToolShell>
    );
}

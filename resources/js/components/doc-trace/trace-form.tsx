import { passphraseStrength } from '@/lib/doc-trace/passphrase';
import { cn } from '@/lib/utils';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { Check, Field, Panel, inputCls } from './fields';

export interface TraceFormValues {
    enabled: boolean;
    recipient: string;
    issuer: string;
    purpose: string;
    note: string;
    issuerContact: string;
    passphrase: string;
    passphrase2: string;
    rights: boolean;
}

export const EMPTY_TRACE: TraceFormValues = {
    enabled: false,
    recipient: '',
    issuer: '',
    purpose: '',
    note: '',
    issuerContact: '',
    passphrase: '',
    passphrase2: '',
    rights: false,
};

/** Returns the first problem with the form, or null when it can be submitted. */
export function traceProblem(v: TraceFormValues): string | null {
    if (!v.recipient.trim()) return 'Enter who this document is for.';
    if (v.passphrase.length < 10) return 'The passphrase needs at least 10 characters.';
    if (v.passphrase !== v.passphrase2) return 'The two passphrases do not match.';
    if (!v.rights) return 'Confirm that you have the right to share this document.';

    return null;
}

const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export function TraceForm({ value, onChange }: { value: TraceFormValues; onChange: (v: TraceFormValues) => void }) {
    const set = (p: Partial<TraceFormValues>) => onChange({ ...value, ...p });
    const strength = passphraseStrength(value.passphrase);

    return (
        <Panel
            title="Trace this document"
            aside={
                <Check checked={value.enabled} onChange={(enabled) => set({ enabled })}>
                    Register it
                </Check>
            }
        >
            {!value.enabled ? (
                <p className="text-sm text-muted-foreground">
                    Register the document so you can prove later where a shared copy came from, even if the watermark is gone. Only hashes and the
                    recipient's name reach the server, never the file.
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Prepared for (name)" hint="Shown on the verify page. No email is collected.">
                            <input
                                value={value.recipient}
                                maxLength={120}
                                onChange={(e) => set({ recipient: e.target.value })}
                                className={inputCls}
                                autoComplete="off"
                            />
                        </Field>
                        <Field label="Issued by" hint="Optional. Shown as the issuer.">
                            <input
                                value={value.issuer}
                                maxLength={120}
                                onChange={(e) => set({ issuer: e.target.value })}
                                className={inputCls}
                                autoComplete="off"
                            />
                        </Field>
                    </div>

                    <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
                        <p className="flex items-center gap-2 text-sm font-medium">
                            <KeyRound className="h-4 w-4 text-primary" />
                            Private details, locked with your passphrase
                        </p>
                        <Field label="Purpose">
                            <input
                                value={value.purpose}
                                onChange={(e) => set({ purpose: e.target.value })}
                                className={inputCls}
                                placeholder="e.g. Loan application, Bank X"
                            />
                        </Field>
                        <Field label="Notes">
                            <textarea
                                value={value.note}
                                onChange={(e) => set({ note: e.target.value })}
                                rows={2}
                                className={`${inputCls} h-auto py-2`}
                            />
                        </Field>
                        <Field label="Your contact">
                            <input value={value.issuerContact} onChange={(e) => set({ issuerContact: e.target.value })} className={inputCls} />
                        </Field>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="Passphrase">
                                <input
                                    type="password"
                                    value={value.passphrase}
                                    onChange={(e) => set({ passphrase: e.target.value })}
                                    className={inputCls}
                                    autoComplete="new-password"
                                />
                            </Field>
                            <Field label="Repeat passphrase">
                                <input
                                    type="password"
                                    value={value.passphrase2}
                                    onChange={(e) => set({ passphrase2: e.target.value })}
                                    className={inputCls}
                                    autoComplete="new-password"
                                />
                            </Field>
                        </div>
                        <div className="flex items-center gap-3" aria-live="polite">
                            <div className="flex flex-1 gap-1">
                                {[1, 2, 3, 4].map((n) => (
                                    <span
                                        key={n}
                                        className={cn(
                                            'h-1.5 flex-1 rounded-full bg-muted',
                                            strength >= n && (strength < 2 ? 'bg-red-500' : strength < 3 ? 'bg-amber-500' : 'bg-emerald-500'),
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">{STRENGTH[strength]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            The details are encrypted in this browser. The server cannot read them, and{' '}
                            <strong>a lost passphrase cannot be recovered</strong>. The same passphrase is needed to revoke the document.
                        </p>
                    </div>

                    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                    <Check checked={value.rights} onChange={(rights) => set({ rights })}>
                        I have the right to share this document and to register the name above.
                    </Check>
                    <p className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                        Stored permanently: the recipient's name, the file's hashes and the encrypted details. To have a record removed, use the
                        contact page.
                    </p>
                </>
            )}
        </Panel>
    );
}

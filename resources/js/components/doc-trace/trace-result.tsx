import { Button } from '@/components/ui/button';
import { Check, Copy, Download, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export interface TraceReceipt {
    code: string;
    verifyUrl: string;
    sha256: string;
    seal: string;
    pageCodes: string[];
}

function CopyRow({ label, value }: { label: string; value: string }) {
    const [done, setDone] = useState(false);

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
            <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
                <p className="truncate font-mono text-sm">{value}</p>
            </div>
            <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Copy ${label}`}
                onClick={() => {
                    navigator.clipboard?.writeText(value).then(() => {
                        setDone(true);
                        setTimeout(() => setDone(false), 1500);
                    });
                }}
            >
                {done ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    );
}

/** Shown after a document is built. For a registered document it carries the code and verify link to keep. */
export function TraceResult({ receipt, onDownload, onReset }: { receipt: TraceReceipt | null; onDownload: () => void; onReset: () => void }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 font-heading text-lg font-bold">
                <Check className="h-5 w-5 text-emerald-500" />
                {receipt ? 'Document registered and ready' : 'Document ready'}
            </div>
            {receipt && (
                <>
                    <CopyRow label="Document code" value={receipt.code} />
                    <CopyRow label="Verify link" value={receipt.verifyUrl} />
                    <CopyRow label="SHA-256 of this file" value={receipt.sha256} />
                    <p className="text-xs text-muted-foreground">
                        {receipt.pageCodes.length} page code{receipt.pageCodes.length === 1 ? '' : 's'} issued. Keep your passphrase safe: it opens
                        the private details and is the only way to revoke this document.
                    </p>
                </>
            )}
            <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={onDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download again
                </Button>
                <Button type="button" variant="outline" onClick={onReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Start over
                </Button>
            </div>
        </div>
    );
}

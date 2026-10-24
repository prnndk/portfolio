import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export const inputCls =
    'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50';

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <label className={cn('flex flex-col gap-1.5', className)}>
            <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{label}</span>
            {children}
            {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </label>
    );
}

export function Range({
    label,
    value,
    min,
    max,
    step = 1,
    unit = '',
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (v: number) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{label}</span>
                <span className="font-mono text-xs tabular-nums">
                    {Number.isInteger(step) ? value : value.toFixed(1)}
                    {unit}
                </span>
            </div>
            <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} aria-label={label} />
        </div>
    );
}

export function Check({
    checked,
    onChange,
    children,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    children: ReactNode;
    disabled?: boolean;
}) {
    return (
        <label className={cn('flex cursor-pointer items-start gap-2.5 text-sm', disabled && 'cursor-not-allowed opacity-50')}>
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>{children}</span>
        </label>
    );
}

export function Segmented<T extends string>({
    value,
    options,
    onChange,
}: {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <div className="grid auto-cols-fr grid-flow-col rounded-lg border border-border bg-muted/40 p-1">
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    onClick={() => onChange(o.value)}
                    aria-pressed={value === o.value}
                    className={cn(
                        'min-h-9 rounded-md px-3 text-sm font-medium transition-colors',
                        value === o.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

export function Panel({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
    return (
        <section className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-heading text-lg font-bold tracking-[-0.02em]">{title}</h3>
                {aside}
            </div>
            <div className="flex flex-col gap-4">{children}</div>
        </section>
    );
}

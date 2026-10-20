'use client';

export function DotGridBg() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div
                className="absolute inset-0 opacity-40 dark:opacity-50"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, var(--border) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                }}
            />
            <div
                className="absolute -top-[20%] -right-[10%] h-[60vw] w-[60vw] rounded-full opacity-60"
                style={{
                    background:
                        'radial-gradient(circle, color-mix(in oklch, var(--primary) 15%, transparent) 0%, transparent 70%)',
                }}
            />
        </div>
    );
}

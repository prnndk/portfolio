import { Mascot, type MascotPose } from '@/components/portfolio/mascot';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react';

/** Shared container width for every public section. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>;
}

interface SectionHeaderProps {
    index?: string;
    label: string;
    title: ReactNode;
    action?: { href: string; label: string };
    className?: string;
}

/** "01 / Work" eyebrow, display title, optional right-aligned link. */
export function SectionHeader({ index, label, title, action, className }: SectionHeaderProps) {
    return (
        <div className={cn('mb-12 flex flex-wrap items-end justify-between gap-6', className)}>
            <div className="flex flex-col gap-3">
                <span className="section-index">
                    {index && <span className="text-primary">{index} / </span>}
                    {label}
                </span>
                <h2 className="font-heading text-4xl leading-[0.95] font-extrabold tracking-[-0.045em] text-balance md:text-6xl">
                    {typeof title === 'string' ? <SplitText text={title} /> : title}
                </h2>
            </div>
            {action && (
                <Link
                    href={action.href}
                    className="group inline-flex min-h-11 items-center gap-1.5 border-b border-foreground/30 font-mono text-sm transition-colors hover:border-primary hover:text-primary"
                >
                    {action.label}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
            )}
        </div>
    );
}

/** Infinite horizontal ticker. Content is duplicated once so the -50% loop is seamless. */
export function Marquee({ items, className, duration = 30, reverse }: { items: string[]; className?: string; duration?: number; reverse?: boolean }) {
    const row = (hidden?: boolean) => (
        <div aria-hidden={hidden} className="flex shrink-0 items-center gap-10 pr-10">
            {items.map((item) => (
                <span key={item} className="flex items-center gap-10">
                    {item}
                    <span className="size-2 rounded-full bg-current opacity-40" />
                </span>
            ))}
        </div>
    );

    return (
        <div className={cn('overflow-hidden', className)}>
            <div
                className="flex w-max [animation:var(--animate-marquee)]"
                style={{ ['--marquee-duration' as string]: `${duration}s`, animationDirection: reverse ? 'reverse' : undefined }}
            >
                {row()}
                {row(true)}
            </div>
        </div>
    );
}

/** Card that tilts in 3D toward the pointer (CSS transforms, no WebGL). */
export function TiltCard({ className, children, max = 8 }: { className?: string; children: ReactNode; max?: number }) {
    const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
    const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

    return (
        <motion.div
            style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
            onPointerMove={(e) => {
                if (e.pointerType !== 'mouse') return;
                const box = e.currentTarget.getBoundingClientRect();
                ry.set(((e.clientX - box.left) / box.width - 0.5) * max * 2);
                rx.set(-((e.clientY - box.top) / box.height - 0.5) * max * 2);
            }}
            onPointerLeave={() => {
                rx.set(0);
                ry.set(0);
            }}
            className={cn('[transform-style:preserve-3d]', className)}
        >
            {children}
        </motion.div>
    );
}

/** Link that drifts toward the cursor while hovered. */
export function MagneticLink({ className, children, ...props }: ComponentProps<typeof Link>) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useSpring(0, { stiffness: 250, damping: 18 });
    const y = useSpring(0, { stiffness: 250, damping: 18 });

    return (
        <motion.div
            ref={ref}
            style={{ x, y }}
            className="inline-flex"
            onPointerMove={(e) => {
                const box = ref.current?.getBoundingClientRect();
                if (!box || e.pointerType !== 'mouse') return;
                x.set((e.clientX - box.left - box.width / 2) * 0.3);
                y.set((e.clientY - box.top - box.height / 2) * 0.3);
            }}
            onPointerLeave={() => {
                x.set(0);
                y.set(0);
            }}
        >
            <Link className={className} {...props}>
                {children}
            </Link>
        </motion.div>
    );
}

/** Title that rises in letter by letter when scrolled into view. Screen readers get the plain text. */
export function SplitText({ text, className }: { text: string; className?: string }) {
    let n = 0;
    return (
        <span className={className} aria-label={text}>
            {text.split(' ').map((word, w) => (
                <span key={w} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                    {word.split('').map((char, c) => (
                        <motion.span
                            key={c}
                            className="inline-block"
                            initial={{ y: '110%', rotate: 6 }}
                            whileInView={{ y: 0, rotate: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.6, delay: n++ * 0.025, ease: [0.2, 0.8, 0.2, 1] }}
                        >
                            {char}
                        </motion.span>
                    ))}
                    {w < text.split(' ').length - 1 && ' '}
                </span>
            ))}
        </span>
    );
}

/** Soft ring that trails the mouse and swells over links and buttons. Fine pointers only. */
export function CustomCursor() {
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const sx = useSpring(x, { stiffness: 450, damping: 36, mass: 0.4 });
    const sy = useSpring(y, { stiffness: 450, damping: 36, mass: 0.4 });
    const [active, setActive] = useState(false);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        setEnabled(true);
        const move = (e: PointerEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
            setActive(!!(e.target as Element | null)?.closest?.('a, button, [role="button"], canvas'));
        };
        window.addEventListener('pointermove', move);
        return () => window.removeEventListener('pointermove', move);
    }, [x, y]);

    if (!enabled) return null;

    return (
        <motion.div
            aria-hidden="true"
            style={{ x: sx, y: sy }}
            className="pointer-events-none fixed top-0 left-0 z-[70] -mt-4 -ml-4 hidden size-8 md:block"
        >
            <motion.div
                animate={{ scale: active ? 1.9 : 1, opacity: active ? 0.9 : 0.55 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="size-8 rounded-full border-2 border-primary bg-primary/10"
            />
        </motion.div>
    );
}

/** Animated "move & click" hint: a cursor glides across a pill and taps, with a ripple. */
export function CursorHint({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-3 rounded-full border border-border bg-card/80 py-2 pr-4 pl-2 backdrop-blur', className)}>
            <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                <span className="absolute inset-0 [animation:var(--animate-ripple)] rounded-full border-2 border-primary" aria-hidden="true" />
                <svg
                    viewBox="0 0 24 24"
                    className="size-5 [animation:var(--animate-cursor-hint)] fill-foreground stroke-background"
                    aria-hidden="true"
                >
                    <path d="M5 3l14 7.5-6 1.8-2.2 6.2L5 3z" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
            </span>
            <span className="font-mono text-[0.7rem] leading-tight tracking-[0.08em] uppercase">
                Move to look
                <span className="block text-muted-foreground">Click to make it hop</span>
            </span>
        </div>
    );
}

/** Rotating circular text badge. */
export function SpinBadge({ text, className }: { text: string; className?: string }) {
    return (
        <div className={cn('relative size-32', className)} aria-hidden="true">
            <svg viewBox="0 0 200 200" className="size-full [animation:var(--animate-spin-slow)]">
                <defs>
                    <path id="spin-badge-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <circle cx="100" cy="100" r="98" className="fill-primary" />
                <text fontSize="15" letterSpacing="4" className="fill-primary-foreground font-mono">
                    <textPath href="#spin-badge-path">{text}</textPath>
                </text>
            </svg>
            <ArrowUpRight className="absolute inset-0 m-auto size-10 text-primary-foreground" />
        </div>
    );
}

/** Live clock for a time zone, updated each second after hydration. */
export function LiveClock({ timeZone, className }: { timeZone: string; className?: string }) {
    const [now, setNow] = useState<string | null>(null);
    useEffect(() => {
        const fmt = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const tick = () => setNow(fmt.format(new Date()));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [timeZone]);
    return <span className={cn('tabular-nums', className)}>{now ?? '--:--:--'}</span>;
}

/** Container with the vertical padding every inner page uses under the floating nav. */
export function PageContainer({ className, children }: { className?: string; children: ReactNode }) {
    return <Container className={cn('pt-28 pb-24 md:pt-36 md:pb-32', className)}>{children}</Container>;
}

/** Dashed empty state with the mascot. */
export function EmptyBlock({ text, title, pose = 'lost' }: { text: string; title?: string; pose?: MascotPose }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-12 text-center">
            <Mascot pose={pose} follow={false} className="h-28 w-24" />
            {title && <h3 className="font-heading text-xl font-bold tracking-[-0.02em]">{title}</h3>}
            <p className="max-w-md text-muted-foreground">{text}</p>
        </div>
    );
}

/** Pill link used for tag and type filters. */
export function FilterChip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
    return (
        <Link
            href={href}
            aria-current={active ? 'true' : undefined}
            className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-mono text-xs tracking-[0.06em] transition-colors',
                active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-foreground',
            )}
        >
            {children}
        </Link>
    );
}

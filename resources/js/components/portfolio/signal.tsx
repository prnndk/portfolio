import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { type ComponentProps, type ReactNode, useRef } from 'react';

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
                <h2 className="font-heading text-4xl leading-[0.95] font-extrabold tracking-[-0.045em] text-balance md:text-6xl">{title}</h2>
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
export function Marquee({ items, className, duration = 30 }: { items: string[]; className?: string; duration?: number }) {
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
            <div className="flex w-max [animation:var(--animate-marquee)]" style={{ ['--marquee-duration' as string]: `${duration}s` }}>
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

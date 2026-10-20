import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

export type MascotPose = 'idle' | 'wave' | 'coding' | 'lost';

const SKIN = '#F2C9A5';
const SKIN_SHADE = '#E3B08A';
const HAIR = '#141418';
const SHIRT = '#1A1A1E';
const MOUTH = '#7A3B2E';

/** Offset (in SVG units, max 3) pointing from the element's center toward the pointer. */
function usePointerOffset(enabled: boolean) {
    const ref = useRef<SVGSVGElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let frame = 0;
        const onMove = (e: PointerEvent) => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const box = ref.current?.getBoundingClientRect();
                if (!box) return;
                const dx = e.clientX - (box.left + box.width / 2);
                const dy = e.clientY - (box.top + box.height * 0.35);
                const len = Math.hypot(dx, dy) || 1;
                const k = Math.min(len / 200, 1) * 3;
                setOffset({ x: (dx / len) * k, y: (dy / len) * k });
            });
        };
        window.addEventListener('pointermove', onMove);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('pointermove', onMove);
        };
    }, [enabled]);

    return { ref, offset };
}

function Head({ offset, pose }: { offset: { x: number; y: number }; pose: MascotPose }) {
    const brows =
        pose === 'lost' ? 'M74 74 L92 80 M108 78 L126 78' : pose === 'wave' ? 'M74 76 L92 72 M108 72 L126 76' : 'M74 78 L92 76 M108 76 L126 78';

    return (
        <>
            <ellipse cx="54" cy="92" rx="8" ry="11" fill={SKIN_SHADE} />
            <ellipse cx="146" cy="92" rx="8" ry="11" fill={SKIN_SHADE} />
            <ellipse cx="100" cy="86" rx="46" ry="50" fill={SKIN} />
            <path d="M52 84 C44 40 70 18 104 20 C136 20 158 40 150 82 C146 66 140 58 130 52 C118 62 94 60 80 50 C72 60 62 70 52 84 Z" fill={HAIR} />
            <path d="M104 22 C110 6 126 4 134 12 C122 12 114 16 108 26 Z" fill={HAIR} />
            <path d={brows} stroke={HAIR} strokeWidth="4" strokeLinecap="round" />

            {pose === 'coding' ? (
                <path d="M78 100 L90 100 M110 100 L122 100" stroke={HAIR} strokeWidth="4.5" strokeLinecap="round" />
            ) : (
                <g className="origin-center [animation:var(--animate-mascot-blink)] [transform-box:fill-box]">
                    <g transform={`translate(${offset.x} ${offset.y})`}>
                        <circle cx="84" cy="94" r="5.5" fill={HAIR} />
                        <circle cx="116" cy="94" r="5.5" fill={HAIR} />
                        <circle cx="86" cy="92" r="1.6" fill="#fff" />
                        <circle cx="118" cy="92" r="1.6" fill="#fff" />
                    </g>
                </g>
            )}

            {pose !== 'lost' && (
                <>
                    <circle cx="72" cy="108" r="7" fill="#F09A86" opacity="0.5" />
                    <circle cx="128" cy="108" r="7" fill="#F09A86" opacity="0.5" />
                </>
            )}

            {pose === 'wave' && <path d="M84 110 Q100 130 116 110 Z" fill={MOUTH} />}
            {pose === 'idle' && <path d="M86 112 Q100 124 114 112" stroke={MOUTH} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
            {pose === 'coding' && <path d="M92 118 Q100 122 108 118" stroke={MOUTH} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
            {pose === 'lost' && <path d="M88 116 Q94 112 100 116 T112 116" stroke={MOUTH} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
        </>
    );
}

const LABELS: Record<MascotPose, string> = {
    idle: 'Gading mascot smiling with arms crossed',
    wave: 'Gading mascot waving hello',
    coding: 'Gading mascot typing on a laptop',
    lost: 'Gading mascot looking confused',
};

interface MascotProps {
    pose?: MascotPose;
    className?: string;
    /** Eyes track the pointer. */
    follow?: boolean;
}

/** Illustrated mascot drawn from Arya's photo. Pure SVG; animation is CSS and honours reduced motion. */
export function Mascot({ pose = 'idle', className, follow = true }: MascotProps) {
    const { ref, offset } = usePointerOffset(follow && pose !== 'coding');

    return (
        <svg
            ref={ref}
            viewBox="0 0 200 240"
            role="img"
            aria-label={LABELS[pose]}
            className={cn(pose !== 'coding' && pose !== 'lost' && '[animation:var(--animate-bob)]', className)}
        >
            <path d="M30 240 C30 175 60 150 100 148 C140 150 170 175 170 240 Z" fill={SHIRT} />
            <rect x="88" y="122" width="24" height="28" fill={SKIN_SHADE} />
            <path d="M100 150 L80 140 L86 168 Z M100 150 L120 140 L114 168 Z" fill="#26262C" />

            {pose === 'wave' && (
                <g className="origin-[20%_95%] [animation:var(--animate-wave)] [transform-box:fill-box]">
                    <path d="M150 176 C164 160 172 140 176 118" stroke={SHIRT} strokeWidth="26" strokeLinecap="round" fill="none" />
                    <path d="M174 128 L180 96" stroke={SKIN} strokeWidth="18" strokeLinecap="round" />
                    <circle cx="181" cy="88" r="13" fill={SKIN} />
                </g>
            )}

            {pose === 'lost' ? (
                <g className="origin-bottom [animation:var(--animate-tilt)] [transform-box:fill-box]">
                    <Head offset={offset} pose={pose} />
                </g>
            ) : (
                <Head offset={offset} pose={pose} />
            )}

            {(pose === 'idle' || pose === 'lost') && (
                <>
                    <rect x="32" y="176" width="32" height="36" rx="10" fill={SHIRT} />
                    <rect x="136" y="176" width="32" height="36" rx="10" fill={SHIRT} />
                    <rect x="46" y="192" width="108" height="28" rx="14" fill={SKIN} />
                    <path d="M100 196 L150 214" stroke={SKIN_SHADE} strokeWidth="3" strokeLinecap="round" />
                    <rect x="62" y="190" width="11" height="32" rx="3" fill="#2A2A30" />
                    <circle cx="67.5" cy="206" r="6" fill="#3A3A42" stroke="#0D0D0F" strokeWidth="1.5" />
                </>
            )}

            {pose === 'lost' && (
                <text x="160" y="60" fontSize="56" fontWeight="800" className="fill-primary font-heading">
                    ?
                </text>
            )}

            {pose === 'coding' && (
                <>
                    <path d="M36 236 L52 168 H148 L164 236 Z" fill="#2A2A30" />
                    <text x="100" y="214" textAnchor="middle" fontSize="20" className="[animation:var(--animate-blink)] fill-primary font-mono">
                        {'</>'}
                    </text>
                    <rect x="20" y="232" width="160" height="8" rx="4" fill="#3A3A42" />
                </>
            )}
        </svg>
    );
}

/** Head-only mark for logo, footer and avatar spots. */
export function MascotMark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
            <circle cx="60" cy="60" r="60" className="fill-primary" />
            <ellipse cx="60" cy="66" rx="32" ry="35" fill={SKIN} />
            <path d="M27 64 C22 34 40 18 64 20 C86 20 100 36 94 64 C91 52 86 46 80 42 C72 50 54 48 44 40 C38 48 32 56 27 64 Z" fill={HAIR} />
            <path d="M64 22 C68 10 80 8 86 14 C78 14 72 16 68 24 Z" fill={HAIR} />
            <circle cx="50" cy="70" r="4" fill={HAIR} />
            <circle cx="70" cy="70" r="4" fill={HAIR} />
            <path d="M52 84 Q60 91 68 84" stroke={MOUTH} strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
    );
}

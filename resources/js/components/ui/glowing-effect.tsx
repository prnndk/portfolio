'use client';

import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

interface GlowingCardProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    glowColor?: string;
}

export function GlowingCard({
    children,
    className,
    containerClassName,
    glowColor = 'rgba(59, 130, 246, 0.5)'
}: GlowingCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn('relative overflow-hidden rounded-xl', containerClassName)}
        >
            {/* Glow effect */}
            <div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
                }}
            />
            {/* Border glow */}
            <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                    opacity,
                    background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 40%)`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'xor',
                    WebkitMaskComposite: 'xor',
                    padding: '1px',
                }}
            />
            {/* Content */}
            <div className={cn('relative', className)}>
                {children}
            </div>
        </div>
    );
}

// Simple static glow for cards without mouse tracking
interface StaticGlowProps {
    children: React.ReactNode;
    className?: string;
}

export function StaticGlow({ children, className }: StaticGlowProps) {
    return (
        <div className={cn('group relative', className)}>
            {/* Animated glow border on hover */}
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 blur-sm transition-all duration-500 group-hover:opacity-70" />
            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 opacity-0 transition-all duration-500 group-hover:opacity-100" />

            <div className="relative rounded-xl">
                {children}
            </div>
        </div>
    );
}

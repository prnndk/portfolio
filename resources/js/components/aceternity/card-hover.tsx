'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';

interface HoverCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    onHoverChange?: (hovering: boolean) => void;
}

export function HoverCard({ children, className = '', onClick, onHoverChange }: HoverCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const setHover = (v: boolean) => {
        setIsHovering(v);
        onHoverChange?.(v);
    };

    return (
        <motion.div
            className={cn(
                'group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50',
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            {/* Gradient follow cursor */}
            <motion.div
                className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: isHovering
                        ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, color-mix(in oklch, var(--primary) 12%, transparent), transparent 40%)`
                        : 'none',
                }}
            />
            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}

interface ProjectCardProps {
    title: string;
    description: string;
    image?: string | null;
    gallery?: string[];
    tags?: string[];
    onClick?: () => void;
}

export function ProjectCard({
    title,
    description,
    image,
    gallery = [],
    tags = [],
    onClick,
}: ProjectCardProps) {
    const images = gallery.length > 0 ? gallery : image ? [image] : [];
    const [imageIdx, setImageIdx] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (!isHovering || images.length < 2) return;
        const id = setInterval(() => {
            setImageIdx((i) => (i + 1) % images.length);
        }, 1500);
        return () => clearInterval(id);
    }, [isHovering, images.length]);

    useEffect(() => {
        if (!isHovering) setImageIdx(0);
    }, [isHovering]);

    const currentSrc = images[imageIdx];

    return (
        <HoverCard className="cursor-pointer" onClick={onClick} onHoverChange={setIsHovering}>
            {currentSrc && (
                <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-muted">
                    <AnimatePresence mode="sync">
                        <motion.img
                            key={currentSrc}
                            src={currentSrc}
                            alt={title}
                            className="absolute inset-0 h-full w-full object-cover"
                            initial={{ opacity: 0, scale: 1.02 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.45 }}
                        />
                    </AnimatePresence>
                    {images.length > 1 && (
                        <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {images.map((_, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        'h-1 w-4 rounded-full bg-white/50 transition-colors',
                                        i === imageIdx && 'bg-primary',
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            <h3 className="font-heading text-lg font-semibold">{title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
            {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {tags.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </HoverCard>
    );
}

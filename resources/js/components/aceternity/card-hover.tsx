'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { type ReactNode, useState } from 'react';

interface HoverCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function HoverCard({ children, className = '', onClick }: HoverCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <motion.div
            className={cn(
                'group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50',
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            {/* Gradient follow cursor */}
            <motion.div
                className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: isHovering
                        ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(96, 165, 250, 0.1), transparent 40%)`
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
    tags?: string[];
    url?: string | null;
    githubUrl?: string | null;
    onClick?: () => void;
}

export function ProjectCard({
    title,
    description,
    image,
    tags = [],
    url,
    githubUrl,
    onClick,
}: ProjectCardProps) {
    return (
        <HoverCard className="cursor-pointer" onClick={onClick}>
            {image && (
                <div className="mb-4 aspect-video overflow-hidden rounded-lg">
                    <motion.img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            )}
            <h3 className="font-heading text-lg font-semibold">{title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
            {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {tags.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </HoverCard>
    );
}

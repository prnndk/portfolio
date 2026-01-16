'use client';

import { OrbitingCircles } from '@/components/ui/orbiting-circles';
import { type TechStack } from '@/types';
import { techIcons, techToSimpleIconSlug } from '@/lib/tech-icons';
import { Code2 } from 'lucide-react';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from '@/components/ui/empty';

interface TechStackOrbitProps {
    techStacks: TechStack[];
}

function getSimpleIcon(name: string): { svg: string; hex: string } | null {
    const lowerName = name.toLowerCase().replace(/[.\s-]/g, '');

    // Try direct lookup first (e.g. "nextjs" -> "nextdotjs")
    let iconSlug = techToSimpleIconSlug[lowerName];

    // If not found, try to find a key that is contained in the name, but prioritize longer keys to avoid "js" matching "nextjs"
    if (!iconSlug) {
        const sortedKeys = Object.keys(techToSimpleIconSlug).sort((a, b) => b.length - a.length);
        for (const key of sortedKeys) {
            if (lowerName.includes(key)) {
                iconSlug = techToSimpleIconSlug[key];
                break;
            }
        }
    }

    if (!iconSlug) return null;

    const icon = techIcons[iconSlug];

    if (icon) {
        return { svg: icon.svg, hex: icon.hex };
    }

    return null;
}

function SimpleIconSvg({ name }: { name: string }) {
    const iconData = getSimpleIcon(name);

    if (!iconData) {
        return <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{name.slice(0, 2).toUpperCase()}</span>;
    }

    return (
        <div
            className="h-full w-full flex items-center justify-center"
            style={{ color: `#${iconData.hex}` }}
            dangerouslySetInnerHTML={{ __html: iconData.svg }}
        />
    );
}

export function TechStackOrbit({ techStacks }: TechStackOrbitProps) {
    // Filter to only show tech stacks marked for orbit
    const orbitStacks = techStacks.filter(stack => stack.show_in_orbit !== false);
    const innerOrbit = orbitStacks.slice(0, 5);
    const outerOrbit = orbitStacks.slice(5, 11);

    // Show empty state if no tech stacks for orbit
    if (orbitStacks.length === 0) {
        return (
            <div className="flex h-[300px] w-full flex-col items-center justify-center">
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Code2 className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle>No tech stack yet</EmptyTitle>
                        <EmptyDescription>
                            Technologies will appear here once added from dashboard.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        );
    }

    return (
        <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
            <div className="absolute z-10 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg ring-1 ring-primary/20 backdrop-blur-sm overflow-hidden">
                <img
                    src="/memoji.png"
                    alt="Tech Stack"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    width={112}
                    height={112}
                />
            </div>

            {/* Inner Orbit */}
            <OrbitingCircles iconSize={50} radius={120} speed={0.8}>
                {innerOrbit.map((stack, i) => {
                    const iconData = getSimpleIcon(stack.name);
                    return (
                        <div
                            key={i}
                            className="flex h-full w-full items-center justify-center rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
                            title={stack.name}
                        >
                            {iconData ? (
                                <SimpleIconSvg name={stack.name} />
                            ) : stack.icon ? (
                                <img
                                    src={`/storage/${stack.icon}`}
                                    alt={stack.name}
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                />
                            ) : stack.icon_url ? (
                                <img
                                    src={stack.icon_url}
                                    alt={stack.name}
                                    className="h-full w-full object-contain"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{stack.name.slice(0, 2).toUpperCase()}</span>
                            )}
                        </div>
                    );
                })}
            </OrbitingCircles>

            {outerOrbit.length > 0 && (
                <OrbitingCircles iconSize={42} radius={200} reverse speed={0.5}>
                    {outerOrbit.map((stack, i) => {
                        const iconData = getSimpleIcon(stack.name);
                        return (
                            <div
                                key={i}
                                className="flex h-full w-full items-center justify-center rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
                                title={stack.name}
                            >
                                {iconData ? (
                                    <SimpleIconSvg name={stack.name} />
                                ) : stack.icon ? (
                                    <img
                                        src={`/storage/${stack.icon}`}
                                        alt={stack.name}
                                        className="h-full w-full object-contain"
                                        loading="lazy"
                                    />
                                ) : stack.icon_url ? (
                                    <img
                                        src={stack.icon_url}
                                        alt={stack.name}
                                        className="h-full w-full object-contain"
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{stack.name.slice(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                        );
                    })}
                </OrbitingCircles>
            )}
        </div>
    );
}

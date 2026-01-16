'use client';

import { type TechStack } from '@/types';
import { techIcons, techToSimpleIconSlug } from '@/lib/tech-icons';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';
import { useAppearance } from '@/hooks/use-appearance';

interface TechStackGridProps {
    techStacks: TechStack[];
    className?: string;
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

function TechIcon({ stack }: { stack: TechStack }) {
    const { appearance } = useAppearance();
    const isDark = appearance === 'dark';
    const iconData = getSimpleIcon(stack.name);

    if (iconData) {
        const isDarkHex = ['000000', '181717', '1b1f23', '24292e'].includes(iconData.hex.toLowerCase());
        const color = (isDark && isDarkHex) ? '#ffffff' : `#${iconData.hex}`;

        return (
            <div
                className="h-8 w-8 flex items-center justify-center transition-transform group-hover:scale-110 dark:fill-white"
                style={{ color: color }}
                dangerouslySetInnerHTML={{ __html: iconData.svg }}
            />
        );
    }

    const commonClasses = "h-8 w-8 object-contain transition-transform group-hover:scale-110";

    if (stack.icon) {
        return (
            <img
                src={`/storage/${stack.icon}`}
                alt={stack.name}
                className={commonClasses}
                loading="lazy"
                width={32}
                height={32}
            />
        );
    }

    if (stack.icon_url) {
        return (
            <img
                src={stack.icon_url}
                alt={stack.name}
                className={commonClasses}
                loading="lazy"
                width={32}
                height={32}
            />
        );
    }

    return (
        <span className="text-sm font-bold text-muted-foreground group-hover:text-foreground">
            {stack.name.slice(0, 2).toUpperCase()}
        </span>
    );
}

export function TechStackGrid({ techStacks, className }: TechStackGridProps) {
    return (
        <div className={cn('flex flex-wrap justify-center gap-6', className)}>
            {techStacks.map((stack, i) => (
                <div key={i} className="relative h-32 w-40 rounded-2xl p-[1px]">
                    <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={2}
                        variant="default"
                    />
                    <div className="relative flex h-full flex-col items-center justify-center gap-3 rounded-2xl bg-card/80 backdrop-blur-sm p-4 transition-colors group">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background p-2.5 shadow-sm ring-1 ring-border/50">
                            <TechIcon stack={stack} />
                        </div>
                        <span className="text-sm font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                            {stack.name}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}

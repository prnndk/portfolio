'use client';

import { type TechStack } from '@/types';
import * as SimpleIcons from 'simple-icons';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';
import { useAppearance } from '@/hooks/use-appearance';

interface TechStackGridProps {
    techStacks: TechStack[];
    className?: string;
}

const techToSimpleIconSlug: Record<string, string> = {
    laravel: 'laravel',
    react: 'react',
    typescript: 'typescript',
    golang: 'go',
    go: 'go',
    php: 'php',
    postgresql: 'postgresql',
    postgres: 'postgresql',
    mysql: 'mysql',
    docker: 'docker',
    javascript: 'javascript',
    js: 'javascript',
    nodejs: 'nodedotjs',
    node: 'nodedotjs',
    git: 'git',
    tailwindcss: 'tailwindcss',
    tailwind: 'tailwindcss',
    redis: 'redis',
    linux: 'linux',
    aws: 'amazonwebservices',
    kubernetes: 'kubernetes',
    k8s: 'kubernetes',
    vue: 'vuedotjs',
    vuejs: 'vuedotjs',
    angular: 'angular',
    python: 'python',
    java: 'java',
    rust: 'rust',
    swift: 'swift',
    kotlin: 'kotlin',
    flutter: 'flutter',
    dart: 'dart',
    nextjs: 'nextdotjs',
    next: 'nextdotjs',
    nuxt: 'nuxtdotjs',
    nuxtjs: 'nuxtdotjs',
    mongodb: 'mongodb',
    mongo: 'mongodb',
    graphql: 'graphql',
    sass: 'sass',
    scss: 'sass',
    css: 'css3',
    html: 'html5',
    nginx: 'nginx',
    apache: 'apache',
    figma: 'figma',
    github: 'github',
    gitlab: 'gitlab',
    bitbucket: 'bitbucket',
    vscode: 'visualstudiocode',
    vim: 'vim',
    neovim: 'neovim',
    ubuntu: 'ubuntu',
    debian: 'debian',
    centos: 'centos',
    alpine: 'alpinelinux',
    terraform: 'terraform',
    ansible: 'ansible',
    jenkins: 'jenkins',
    vercel: 'vercel',
    netlify: 'netlify',
    cloudflare: 'cloudflare',
    digitalocean: 'digitalocean',
    heroku: 'heroku',
    firebase: 'firebase',
    supabase: 'supabase',
    prisma: 'prisma',
    express: 'express',
    fastify: 'fastify',
    nestjs: 'nestjs',
    django: 'django',
    flask: 'flask',
    rails: 'rubyonrails',
    ruby: 'ruby',
    spring: 'spring',
    dotnet: 'dotnet',
    csharp: 'csharp',
    electron: 'electron',
    tauri: 'tauri',
    reactnative: 'react',
    expo: 'expo',
    webpack: 'webpack',
    vite: 'vite',
    rollup: 'rollupdotjs',
    esbuild: 'esbuild',
    bun: 'bun',
    deno: 'deno',
    pnpm: 'pnpm',
    npm: 'npm',
    yarn: 'yarn',
    jest: 'jest',
    vitest: 'vitest',
    playwright: 'playwright',
    cypress: 'cypress',
    storybook: 'storybook',
    stripe: 'stripe',
    twilio: 'twilio',
    slack: 'slack',
    discord: 'discord',
    telegram: 'telegram',
    wordpress: 'wordpress',
    shopify: 'shopify',
    magento: 'magento',
    inertia: 'inertia',
    livewire: 'livewire',
    filament: 'filament',
};

function getSimpleIcon(name: string): { svg: string; hex: string } | null {
    const lowerName = name.toLowerCase().replace(/[.\s-]/g, '');

    let iconSlug: string | undefined;
    for (const [key, slug] of Object.entries(techToSimpleIconSlug)) {
        if (lowerName.includes(key) || key.includes(lowerName)) {
            iconSlug = slug;
            break;
        }
    }

    if (!iconSlug) return null;

    const iconKey = `si${iconSlug.charAt(0).toUpperCase()}${iconSlug.slice(1)}` as keyof typeof SimpleIcons;
    const icon = SimpleIcons[iconKey];

    if (icon && typeof icon === 'object' && 'svg' in icon && 'hex' in icon) {
        return { svg: icon.svg as string, hex: icon.hex as string };
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
            />
        );
    }

    if (stack.icon_url) {
        return (
            <img
                src={stack.icon_url}
                alt={stack.name}
                className={commonClasses}
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

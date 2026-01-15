'use client';

import { OrbitingCircles } from '@/components/ui/orbiting-circles';
import { type TechStack } from '@/types';
import * as SimpleIcons from 'simple-icons';
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

function SimpleIconSvg({ name }: { name: string }) {
    const iconData = getSimpleIcon(name);

    if (!iconData) {
        return <span className="text-xs font-bold text-neutral-600">{name.slice(0, 2).toUpperCase()}</span>;
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
                />
            </div>

            {/* Inner Orbit */}
            <OrbitingCircles iconSize={50} radius={120} speed={0.8}>
                {innerOrbit.map((stack, i) => {
                    const iconData = getSimpleIcon(stack.name);
                    return (
                        <div
                            key={i}
                            className="flex h-full w-full items-center justify-center rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5 dark:bg-white/90"
                            title={stack.name}
                        >
                            {iconData ? (
                                <SimpleIconSvg name={stack.name} />
                            ) : stack.icon ? (
                                <img
                                    src={`/storage/${stack.icon}`}
                                    alt={stack.name}
                                    className="h-full w-full object-contain"
                                />
                            ) : stack.icon_url ? (
                                <img
                                    src={stack.icon_url}
                                    alt={stack.name}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <span className="text-xs font-bold text-neutral-600">{stack.name.slice(0, 2).toUpperCase()}</span>
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
                                className="flex h-full w-full items-center justify-center rounded-full bg-white p-2 shadow-lg ring-1 ring-black/5 dark:bg-white/90"
                                title={stack.name}
                            >
                                {iconData ? (
                                    <SimpleIconSvg name={stack.name} />
                                ) : stack.icon ? (
                                    <img
                                        src={`/storage/${stack.icon}`}
                                        alt={stack.name}
                                        className="h-full w-full object-contain"
                                    />
                                ) : stack.icon_url ? (
                                    <img
                                        src={stack.icon_url}
                                        alt={stack.name}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-neutral-600">{stack.name.slice(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                        );
                    })}
                </OrbitingCircles>
            )}
        </div>
    );
}

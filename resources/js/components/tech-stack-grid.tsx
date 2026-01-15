'use client';

import { type TechStack } from '@/types';
import * as SimpleIcons from 'simple-icons';
import { GlowingCard } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

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
    const iconData = getSimpleIcon(stack.name);

    if (iconData) {
        return (
            <div
                className="h-5 w-5 flex items-center justify-center"
                style={{ color: `#${iconData.hex}` }}
                dangerouslySetInnerHTML={{ __html: iconData.svg }}
            />
        );
    }

    if (stack.icon) {
        return (
            <img
                src={`/storage/${stack.icon}`}
                alt={stack.name}
                className="h-5 w-5 object-contain"
            />
        );
    }

    if (stack.icon_url) {
        return (
            <img
                src={stack.icon_url}
                alt={stack.name}
                className="h-5 w-5 object-contain"
            />
        );
    }

    return (
        <span className="text-xs font-bold text-muted-foreground">
            {stack.name.slice(0, 2).toUpperCase()}
        </span>
    );
}

export function TechStackGrid({ techStacks, className }: TechStackGridProps) {
    return (
        <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8', className)}>
            {techStacks.map((stack, i) => (
                <GlowingCard
                    key={i}
                    containerClassName="group"
                    glowColor="rgba(59, 130, 246, 0.4)"
                >
                    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/50 bg-background p-3 transition-all duration-300 group-hover:border-primary/50 group-hover:bg-muted/50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-110 dark:bg-white/90">
                            <TechIcon stack={stack} />
                        </div>
                        <span className="text-[10px] font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                            {stack.name}
                        </span>
                    </div>
                </GlowingCard>
            ))}
        </div>
    );
}

import { FadeIn } from '@/components/aceternity/text-reveal';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Props {
    title: string;
    description?: string;
    backHref?: string;
    backLabel?: string;
    children?: React.ReactNode;
}

/**
 * Shared header used on every public page.
 * Renders an optional back-link, a page title, and an optional description.
 */
export function PageHeader({ title, description, backHref = '/', backLabel = 'Back to Home', children }: Props) {
    return (
        <FadeIn>
            <div className="mb-12">
                <Link
                    href={backHref}
                    className="mb-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {backLabel}
                </Link>

                <h1 className="font-heading text-5xl leading-[0.95] font-extrabold tracking-[-0.05em] text-balance md:text-7xl">
                    {title}
                    <span className="text-primary">.</span>
                </h1>

                {description && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{description}</p>}

                {children}
            </div>
        </FadeIn>
    );
}

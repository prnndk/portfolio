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
                <Link href={backHref} className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {backLabel}
                </Link>

                <h1 className="font-heading text-4xl font-bold md:text-5xl">{title}</h1>

                {description && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>}

                {children}
            </div>
        </FadeIn>
    );
}

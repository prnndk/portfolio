import { Seo } from '@/components/seo';
import GuestLayout from '@/layouts/guest-layout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
    title: string;
    subtitle: string;
    seoTitle: string;
    description: string;
    url: string;
    icon: LucideIcon;
    children: ReactNode;
}

/** Page frame shared by the document protection tools, matching the other /tools pages. */
export function ToolShell({ title, subtitle, seoTitle, description, url, icon: Icon, children }: Props) {
    return (
        <GuestLayout>
            <Seo
                title={seoTitle}
                description={description}
                url={url}
                jsonLd={[
                    {
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: title,
                        description,
                        url: `https://aryagading.com${url}`,
                        applicationCategory: 'BusinessApplication',
                        operatingSystem: 'Any (Browser-based)',
                        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                    },
                ]}
            />
            <section className="relative pt-28 pb-16 md:pt-36">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                    <Link
                        href="/tools"
                        className="mb-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tools
                    </Link>
                    <div className="mb-8 flex items-center gap-4">
                        <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="font-heading text-3xl font-extrabold tracking-[-0.04em] md:text-5xl">{title}</h1>
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </section>
        </GuestLayout>
    );
}

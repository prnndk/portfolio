import { Button } from '@/components/ui/button';
import { type PaginatedData } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props<T> {
    paginator: Pick<PaginatedData<T>, 'last_page' | 'links'>;
    className?: string;
}

/**
 * Renders Laravel's pagination links as styled prev/next/number buttons.
 * Accepts any paginated response — just pass the paginator prop.
 */
export function Pagination<T>({ paginator, className }: Props<T>) {
    if (paginator.last_page <= 1) return null;

    return (
        <div className={`mt-12 flex justify-center gap-2 ${className ?? ''}`}>
            {paginator.links.map((link, i) => {
                if (link.url === null) return null;

                const isPrev = link.label.includes('Previous');
                const isNext = link.label.includes('Next');

                if (isPrev || isNext) {
                    return (
                        <Button key={i} variant="outline" size="icon" asChild disabled={!link.url}>
                            <Link href={link.url}>{isPrev ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}</Link>
                        </Button>
                    );
                }

                return (
                    <Button key={i} variant={link.active ? 'default' : 'outline'} asChild>
                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Button>
                );
            })}
        </div>
    );
}

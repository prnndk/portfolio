import GuestLayout from '@/layouts/guest-layout';
import { FadeIn } from '@/components/aceternity/text-reveal';
import { Button } from '@/components/ui/button';
import { type Activity } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Calendar, MapPin } from 'lucide-react';

interface Props {
    activities: {
        data: Activity[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        last_page: number;
    };
}

export default function ActivitiesIndex({ activities }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <GuestLayout>
            <Head title="Activities" />

            <div className="container mx-auto px-4 py-24">
                <FadeIn>
                    <div className="mb-12">
                        <Link
                            href="/"
                            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                        <h1 className="font-heading text-4xl font-bold md:text-5xl">
                            Activities & Experience
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                            My journey through education, work experience, and achievements.
                        </p>
                    </div>
                </FadeIn>

                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent md:before:mx-auto md:before:translate-x-0 dark:before:via-slate-700">
                    {activities.data.map((activity, index) => (
                        <FadeIn key={activity.id} delay={index * 0.1}>
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                                {/* Dot */}
                                <div className="absolute left-0 h-10 w-10 flex-shrink-0 translate-x-1/2 rounded-full border-4 border-background bg-primary md:left-1/2 md:-translate-x-1/2" />

                                {/* Content */}
                                <div className="ml-16 w-full md:w-[calc(50%-2.5rem)] md:ml-0 md:mr-0">
                                    <Link
                                        href={`/activities/${activity.id}`}
                                        className="group block rounded-xl border border-border/50 bg-card p-6 transition-colors hover:border-primary/50 hover:shadow-lg"
                                    >
                                        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {activity.start_date ? formatDate(activity.start_date) : ''}
                                                {activity.end_date && ` - ${formatDate(activity.end_date)}`}
                                            </span>
                                        </div>
                                        <h3 className="mb-1 font-heading text-xl font-bold group-hover:text-primary">
                                            {activity.title}
                                        </h3>
                                        <p className="mb-4 text-sm font-medium text-muted-foreground">
                                            {activity.organization}
                                        </p>
                                        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                            {activity.description}
                                        </p>
                                    </Link>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* Pagination */}
                {activities.last_page > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                        {activities.links.map((link, i) => {
                            if (link.url === null) return null;
                            const isPrev = link.label.includes('Previous');
                            const isNext = link.label.includes('Next');

                            if (isPrev || isNext) {
                                return (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="icon"
                                        asChild
                                        disabled={!link.url}
                                    >
                                        <Link href={link.url}>
                                            {isPrev ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                        </Link>
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    asChild
                                >
                                    <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}

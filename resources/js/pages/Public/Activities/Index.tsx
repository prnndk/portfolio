import { FadeIn } from '@/components/aceternity/text-reveal';
import { Pagination } from '@/components/pagination';
import { PageHeader } from '@/components/portfolio/page-header';
import { Seo } from '@/components/seo';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import GuestLayout from '@/layouts/guest-layout';
import { type Activity, type PaginatedData } from '@/types';
import { Link } from '@inertiajs/react';
import { Briefcase, Calendar } from 'lucide-react';

interface Props {
    activities: PaginatedData<Activity>;
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
            <Seo
                title="Activities & Experience | Arya Gading Prinandika"
                description="My journey through education, work experience, and achievements."
                url="/activities"
            />

            <div className="container mx-auto px-4 py-24">
                <PageHeader title="Activities & Experience" description="My journey through education, work experience, and achievements." />

                {activities.data.length > 0 ? (
                    <>
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent md:before:mx-auto md:before:translate-x-0 dark:before:via-slate-700">
                            {activities.data.map((activity, index) => (
                                <FadeIn key={activity.id} delay={index * 0.1}>
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse">
                                        {/* Dot */}
                                        <div className="absolute left-0 h-10 w-10 flex-shrink-0 translate-x-1/2 rounded-full border-4 border-background bg-primary md:left-1/2 md:-translate-x-1/2" />

                                        {/* Content */}
                                        <div className="ml-16 w-full md:mr-0 md:ml-0 md:w-[calc(50%-2.5rem)]">
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
                                                <h3 className="mb-1 font-heading text-xl font-bold group-hover:text-primary">{activity.title}</h3>
                                                <p className="mb-4 text-sm font-medium text-muted-foreground">{activity.organization}</p>
                                                <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{activity.description}</p>
                                            </Link>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>

                        <Pagination paginator={activities} />
                    </>
                ) : (
                    <FadeIn delay={0.2}>
                        <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Briefcase className="h-6 w-6" />
                                    </EmptyMedia>
                                    <EmptyTitle>No activities yet</EmptyTitle>
                                    <EmptyDescription>Experience and activities will be showcased here once they are added.</EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    </FadeIn>
                )}
            </div>
        </GuestLayout>
    );
}

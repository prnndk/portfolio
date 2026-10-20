import { FadeIn } from '@/components/aceternity/text-reveal';
import { Pagination } from '@/components/pagination';
import { PageHeader } from '@/components/portfolio/page-header';
import { EmptyBlock, PageContainer } from '@/components/portfolio/signal';
import { Seo } from '@/components/seo';
import GuestLayout from '@/layouts/guest-layout';
import { type Activity, type PaginatedData } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';

interface Props {
    activities: PaginatedData<Activity>;
}

const formatMonth = (date: string | null) => (date ? new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');

export default function ActivitiesIndex({ activities }: Props) {
    return (
        <GuestLayout>
            <Seo
                title="Activities & Experience | Arya Gading Prinandika"
                description="My journey through education, work experience, and achievements."
                url="/activities"
            />

            <PageContainer>
                <PageHeader title="Activities & Experience" description="My journey through education, work experience, and achievements." />

                {activities.data.length > 0 ? (
                    <>
                        <div className="border-t border-border">
                            {activities.data.map((activity, index) => (
                                <FadeIn key={activity.id} delay={index * 0.05}>
                                    <Link
                                        href={`/activities/${activity.id}`}
                                        className="group grid gap-3 border-b border-border py-8 transition-all hover:bg-card sm:grid-cols-[180px_1fr_auto] sm:gap-8 sm:hover:px-4"
                                    >
                                        <div className="flex flex-col gap-1">
                                            <span className="font-heading text-3xl font-extrabold tracking-[-0.05em] text-primary">
                                                {activity.start_date ? new Date(activity.start_date).getFullYear() : '—'}
                                            </span>
                                            {activity.start_date && (
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {formatMonth(activity.start_date)} –{' '}
                                                    {activity.end_date ? formatMonth(activity.end_date) : 'Present'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <h3 className="font-heading text-2xl font-bold tracking-[-0.03em] transition-colors group-hover:text-primary">
                                                {activity.title}
                                            </h3>
                                            {(activity.role || activity.organization) && (
                                                <p className="text-muted-foreground">
                                                    {[activity.role, activity.organization].filter(Boolean).join(' · ')}
                                                </p>
                                            )}
                                            {activity.description && (
                                                <p className="line-clamp-2 max-w-2xl text-muted-foreground">{activity.description}</p>
                                            )}
                                        </div>
                                        <ArrowUpRight className="hidden h-6 w-6 text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 sm:block" />
                                    </Link>
                                </FadeIn>
                            ))}
                        </div>

                        <Pagination paginator={activities} />
                    </>
                ) : (
                    <FadeIn delay={0.2}>
                        <EmptyBlock
                            title="No activities yet"
                            text="Experience and activities will be showcased here once they are added."
                            pose="coding"
                        />
                    </FadeIn>
                )}
            </PageContainer>
        </GuestLayout>
    );
}

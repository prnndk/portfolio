'use client';

import { FadeIn } from '@/components/aceternity/text-reveal';
import { PageHeader } from '@/components/portfolio/page-header';
import { Seo } from '@/components/seo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GuestLayout from '@/layouts/guest-layout';
import { type Activity, type Post, type Project } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Award, FileText, FolderOpen, Loader2, Search } from 'lucide-react';
import { useState, useTransition } from 'react';

interface Props {
    query: string;
    posts: Post[];
    projects: Project[];
    activities: Activity[];
    total: number;
}

export default function SearchIndex({ query, posts, projects, activities, total }: Props) {
    const [searchValue, setSearchValue] = useState(query);
    const [isPending, startTransition] = useTransition();

    const handleSearch = (value: string) => {
        setSearchValue(value);
        startTransition(() => {
            router.get(
                '/search',
                { q: value },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        });
    };

    const formatDate = (date: string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const hasResults = posts.length > 0 || projects.length > 0 || activities.length > 0;

    return (
        <GuestLayout>
            <Seo
                title={query ? `Search: "${query}" | Arya Gading Prinandika` : 'Search | Arya Gading Prinandika'}
                description="Search across blog posts, projects, and activities."
                url="/search"
            />

            <div className="container mx-auto px-4 py-24">
                <PageHeader title="Search" description="Find posts, projects, and activities across the entire site." />

                {/* Search Input */}
                <FadeIn delay={0.05}>
                    <div className="relative mb-10 max-w-2xl">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search posts, projects, activities..."
                            className="h-12 pr-10 pl-9 text-base"
                            autoFocus
                        />
                        {isPending && <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
                    </div>
                </FadeIn>

                {/* Results summary */}
                {query && (
                    <FadeIn delay={0.1}>
                        <p className="mb-8 text-sm text-muted-foreground">
                            {hasResults ? (
                                <>
                                    Found <span className="font-semibold text-foreground">{total}</span> result{total !== 1 ? 's' : ''} for{' '}
                                    <span className="font-semibold text-foreground">"{query}"</span>
                                </>
                            ) : (
                                <>
                                    No results found for <span className="font-semibold text-foreground">"{query}"</span>. Try a different keyword.
                                </>
                            )}
                        </p>
                    </FadeIn>
                )}

                {!query && (
                    <FadeIn delay={0.1}>
                        <p className="text-sm text-muted-foreground">Start typing to search across the site.</p>
                    </FadeIn>
                )}

                {hasResults && (
                    <div className="space-y-12">
                        {/* Blog Posts */}
                        {posts.length > 0 && (
                            <FadeIn delay={0.15}>
                                <section>
                                    <div className="mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <h2 className="font-heading text-xl font-bold">Blog Posts</h2>
                                        <Badge variant="secondary">{posts.length}</Badge>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {posts.map((post) => (
                                            <Link
                                                key={post.id}
                                                href={`/blog/${post.slug}`}
                                                className="group flex flex-col rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                            >
                                                <h3 className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                                                    {post.title}
                                                </h3>
                                                {post.excerpt && (
                                                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
                                                )}
                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    {post.tags &&
                                                        post.tags.length > 0 &&
                                                        post.tags.slice(0, 3).map((tag) => (
                                                            <Badge key={tag.id} variant="outline" className="px-1.5 py-0 text-xs">
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                    <span className="ml-auto text-xs text-muted-foreground">{formatDate(post.published_at)}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    {posts.length === 10 && (
                                        <div className="mt-4">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/blog?q=${encodeURIComponent(query)}`}>View all blog results →</Link>
                                            </Button>
                                        </div>
                                    )}
                                </section>
                            </FadeIn>
                        )}

                        {/* Projects */}
                        {projects.length > 0 && (
                            <FadeIn delay={0.2}>
                                <section>
                                    <div className="mb-4 flex items-center gap-2">
                                        <FolderOpen className="h-5 w-5 text-primary" />
                                        <h2 className="font-heading text-xl font-bold">Projects</h2>
                                        <Badge variant="secondary">{projects.length}</Badge>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {projects.map((project) => (
                                            <Link
                                                key={project.id}
                                                href={`/projects/${project.slug}`}
                                                className="group flex flex-col rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                            >
                                                <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-primary">
                                                    {project.title}
                                                </h3>
                                                {project.description && (
                                                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">{project.description}</p>
                                                )}
                                                {project.tech_tags && project.tech_tags.length > 0 && (
                                                    <div className="mt-3 flex flex-wrap gap-1">
                                                        {project.tech_tags.slice(0, 4).map((tag, i) => (
                                                            <Badge key={i} variant="outline" className="px-1.5 py-0 text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            </FadeIn>
                        )}

                        {/* Activities */}
                        {activities.length > 0 && (
                            <FadeIn delay={0.25}>
                                <section>
                                    <div className="mb-4 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" />
                                        <h2 className="font-heading text-xl font-bold">Activities</h2>
                                        <Badge variant="secondary">{activities.length}</Badge>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {activities.map((activity) => (
                                            <Link
                                                key={activity.id}
                                                href={`/activities/${activity.id}`}
                                                className="group flex flex-col rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                                            >
                                                <h3 className="line-clamp-1 font-semibold transition-colors group-hover:text-primary">
                                                    {activity.title}
                                                </h3>
                                                {activity.role && <p className="mt-0.5 text-xs text-primary">{activity.role}</p>}
                                                {activity.organization && <p className="text-xs text-muted-foreground">{activity.organization}</p>}
                                                {activity.description && (
                                                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">{activity.description}</p>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            </FadeIn>
                        )}
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}

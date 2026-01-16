import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Post } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from '@/components/ui/empty';
import {
    FolderKanban,
    FileText,
    Calendar,
    Star,

    Plus,
    ArrowRight,
    Eye,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Stats {
    projects: { total: number; active: number };
    posts: { total: number; active: number; published: number };
    activities: { total: number; active: number };
    favorites: { total: number; active: number };
}

interface Props {
    stats: Stats;
    recentPosts: Post[];
}

const StatCard = ({
    title,
    icon: Icon,
    total,
    active,
    href,
    color,
}: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    total: number;
    active: number;
    href: string;
    color: string;
}) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`rounded-lg p-2 ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">{total}</div>
            <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 font-medium">{active}</span> active
                </p>
                <Link
                    href={href}
                    className="text-xs text-primary hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    Manage <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </CardContent>
    </Card>
);

export default function Dashboard({ stats, recentPosts }: Props) {
    const formatDate = (date: string | null) => {
        if (!date) return 'Not published';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'archived':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="font-heading text-2xl font-bold md:text-3xl">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here's an overview of your portfolio.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Projects"
                        icon={FolderKanban}
                        total={stats.projects.total}
                        active={stats.projects.active}
                        href="/admin/projects"
                        color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    />
                    <StatCard
                        title="Blog Posts"
                        icon={FileText}
                        total={stats.posts.total}
                        active={stats.posts.published}
                        href="/admin/posts"
                        color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    />
                    <StatCard
                        title="Activities"
                        icon={Calendar}
                        total={stats.activities.total}
                        active={stats.activities.active}
                        href="/admin/activities"
                        color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    />
                    <StatCard
                        title="Favorites"
                        icon={Star}
                        total={stats.favorites.total}
                        active={stats.favorites.active}
                        href="/admin/favorites"
                        color="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
                    />
                </div>

                {/* Recent Posts Section */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Blog Posts</CardTitle>
                                <CardDescription>Your latest articles and drafts</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/posts/create">
                                    <Plus className="mr-1 h-3 w-3" />
                                    New Post
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentPosts.length === 0 ? (
                                <Empty className="border-0">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <FileText className="h-6 w-6" />
                                        </EmptyMedia>
                                        <EmptyTitle>No posts yet</EmptyTitle>
                                        <EmptyDescription>
                                            Start writing your first blog post to share your thoughts.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button size="sm" asChild>
                                            <Link href="/admin/posts/create">
                                                <Plus className="mr-1 h-3 w-3" />
                                                Write Your First Post
                                            </Link>
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            ) : (
                                <div className="space-y-4">
                                    {recentPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium truncate">{post.title}</h4>
                                                    <Badge className={`shrink-0 ${getStatusColor(post.status)}`}>
                                                        {post.status}
                                                    </Badge>
                                                    {!post.is_active && (
                                                        <Badge variant="outline" className="shrink-0 text-muted-foreground">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {post.published_at
                                                        ? `Published ${formatDate(post.published_at)}`
                                                        : `Created ${formatDate(post.created_at)}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 ml-3">
                                                {post.status === 'published' && post.is_active && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {recentPosts.length > 0 && (
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href="/admin/posts">
                                                View All Posts
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks and shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Button variant="outline" className="justify-start h-auto py-4" asChild>
                                    <Link href="/admin/projects/create">
                                        <FolderKanban className="mr-3 h-5 w-5 text-blue-500" />
                                        <div className="text-left">
                                            <div className="font-medium">New Project</div>
                                            <div className="text-xs text-muted-foreground">Add a portfolio project</div>
                                        </div>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="justify-start h-auto py-4" asChild>
                                    <Link href="/admin/posts/create">
                                        <FileText className="mr-3 h-5 w-5 text-purple-500" />
                                        <div className="text-left">
                                            <div className="font-medium">New Blog Post</div>
                                            <div className="text-xs text-muted-foreground">Write an article</div>
                                        </div>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="justify-start h-auto py-4" asChild>
                                    <Link href="/admin/activities/create">
                                        <Calendar className="mr-3 h-5 w-5 text-orange-500" />
                                        <div className="text-left">
                                            <div className="font-medium">New Activity</div>
                                            <div className="text-xs text-muted-foreground">Add experience</div>
                                        </div>
                                    </Link>
                                </Button>
                                <Button variant="outline" className="justify-start h-auto py-4" asChild>
                                    <Link href="/admin/favorites/create">
                                        <Star className="mr-3 h-5 w-5 text-pink-500" />
                                        <div className="text-left">
                                            <div className="font-medium">New Favorite</div>
                                            <div className="text-xs text-muted-foreground">Add movie, music or book</div>
                                        </div>
                                    </Link>
                                </Button>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                                <Button variant="ghost" className="w-full" asChild>
                                    <a href="/" target="_blank" rel="noopener noreferrer">
                                        View Live Site
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Post } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BarChart2, Calendar, Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Posts', href: '/admin/posts' },
];

interface Props {
    posts: Post[];
}

export default function PostsIndex({ posts }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(`/admin/posts/${id}`);
        }
    };

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
            <Head title="Blog Posts" />
            <div className="p-4 md:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">Blog Posts</h1>
                        <p className="text-muted-foreground">Manage your blog articles</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/posts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Post
                        </Link>
                    </Button>
                </div>

                {posts.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="mb-4 text-muted-foreground">No posts yet. Write your first article!</p>
                            <Button asChild>
                                <Link href="/admin/posts/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Post
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Card key={post.id}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold">{post.title}</h3>
                                            <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                                            {!post.is_active && (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(post.published_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BarChart2 className="h-3 w-3" />
                                                {post.view_count ?? 0} views
                                            </span>
                                            <span className="text-xs">/blog/{post.slug}</span>
                                        </div>
                                        {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
                                    </div>
                                    <div className="ml-4 flex items-center gap-2">
                                        {post.status === 'published' && (
                                            <Button variant="ghost" size="sm" asChild>
                                                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/admin/posts/${post.id}/edit`}>
                                                <Pencil className="mr-1 h-3 w-3" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(post.id)}
                                        >
                                            <Trash2 className="mr-1 h-3 w-3" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

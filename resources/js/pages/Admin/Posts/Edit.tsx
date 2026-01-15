import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem, type Post } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Eye, FileText, Settings, ExternalLink } from 'lucide-react';
import { type FormEvent } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import MDEditor from '@uiw/react-md-editor';
import { useAppearance } from '@/hooks/use-appearance';
import { InputField, TextareaField, SelectField, SwitchField } from '@/components/ui/form-components';

interface Props {
    post: Post;
}

const statusOptions = [
    { value: 'draft', label: '📝 Draft' },
    { value: 'published', label: '🌐 Published' },
    { value: 'archived', label: '📦 Archived' },
];

export default function PostsEdit({ post }: Props) {
    const { appearance } = useAppearance();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Posts', href: '/admin/posts' },
        { title: 'Edit', href: `/admin/posts/${post.id}/edit` },
    ];

    const { data, setData, post: submitPost, processing, errors } = useForm({
        _method: 'PUT',
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || '',
        featured_image: null as File | null,
        status: post.status,
        published_at: post.published_at ? post.published_at.slice(0, 16) : '',
        is_active: post.is_active,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        submitPost(`/admin/posts/${post.id}`);
    };

    // Word count for content
    const wordCount = data.content.trim() ? data.content.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${post.title}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6" data-color-mode={appearance}>
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/posts">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Post</h1>
                            <p className="text-sm text-muted-foreground line-clamp-1">{post.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {post.status === 'published' && (
                            <Button variant="outline" asChild>
                                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Post
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/admin/posts">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Update Post'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Title & Content Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <CardTitle>Content</CardTitle>
                                    </div>
                                    <CardDescription>Edit your blog post content</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputField
                                        id="title"
                                        label="Post Title"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter an engaging title..."
                                        className="text-lg font-medium"
                                        error={errors.title}
                                    />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium">
                                                Content <span className="text-destructive">*</span>
                                            </label>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>{wordCount} words</span>
                                                <span>~{readingTime} min read</span>
                                            </div>
                                        </div>
                                        <div className="min-h-[500px] overflow-hidden rounded-lg border border-input">
                                            <MDEditor
                                                value={data.content}
                                                onChange={(val) => setData('content', val || '')}
                                                height={500}
                                                preview="edit"
                                            />
                                        </div>
                                        {errors.content && (
                                            <p className="text-sm text-destructive">{errors.content}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SEO Card */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-5 w-5 text-primary" />
                                        <CardTitle>SEO & Preview</CardTitle>
                                    </div>
                                    <CardDescription>Optimize how your post appears in search results</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <TextareaField
                                        id="excerpt"
                                        label="Excerpt / Meta Description"
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        placeholder="Write a compelling summary for search engines and social media..."
                                        rows={3}
                                        description="Recommended: 150-160 characters for optimal SEO"
                                    />

                                    {/* Preview Card */}
                                    <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">Search Preview</p>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-semibold text-primary line-clamp-1">
                                                {data.title || 'Post Title'}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {data.excerpt || 'Your post excerpt will appear here...'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Current Featured Image */}
                            {post.featured_image && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Current Image</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-hidden rounded-lg border border-border">
                                            <img
                                                src={`/storage/${post.featured_image}`}
                                                alt={post.title}
                                                className="w-full object-cover"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Publish Settings */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Publish Settings</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <SelectField
                                        id="status"
                                        label="Status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as 'draft' | 'published' | 'archived')}
                                        options={statusOptions}
                                    />

                                    <InputField
                                        id="published_at"
                                        label="Publish Date"
                                        type="datetime-local"
                                        value={data.published_at}
                                        onChange={(e) => setData('published_at', e.target.value)}
                                    />

                                    <SwitchField
                                        id="is_active"
                                        label="Active"
                                        description="Make this post visible on your site"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </CardContent>
                            </Card>

                            {/* Replace Featured Image */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Replace Image</CardTitle>
                                    <CardDescription>Upload a new featured image</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FileUploader
                                        value={data.featured_image ? [data.featured_image] : []}
                                        onValueChange={(files) => setData('featured_image', files[0] || null)}
                                        maxFiles={1}
                                        description="Drag & drop or click to upload"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

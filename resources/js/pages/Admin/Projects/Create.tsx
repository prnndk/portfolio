import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Folder, Link as LinkIcon, Image, Settings } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { InputField, TextareaField, SwitchField, TagInput } from '@/components/ui/form-components';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Projects', href: '/admin/projects' },
    { title: 'Create', href: '/admin/projects/create' },
];

export default function ProjectsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        image: null as File | null,
        gallery: [] as File[],
        tech_tags: [] as string[],
        url: '',
        github_url: '',
        featured: false as boolean,
        is_active: true as boolean,
        sort_order: 0,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/projects');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Project" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/projects">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Create New Project</h1>
                            <p className="text-sm text-muted-foreground">Showcase your work with a detailed project page</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/projects">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Project'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Project Details */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Folder className="h-5 w-5 text-primary" />
                                        <CardTitle>Project Details</CardTitle>
                                    </div>
                                    <CardDescription>Basic information about your project</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputField
                                        id="title"
                                        label="Project Title"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="My Awesome Project"
                                        className="text-lg font-medium"
                                        error={errors.title}
                                    />

                                    <TextareaField
                                        id="description"
                                        label="Description"
                                        required
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe what this project does, the problems it solves, and any notable features..."
                                        rows={5}
                                        error={errors.description}
                                    />

                                    <TagInput
                                        label="Tech Stack"
                                        tags={data.tech_tags}
                                        onTagsChange={(tags) => setData('tech_tags', tags)}
                                        placeholder="e.g., React, TypeScript, Node.js..."
                                        description="Press Enter or click Add to add a tag"
                                    />
                                </CardContent>
                            </Card>

                            {/* Links */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-primary" />
                                        <CardTitle>Project Links</CardTitle>
                                    </div>
                                    <CardDescription>Where can people view or access this project?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InputField
                                            id="url"
                                            label="Live Demo URL"
                                            type="url"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            placeholder="https://myproject.com"
                                            error={errors.url}
                                        />

                                        <InputField
                                            id="github_url"
                                            label="GitHub Repository"
                                            type="url"
                                            value={data.github_url}
                                            onChange={(e) => setData('github_url', e.target.value)}
                                            placeholder="https://github.com/username/repo"
                                            error={errors.github_url}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Media */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Image className="h-5 w-5 text-primary" />
                                        <CardTitle>Media</CardTitle>
                                    </div>
                                    <CardDescription>Add images to showcase your project</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Featured Image</label>
                                        <FileUploader
                                            value={data.image ? [data.image] : []}
                                            onValueChange={(files) => setData('image', files[0] || null)}
                                            maxFiles={1}
                                            description="Main image displayed in project cards (recommended: 1200x630px)"
                                        />
                                        {errors.image && (
                                            <p className="text-sm text-destructive">{errors.image}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Project Gallery</label>
                                        <FileUploader
                                            value={data.gallery}
                                            onValueChange={(files) => setData('gallery', files)}
                                            multiple
                                            description="Additional screenshots and images (up to 10)"
                                        />
                                        {errors.gallery && (
                                            <p className="text-sm text-destructive">{errors.gallery}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Settings */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">Settings</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <InputField
                                        id="sort_order"
                                        label="Sort Order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        description="Lower numbers appear first"
                                    />

                                    <SwitchField
                                        id="featured"
                                        label="Featured Project"
                                        description="Highlight this on your homepage"
                                        checked={data.featured}
                                        onCheckedChange={(checked) => setData('featured', checked)}
                                    />

                                    <SwitchField
                                        id="is_active"
                                        label="Active"
                                        description="Make this project visible on your site"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </CardContent>
                            </Card>

                            {/* Preview Card */}
                            <Card className="border-dashed">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-hidden rounded-lg border border-border bg-background">
                                        <div className="aspect-video bg-muted flex items-center justify-center">
                                            {data.image ? (
                                                <img
                                                    src={URL.createObjectURL(data.image)}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Image className="h-8 w-8 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-semibold line-clamp-1">
                                                {data.title || 'Project Title'}
                                            </h4>
                                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                {data.description || 'Your project description...'}
                                            </p>
                                            {data.tech_tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {data.tech_tags.slice(0, 3).map((tag) => (
                                                        <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {data.tech_tags.length > 3 && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            +{data.tech_tags.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

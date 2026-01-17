import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Briefcase, Calendar, Image, Settings, Plus, X, Link as LinkIcon, Upload } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { InputField, TextareaField, SwitchField, FormRow } from '@/components/ui/form-components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activities', href: '/admin/activities' },
    { title: 'Create', href: '/admin/activities/create' },
];

export default function ActivitiesCreate() {
    const [galleryTab, setGalleryTab] = useState<'upload' | 'url'>('upload');
    const [newGalleryUrl, setNewGalleryUrl] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        role: '',
        organization: '',
        description: '',
        start_date: '',
        end_date: '',
        gallery: [] as File[],
        gallery_urls: [] as string[],
        sort_order: 0,
        is_active: true as boolean,
    });

    const isValidUrl = (string: string) => {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const addGalleryUrl = () => {
        if (!newGalleryUrl) {
            toast.error('Please enter a URL');
            return;
        }
        if (!isValidUrl(newGalleryUrl)) {
            toast.error('Please enter a valid URL (must start with http:// or https://)');
            return;
        }
        if (data.gallery_urls.includes(newGalleryUrl)) {
            toast.error('This URL is already in the gallery');
            return;
        }
        setData('gallery_urls', [...data.gallery_urls, newGalleryUrl]);
        setNewGalleryUrl('');
    };

    const removeGalleryUrl = (url: string) => {
        setData('gallery_urls', data.gallery_urls.filter((u) => u !== url));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/activities');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Activity" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/activities">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Create New Activity</h1>
                            <p className="text-sm text-muted-foreground">Add a new experience or activity to your timeline</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/activities">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Activity'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Activity Details */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                        <CardTitle>Activity Details</CardTitle>
                                    </div>
                                    <CardDescription>Information about your role or experience</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputField
                                        id="title"
                                        label="Title"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g., Software Engineer, Project Lead"
                                        className="text-lg font-medium"
                                        error={errors.title}
                                    />

                                    <FormRow>
                                        <InputField
                                            id="role"
                                            label="Role"
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            placeholder="e.g., Team Lead, Developer"
                                        />

                                        <InputField
                                            id="organization"
                                            label="Organization"
                                            value={data.organization}
                                            onChange={(e) => setData('organization', e.target.value)}
                                            placeholder="e.g., Google, MIT"
                                        />
                                    </FormRow>

                                    <TextareaField
                                        id="description"
                                        label="Description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Describe your responsibilities, achievements, and impact..."
                                        rows={5}
                                    />
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <CardTitle>Timeline</CardTitle>
                                    </div>
                                    <CardDescription>When did this activity take place?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormRow>
                                        <InputField
                                            id="start_date"
                                            label="Start Date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            error={errors.start_date}
                                        />

                                        <InputField
                                            id="end_date"
                                            label="End Date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            description="Leave empty if ongoing"
                                            error={errors.end_date}
                                        />
                                    </FormRow>

                                    {/* Duration Preview */}
                                    {data.start_date && (
                                        <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
                                            <p className="text-sm font-medium">
                                                Duration:{' '}
                                                <span className="text-primary">
                                                    {data.end_date
                                                        ? `${new Date(data.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(data.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                                                        : `${new Date(data.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - Present`
                                                    }
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Gallery */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Image className="h-5 w-5 text-primary" />
                                        <CardTitle>Gallery</CardTitle>
                                    </div>
                                    <CardDescription>Add photos from this activity or experience</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Tabs value={galleryTab} onValueChange={(v) => setGalleryTab(v as 'upload' | 'url')}>
                                        <TabsList className="mb-2">
                                            <TabsTrigger value="upload" className="flex items-center gap-2">
                                                <Upload className="h-4 w-4" />
                                                Upload Files
                                            </TabsTrigger>
                                            <TabsTrigger value="url" className="flex items-center gap-2">
                                                <LinkIcon className="h-4 w-4" />
                                                Use URLs
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="upload">
                                            <FileUploader
                                                value={data.gallery}
                                                onValueChange={(files) => setData('gallery', files)}
                                                multiple
                                                description="Drag & drop images or click to upload (max 2MB each)"
                                            />
                                        </TabsContent>
                                        <TabsContent value="url">
                                            <div className="space-y-3">
                                                <div className="flex gap-2">
                                                    <InputField
                                                        id="new_gallery_url"
                                                        label=""
                                                        type="url"
                                                        value={newGalleryUrl}
                                                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                                                        placeholder="https://example.com/image.jpg"
                                                        className="flex-1"
                                                    />
                                                    <Button type="button" onClick={addGalleryUrl} variant="outline" className="mt-auto">
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {data.gallery_urls.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                                        {data.gallery_urls.map((url, i) => (
                                                            <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                                                                <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                                                    onClick={() => removeGalleryUrl(url)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                    {errors.gallery && (
                                        <p className="text-sm text-destructive">{errors.gallery}</p>
                                    )}
                                    {/* Display gallery URL errors */}
                                    {Object.keys(errors).filter(k => k.startsWith('gallery_urls')).map((key) => (
                                        <p key={key} className="text-sm text-destructive">{(errors as Record<string, string>)[key]}</p>
                                    ))}
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
                                        id="is_active"
                                        label="Active"
                                        description="Make this activity visible on your site"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </CardContent>
                            </Card>

                            {/* Preview Card */}
                            <Card className="border-dashed">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Timeline Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative border-l-2 border-primary/20 pl-4">
                                        <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
                                        <div className="space-y-1">
                                            <h4 className="font-semibold line-clamp-1">
                                                {data.title || 'Activity Title'}
                                            </h4>
                                            {(data.role || data.organization) && (
                                                <p className="text-sm text-muted-foreground">
                                                    {data.role}{data.role && data.organization && ' at '}{data.organization}
                                                </p>
                                            )}
                                            {data.start_date && (
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(data.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                    {' - '}
                                                    {data.end_date
                                                        ? new Date(data.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                                        : 'Present'
                                                    }
                                                </p>
                                            )}
                                            {data.description && (
                                                <p className="mt-2 text-xs text-muted-foreground line-clamp-3">
                                                    {data.description}
                                                </p>
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

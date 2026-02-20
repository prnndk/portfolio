import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Briefcase, Calendar, Image, Settings, Plus, X, Link as LinkIcon, Upload, Building2, GraduationCap, Award, Map, Tag, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { InputField, TextareaField, SwitchField, FormRow, SelectField } from '@/components/ui/form-components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Journeys', href: '/admin/journeys' },
    { title: 'Edit', href: '#' },
];

const typeOptions = [
    { value: 'work', label: 'Work Experience', icon: Building2 },
    { value: 'education', label: 'Education', icon: GraduationCap },
    { value: 'achievement', label: 'Achievement', icon: Award },
    { value: 'other', label: 'Other', icon: Map },
];

interface Journey {
    id: number;
    title: string;
    subtitle: string | null;
    organization: string | null;
    type: 'work' | 'education' | 'achievement' | 'other';
    description: string | null;
    skills: string[] | null;
    logo: string | null;
    logo_url: string | null;
    logo_display_url: string | null;
    gallery: string[] | null;
    gallery_urls: string[] | null;
    all_gallery_images: { url: string; type: 'uploaded' | 'url'; path: string | null }[];
    start_date: string | null;
    end_date: string | null;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    journey: Journey;
}

export default function JourneysEdit({ journey }: Props) {
    const [galleryTab, setGalleryTab] = useState<'upload' | 'url'>('upload');
    const [logoTab, setLogoTab] = useState<'upload' | 'url'>(journey.logo ? 'upload' : 'url');
    const [newGalleryUrl, setNewGalleryUrl] = useState('');
    const [newSkill, setNewSkill] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: journey.title,
        subtitle: journey.subtitle || '',
        organization: journey.organization || '',
        type: journey.type,
        description: journey.description || '',
        skills: journey.skills || [] as string[],
        logo: null as File | null,
        logo_url: journey.logo_url || '',
        remove_logo: false as boolean,
        gallery: [] as File[],
        gallery_urls: [] as string[],
        remove_gallery: [] as string[],
        remove_gallery_urls: [] as string[],
        start_date: journey.start_date ? new Date(journey.start_date).toISOString().split('T')[0] : '',
        end_date: journey.end_date ? new Date(journey.end_date).toISOString().split('T')[0] : '',
        sort_order: journey.sort_order,
        is_active: journey.is_active,
    });

    // Track existing gallery images (uploaded)
    const [existingGallery, setExistingGallery] = useState(
        (journey.gallery || []).map(path => ({
            path,
            url: journey.all_gallery_images.find(img => img.path === path)?.url || '',
        }))
    );

    // Track existing gallery URLs
    const [existingGalleryUrls, setExistingGalleryUrls] = useState(journey.gallery_urls || []);

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
        if (existingGalleryUrls.includes(newGalleryUrl) || data.gallery_urls.includes(newGalleryUrl)) {
            toast.error('This URL is already in the gallery');
            return;
        }
        setData('gallery_urls', [...data.gallery_urls, newGalleryUrl]);
        setNewGalleryUrl('');
    };

    const removeNewGalleryUrl = (url: string) => {
        setData('gallery_urls', data.gallery_urls.filter((u) => u !== url));
    };

    const removeExistingGalleryUrl = (url: string) => {
        setExistingGalleryUrls(existingGalleryUrls.filter((u) => u !== url));
        setData('remove_gallery_urls', [...data.remove_gallery_urls, url]);
    };

    const removeExistingGallery = (path: string) => {
        setExistingGallery(existingGallery.filter((g) => g.path !== path));
        setData('remove_gallery', [...data.remove_gallery, path]);
    };

    const addSkill = () => {
        const skill = newSkill.trim();
        if (!skill) {
            toast.error('Please enter a skill');
            return;
        }
        if (data.skills.includes(skill)) {
            toast.error('This skill is already added');
            return;
        }
        setData('skills', [...data.skills, skill]);
        setNewSkill('');
    };

    const removeSkill = (skill: string) => {
        setData('skills', data.skills.filter((s) => s !== skill));
    };

    const handleRemoveLogo = () => {
        setData(prevData => ({
            ...prevData,
            remove_logo: true,
            logo: null,
            logo_url: '',
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/journeys/${journey.id}`);
    };

    const TypeIcon = typeOptions.find(t => t.value === data.type)?.icon || Map;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${journey.title}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/journeys">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Journey</h1>
                            <p className="text-sm text-muted-foreground">{journey.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/journeys">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Basic Details */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                        <CardTitle>Basic Details</CardTitle>
                                    </div>
                                    <CardDescription>Information about this journey milestone</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputField
                                        id="title"
                                        label="Title"
                                        required
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g., Software Engineer, Bachelor's Degree"
                                        className="text-lg font-medium"
                                        error={errors.title}
                                    />

                                    <FormRow>
                                        <InputField
                                            id="subtitle"
                                            label="Subtitle / Role"
                                            value={data.subtitle}
                                            onChange={(e) => setData('subtitle', e.target.value)}
                                            placeholder="e.g., Full-Stack Developer, Computer Science"
                                        />

                                        <InputField
                                            id="organization"
                                            label="Organization"
                                            value={data.organization}
                                            onChange={(e) => setData('organization', e.target.value)}
                                            placeholder="e.g., Google, MIT, SMAN 1"
                                        />
                                    </FormRow>

                                    <SelectField
                                        id="type"
                                        label="Type"
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value as typeof data.type)}
                                        options={typeOptions.map(t => ({ value: t.value, label: t.label }))}
                                    />

                                    <div className="space-y-2">
                                        <TextareaField
                                            id="description"
                                            label="Description"
                                            value={data.description}
                                            onChange={(e) => {
                                                if (e.target.value.length <= 150) {
                                                    setData('description', e.target.value);
                                                }
                                            }}
                                            placeholder="Describe this experience, responsibilities, achievements..."
                                            rows={3}
                                            error={errors.description}
                                        />
                                        <div className="flex justify-end">
                                            <span className={`text-xs ${data.description.length >= 140 ? (data.description.length >= 150 ? 'text-destructive' : 'text-amber-500') : 'text-muted-foreground'}`}>
                                                {data.description.length}/150
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Skills / Tags */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-primary" />
                                        <CardTitle>Skills & Tags</CardTitle>
                                    </div>
                                    <CardDescription>Add relevant skills or tags for this experience</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <InputField
                                            id="new_skill"
                                            label=""
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="e.g., React, Laravel, Python"
                                            className="flex-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addSkill();
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={addSkill} variant="outline" className="mt-auto">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {data.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {data.skills.map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="gap-1 px-3 py-1">
                                                    {skill}
                                                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Timeline */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <CardTitle>Timeline</CardTitle>
                                    </div>
                                    <CardDescription>When did this take place?</CardDescription>
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

                            {/* Logo */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-primary" />
                                            <CardTitle>Logo</CardTitle>
                                        </div>
                                        {(journey.logo_display_url || data.logo || data.logo_url) && !data.remove_logo && (
                                            <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo} className="text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Remove Logo
                                            </Button>
                                        )}
                                    </div>
                                    <CardDescription>Logo for the organization (company, school, etc.)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Show current logo if exists and not marked for removal */}
                                    {journey.logo_display_url && !data.remove_logo && !data.logo && !data.logo_url && (
                                        <div className="mb-4 flex justify-center">
                                            <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border bg-muted overflow-hidden">
                                                <img src={journey.logo_display_url} alt="Current logo" className="h-full w-full object-contain p-2" />
                                            </div>
                                        </div>
                                    )}

                                    {(data.remove_logo || !journey.logo_display_url) && (
                                        <Tabs value={logoTab} onValueChange={(v) => setLogoTab(v as 'upload' | 'url')}>
                                            <TabsList className="mb-2">
                                                <TabsTrigger value="upload" className="flex items-center gap-2">
                                                    <Upload className="h-4 w-4" />
                                                    Upload File
                                                </TabsTrigger>
                                                <TabsTrigger value="url" className="flex items-center gap-2">
                                                    <LinkIcon className="h-4 w-4" />
                                                    Use URL
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="upload">
                                                <FileUploader
                                                    value={data.logo ? [data.logo] : []}
                                                    onValueChange={(files) => setData('logo', files[0] || null)}
                                                    description="Upload a logo image (max 2MB)"
                                                />
                                            </TabsContent>
                                            <TabsContent value="url">
                                                <InputField
                                                    id="logo_url"
                                                    label=""
                                                    type="url"
                                                    value={data.logo_url}
                                                    onChange={(e) => setData('logo_url', e.target.value)}
                                                    placeholder="https://example.com/logo.png"
                                                />
                                                {data.logo_url && isValidUrl(data.logo_url) && (
                                                    <div className="mt-4 flex justify-center">
                                                        <div className="h-20 w-20 rounded-lg border border-border bg-muted overflow-hidden">
                                                            <img src={data.logo_url} alt="Logo preview" className="h-full w-full object-contain p-1" />
                                                        </div>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    )}
                                    {errors.logo && <p className="text-sm text-destructive mt-2">{errors.logo}</p>}
                                    {errors.logo_url && <p className="text-sm text-destructive mt-2">{errors.logo_url}</p>}
                                </CardContent>
                            </Card>

                            {/* Gallery */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Image className="h-5 w-5 text-primary" />
                                        <CardTitle>Photo Gallery</CardTitle>
                                    </div>
                                    <CardDescription>Photos from this experience (click to view fullscreen on public page)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Existing Gallery Images (Uploaded) */}
                                    {existingGallery.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Existing Photos</p>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                                {existingGallery.map((img, i) => (
                                                    <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                                                        <img src={img.url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                                            onClick={() => removeExistingGallery(img.path)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Existing Gallery URLs */}
                                    {existingGalleryUrls.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Existing URL Photos</p>
                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                                {existingGalleryUrls.map((url, i) => (
                                                    <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                                                        <img src={url} alt={`Gallery URL ${i + 1}`} className="h-full w-full object-cover" />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                                            onClick={() => removeExistingGalleryUrl(url)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Add New Gallery */}
                                    <Tabs value={galleryTab} onValueChange={(v) => setGalleryTab(v as 'upload' | 'url')}>
                                        <TabsList className="mb-2">
                                            <TabsTrigger value="upload" className="flex items-center gap-2">
                                                <Upload className="h-4 w-4" />
                                                Upload New Files
                                            </TabsTrigger>
                                            <TabsTrigger value="url" className="flex items-center gap-2">
                                                <LinkIcon className="h-4 w-4" />
                                                Add URLs
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
                                                                <img src={url} alt={`New Gallery ${i + 1}`} className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                                <Button
                                                                    type="button"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                                                    onClick={() => removeNewGalleryUrl(url)}
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
                                        description="Make this visible on your site"
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
                                        <div className="absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary">
                                            <TypeIcon className="h-2.5 w-2.5 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-semibold line-clamp-1">
                                                {data.title || 'Journey Title'}
                                            </h4>
                                            {(data.subtitle || data.organization) && (
                                                <p className="text-sm text-muted-foreground">
                                                    {data.subtitle}{data.subtitle && data.organization && ' at '}{data.organization}
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
                                            {data.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {data.skills.slice(0, 3).map((skill, i) => (
                                                        <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                                                            {skill}
                                                        </span>
                                                    ))}
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

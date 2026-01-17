import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Cpu, Palette, Settings, ExternalLink } from 'lucide-react';
import { type FormEvent } from 'react';
import { FileUploader } from '@/components/ui/file-uploader';
import { InputField, SelectField, SwitchField, ColorInput, FormRow } from '@/components/ui/form-components';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tech Stacks', href: '/admin/tech-stacks' },
    { title: 'Create', href: '/admin/tech-stacks/create' },
];

const categoryOptions = [
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Database', label: 'Database' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'Tools', label: 'Tools' },
    { value: 'Cloud', label: 'Cloud' },
    { value: 'Other', label: 'Other' },
];

const proficiencyOptions = [
    { value: 'Expert', label: 'Expert' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Beginner', label: 'Beginner' },
];

export default function TechStacksCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        icon: null as File | null,
        icon_url: '',
        color: '#3B82F6',
        category: '',
        proficiency: '',
        sort_order: 0,
        is_active: true as boolean,
        show_in_orbit: true as boolean,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/tech-stacks');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Tech Stack" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin/tech-stacks">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Add Tech Stack</h1>
                            <p className="text-sm text-muted-foreground">Add a new technology to showcase your skills</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/tech-stacks">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Tech Stack'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="h-5 w-5 text-primary" />
                                        <CardTitle>Technology Details</CardTitle>
                                    </div>
                                    <CardDescription>Basic information about this technology</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <InputField
                                        id="name"
                                        label="Technology Name"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., React, Laravel, PostgreSQL"
                                        className="text-lg font-medium"
                                        error={errors.name}
                                    />

                                    <FormRow>
                                        <SelectField
                                            id="category"
                                            label="Category"
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            options={categoryOptions}
                                            placeholder="Select category"
                                        />

                                        <SelectField
                                            id="proficiency"
                                            label="Proficiency Level"
                                            value={data.proficiency}
                                            onChange={(e) => setData('proficiency', e.target.value)}
                                            options={proficiencyOptions}
                                            placeholder="Select level"
                                        />
                                    </FormRow>
                                </CardContent>
                            </Card>

                            {/* Icon */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-primary" />
                                        <CardTitle>Icon & Appearance</CardTitle>
                                    </div>
                                    <CardDescription>Customize how this technology appears</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Upload Icon</label>
                                        <FileUploader
                                            value={data.icon ? [data.icon] : []}
                                            onValueChange={(files) => setData('icon', files[0] || null)}
                                            maxFiles={1}
                                            description="Drag & drop icon (recommended: 64x64 PNG or SVG)"
                                            accept={{ 'image/*': [], '.svg': [] }}
                                        />
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                                        </div>
                                    </div>

                                    <InputField
                                        id="icon_url"
                                        label="Icon URL (Simple Icons CDN)"
                                        type="url"
                                        value={data.icon_url}
                                        onChange={(e) => setData('icon_url', e.target.value)}
                                        placeholder="https://cdn.simpleicons.org/react"
                                        description={
                                            <span className="flex items-center gap-1">
                                                Get icons from{' '}
                                                <a
                                                    href="https://simpleicons.org"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    simpleicons.org
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </span>
                                        }
                                    />

                                    <ColorInput
                                        id="color"
                                        label="Brand Color"
                                        value={data.color}
                                        onChange={(value) => setData('color', value)}
                                        description="Used for accents and hover effects"
                                    />
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
                                        description="Display this on your site"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />

                                    <SwitchField
                                        id="show_in_orbit"
                                        label="Show in Orbit"
                                        description="Include in the animated orbit display"
                                        checked={data.show_in_orbit}
                                        onCheckedChange={(checked) => setData('show_in_orbit', checked)}
                                    />
                                </CardContent>
                            </Card>

                            {/* Preview Card */}
                            <Card className="border-dashed">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Preview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 rounded-lg border border-border bg-background p-4">
                                        <div
                                            className="flex h-14 w-14 items-center justify-center rounded-xl"
                                            style={{ backgroundColor: `${data.color}15` }}
                                        >
                                            {data.icon ? (
                                                <img
                                                    src={URL.createObjectURL(data.icon)}
                                                    alt="Icon preview"
                                                    className="h-8 w-8 object-contain"
                                                />
                                            ) : data.icon_url ? (
                                                <img
                                                    src={data.icon_url}
                                                    alt="Icon preview"
                                                    className="h-8 w-8 object-contain"
                                                />
                                            ) : (
                                                <Cpu
                                                    className="h-8 w-8"
                                                    style={{ color: data.color }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold">
                                                {data.name || 'Technology Name'}
                                            </h4>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                {data.category && (
                                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                                                        {data.category}
                                                    </span>
                                                )}
                                                {data.proficiency && (
                                                    <span
                                                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs text-white"
                                                        style={{ backgroundColor: data.color }}
                                                    >
                                                        {data.proficiency}
                                                    </span>
                                                )}
                                            </div>
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

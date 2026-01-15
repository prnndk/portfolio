import { type Project } from '@/types';

/**
 * Get the display image URL for a project.
 * Prioritizes uploaded file over external URL.
 */
export function getProjectImage(project: Project): string | undefined {
    if (project.image) {
        return `/storage/${project.image}`;
    }
    if (project.image_url) {
        return project.image_url;
    }
    return undefined;
}

/**
 * Get all gallery images for a project.
 * Combines uploaded files and external URLs.
 */
export function getProjectGallery(project: Project): string[] {
    const gallery: string[] = [];

    if (project.gallery) {
        project.gallery.forEach((img) => {
            gallery.push(`/storage/${img}`);
        });
    }

    if (project.gallery_urls) {
        gallery.push(...project.gallery_urls);
    }

    return gallery;
}

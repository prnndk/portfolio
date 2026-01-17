import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash: {
        success: string | null;
        error: string | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Project {
    id: number;
    title: string;
    slug: string;
    description: string;
    image: string | null;
    image_url: string | null;
    gallery?: string[];
    gallery_urls?: string[];
    tech_tags: string[] | null;
    url: string | null;
    github_url: string | null;
    featured: boolean;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Computed attributes from backend
    display_image?: string | null;
    all_gallery?: string[];
}

export interface Activity {
    id: number;
    title: string;
    role: string | null;
    organization: string | null;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
    gallery: string[] | null;
    gallery_urls: string[] | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featured_image: string | null;
    featured_image_url: string | null;
    published_at: string | null;
    status: 'draft' | 'published' | 'archived';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TechStack {
    id: number;
    name: string;
    icon: string | null;
    icon_url: string | null;
    color: string | null;
    category: string | null;
    proficiency: string | null;
    sort_order: number;
    is_active: boolean;
    show_in_orbit: boolean;
    created_at: string;
    updated_at: string;
}

export interface Favorite {
    id: number;
    title: string;
    slug: string;
    type: 'movie' | 'music' | 'book';
    description: string | null;
    image: string | null;
    creator: string | null;
    year: string | null;
    genre: string | null;
    content: string | null;
    external_url: string | null;
    rating: number | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ShortLink {
    id: number;
    code: string;
    original_url: string;
    title: string | null;
    clicks: number;
    is_active: boolean;
    short_url?: string;
    created_at: string;
    updated_at: string;
}

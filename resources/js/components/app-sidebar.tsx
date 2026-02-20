import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Cpu, FolderKanban, Mail, LayoutGrid, Calendar, FileText, Folder, Star, Link2, Map } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Projects',
        href: '/admin/projects',
        icon: FolderKanban,
    },
    {
        title: 'Activities',
        href: '/admin/activities',
        icon: Calendar,
    },
    {
        title: 'My Journey',
        href: '/admin/journeys',
        icon: Map,
    },
    {
        title: 'Blog Posts',
        href: '/admin/posts',
        icon: FileText,
    },
    {
        title: 'Tech Stacks',
        href: '/admin/tech-stacks',
        icon: Cpu,
    },
    {
        title: 'Favorites',
        href: '/admin/favorites',
        icon: Star,
    },
    {
        title: 'Short Links',
        href: '/admin/short-links',
        icon: Link2,
    },
    {
        title: 'Contacts',
        href: '/admin/contacts',
        icon: Mail,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

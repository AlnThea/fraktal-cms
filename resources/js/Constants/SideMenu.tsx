// SideMenu.ts
import {
    IconLayoutDashboard,
    IconUserCircle,
    IconArticle,
    IconSettings,
    IconTags, IconLogout
} from '@tabler/icons-react';
import React from 'react';

export interface MenuItem {

    label: string;
    route?: string;
    icon?: () => React.ReactNode;
    children?: MenuItem[];
    position?: 'top' | 'bottom';
    isLogout?: boolean;
}

export interface MenuGroup {
    group: string;
    position: string;
    items: MenuItem[];
}

export const SideMenu: MenuGroup[] = [
    {
        position: 'top',
        group: 'Main',
        items: [
            {
                label: 'Dashboard',
                route: 'dashboard',
                icon: () => <IconLayoutDashboard size={20}/>,
                position: 'top',
            },
        ]
    },
    {
        position: 'top',
        group: 'Content',
        items: [
            {
                label: 'Posts',
                icon: () => <IconArticle size={20}/>,
                children: [
                    { label: 'All Posts', route: 'homepage' },
                    { label: 'Add Post', route: 'homepage' },
                    { label: 'Categories', route: 'homepage' },
                    { label: 'Tags', route: 'homepage' },
                ],
                position: 'top',
            },
            {
                label: 'Pages',
                icon: () => <IconArticle size={20}/>,
                children: [
                    { label: 'All Pages', route: 'pages.index' },
                    { label: 'New Pages', route: 'pages.create' },
                ],
                position: 'top',
            },
        ]
    },
    {
        position: 'top',
        group: 'Page',
        items: [
            {
                label: 'Users',
                route: 'homepage',
                icon: () => <IconUserCircle size={20}/>,
                position: 'top',
            },
            {
                label: 'Settings',
                route: 'homepage',
                icon: () => <IconSettings size={20}/>,
                position: 'top',
                children: [
                    { label: 'All Posts', route: 'homepage' },
                    { label: 'Add Post', route: 'homepage' },
                    { label: 'Categories', route: 'homepage' },
                    { label: 'Tags', route: 'homepage' },
                ],
            },
            {
                label: 'Tags',
                route: 'homepage',
                icon: () => <IconTags size={20}/>,
                position: 'top',
            },
        ]
    },
    {
        position: 'bottom',
        group: 'Account',
        items: [
            {
                label: 'Pofile',
                icon: () => <IconUserCircle size={20} />,
                route: 'profile.show', // kita bisa gunakan sebagai identifikasi, tapi nanti render-nya custom
                position: 'bottom',
                isLogout: false,
            },
            {
                label: 'Logout',
                icon: () => <IconLogout size={20} />,
                route: 'logout', // kita bisa gunakan sebagai identifikasi, tapi nanti render-nya custom
                position: 'bottom',
                isLogout: true,
            },
        ]
    }
];

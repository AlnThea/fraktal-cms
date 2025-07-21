// SideMenu.ts
import {
    IconLayoutDashboard,
    IconUserCircle,
    IconArticle,
    IconSettings,
    IconTags
} from '@tabler/icons-react';
import React from 'react';

export interface MenuItem {
    label: string;
    route?: string;
    icon?: () => React.ReactNode;
    children?: MenuItem[];
}

export interface MenuGroup {
    group: string;
    items: MenuItem[];
}

export const SideMenu: MenuGroup[] = [
    {
        group: 'Main',
        items: [
            {
                label: 'Dashboard',
                route: 'dashboard',
                icon: () => <IconLayoutDashboard size={20}/>
            },
        ]
    },
    {
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
            },
        ]
    },
    {
        group: 'Page',
        items: [
            {
                label: 'Users',
                route: 'homepage',
                icon: () => <IconUserCircle size={20}/>,
            },
            {
                label: 'Settings',
                route: 'homepage',
                icon: () => <IconSettings size={20}/>,
            },
            {
                label: 'Tags',
                route: 'homepage',
                icon: () => <IconTags size={20}/>,
            },
        ]
    }
];

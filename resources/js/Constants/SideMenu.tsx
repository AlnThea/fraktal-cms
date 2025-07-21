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

export const SideMenu: MenuItem[] = [
    {
        label: 'Dashboard',
        route: 'dashboard',
        icon: () => <IconLayoutDashboard />
    },
    {
        label: 'Posts',
        icon: () => <IconArticle />,
        children: [
            { label: 'All Posts', route: 'homepage' },
            { label: 'Add Post', route: 'homepage' },
            { label: 'Categories', route: 'homepage' },
            { label: 'Tags', route: 'homepage' },
        ],
    },
    {
        label: 'Users',
        route: 'users.index',
        icon: () => <IconUserCircle />,
    },
    {
        label: 'Settings',
        route: 'settings',
        icon: () => <IconSettings />,
    },
    {
        label: 'Tags',
        route: 'tags.index',
        icon: () => <IconTags />,
    },
];

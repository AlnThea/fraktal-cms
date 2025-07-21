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
        icon: () => <IconLayoutDashboard size={20}/>
    },
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
    {
        label: 'Users',
        route: 'users.index',
        icon: () => <IconUserCircle size={20}/>,
    },
    {
        label: 'Settings',
        route: 'settings',
        icon: () => <IconSettings size={20}/>,
    },
    {
        label: 'Tags',
        route: 'tags.index',
        icon: () => <IconTags size={20}/>,
    },
];

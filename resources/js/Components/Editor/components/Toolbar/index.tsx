import React from 'react';
import TopToolbar from './TopToolbar';
import { ToolbarProps } from '@/Types/editor';

const Toolbar: React.FC<ToolbarProps> = ({ onCommand }) => {
    return <TopToolbar onCommand={onCommand} />;
};

export default Toolbar;

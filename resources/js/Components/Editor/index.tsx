import React from 'react';
import EditorCore from './EditorCore';
import { EditorProps } from '@/Types/editor';

const Editor: React.FC<EditorProps> = (props) => {
    return <EditorCore {...props} />;
};

export default Editor;

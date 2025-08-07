import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

// Plugin dasar
import gjsBlockBasic from 'grapesjs-blocks-basic';
import gjsNavbar from 'grapesjs-navbar';
import gjsPluginForms from 'grapesjs-plugin-forms';
import gjsExport from 'grapesjs-plugin-export';

// Plugin tambahan
import gjsTuiImageEditor from 'grapesjs-tui-image-editor';
import gjsCountdown from 'grapesjs-component-countdown';
import gjsStyleGradient from 'grapesjs-style-gradient';
import gjsStyleFilter from 'grapesjs-style-filter';
import gjsStyleBg from 'grapesjs-style-bg';
import gjsFlexbox from 'grapesjs-blocks-flexbox';
import gjsSlider from 'grapesjs-lory-slider';
import gjsTyped from 'grapesjs-typed';
import gjsCustomCode from 'grapesjs-custom-code';
import gjsTooltip from 'grapesjs-tooltip';

interface EditorProps {
    onSave?: (data: string) => void;
    initialData?: any; // Ubah tipe data menjadi 'any'
    editorRef?: React.MutableRefObject<any>;
}

const Editor: React.FC<EditorProps> = ({ onSave, initialData, editorRef }) => {
    const editorInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!editorInstanceRef.current) return;

        const editor = grapesjs.init({
            container: editorInstanceRef.current,
            height: '100vh',
            width: 'auto',
            storageManager: { type: 'none' },
            plugins: [
                gjsBlockBasic,
                gjsNavbar,
                gjsPluginForms,
                gjsExport,
                gjsTuiImageEditor,
                gjsCountdown,
                gjsStyleGradient,
                gjsStyleFilter,
                gjsStyleBg,
                gjsFlexbox,
                gjsSlider,
                gjsTyped,
                gjsCustomCode,
                gjsTooltip,
            ],
            pluginsOpts: {
                [gjsTuiImageEditor]: {
                    script: [
                        'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/3.6.3/fabric.min.js',
                        'https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.min.js',
                    ],
                    style: [
                        'https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.min.css',
                    ],
                },
            },
        });

        if (editorRef) {
            editorRef.current = editor;
        }

        if (initialData) {
            // Memuat data awal langsung, tanpa JSON.parse
            editor.loadProjectData(initialData);
        }

        return () => {
            editor.destroy();
        };
    }, [editorRef, initialData]);

    return (
        <div className="h-full w-full flex flex-col">
            <div ref={editorInstanceRef} className="w-full flex-grow" />
        </div>
    );
};

export default Editor;

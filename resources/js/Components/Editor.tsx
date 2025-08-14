import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import customAppCss from '../../css/app.css?raw';

import gjspresetWebpage from 'grapesjs-preset-webpage';
import gjsNewsletter from 'grapesjs-preset-newsletter';

// Plugin dasar
import gjsBlockBasic from 'grapesjs-blocks-basic';
import gjsNavbar from 'grapesjs-navbar';
import gjsPluginForms from 'grapesjs-plugin-forms';

// Plugin tambahan
import gjsTuiImageEditor from 'grapesjs-tui-image-editor';
import gjsCountdown from 'grapesjs-component-countdown';
import gjsStyleGradient from 'grapesjs-style-gradient';
import gjsStyleFilter from 'grapesjs-style-filter';
import gjsFlexbox from 'grapesjs-blocks-flexbox';
import gjsSlider from 'grapesjs-lory-slider';
import gjsTyped from 'grapesjs-typed';
import gjsCustomCode from 'grapesjs-custom-code';
import gjsTooltip from 'grapesjs-tooltip';
import gjsTabs from 'grapesjs-tabs';
import gjsPostCSS from 'grapesjs-parser-postcss';
import codeEditor from 'grapesjs-component-code-editor';
import gjsRuler from 'grapesjs-rulers';
import gjsTailwindCSS from "grapesjs-tailwindcss-plugin";

import 'grapesjs/dist/css/grapes.min.css';
import 'grapesjs-component-code-editor/dist/grapesjs-component-code-editor.min.css';
import 'grapesjs-rulers/dist/grapesjs-rulers.min.css'

interface EditorProps {
    onSave?: (data: string) => void;
    initialData?: any;
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
            fromElement: false,
            storageManager: { type: 'none' },

            plugins: [
                gjsBlockBasic,
                gjsNavbar,
                gjsPluginForms,
                gjsCountdown,
                gjsStyleGradient,
                gjsStyleFilter,
                gjsFlexbox,
                gjsSlider,
                gjsTabs,
                gjsTyped,
                gjsCustomCode,
                gjsTooltip,
                codeEditor,
                gjsRuler,
                gjsPostCSS,
                gjspresetWebpage,
                gjsNewsletter,
                gjsTailwindCSS,
            ],
            pluginsOpts: {
                'grapesjs-tailwindcss-plugin': {
                    autocomplete: false,
                    autobuild: true,
                    toolbarPanel: true,
                    buildButton: true,
                    notificationCallback: (msg: string) => console.log('Tailwind: ', msg),
                    customCss: customAppCss,
                },
            },
        });

        const pn = editor.Panels;
        // Tambah panel 'views'
        (pn.addPanel({ id: 'views' }).get('buttons') as any).add([{
            attributes: { title: 'Open Code' },
            className: 'fa fa-file-code-o',
            command: 'open-code',
            togglable: false,
            id: 'open-code'
        }]);
        // Tambah panel 'options'
        (pn.addPanel({ id: 'options' }).get('buttons') as any).add([{
            attributes: { title: 'Toggle Rulers' },
            context: 'toggle-rulers',
            label: `<svg width="20" viewBox="0 0 16 16"><path d="M0 8a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5A.5.5 0 0 1 0 8z"/><path d="M4 3h8a1 1 0 0 1 1 1v2.5h1V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2.5h1V4a1 1 0 0 1 1-1zM3 9.5H2V12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9.5h-1V12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/></svg>`,
            command: 'ruler-visibility',
            id: 'ruler-visibility'
        }]);

        if (editorRef) {
            editorRef.current = editor;
        }

        if (initialData) {
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

// resources/js/Components/Editor/Hooks/useEditorConfig.tsx
import { usePlugin } from 'grapesjs';
import gjsTailwindCSS from 'grapesjs-tailwindcss-plugin';
import gjsClick from 'grapesjs-click';
import codeEditorPlugin from 'grapesjs-component-code-editor';
import RulersPlugin from 'grapesjs-rulers';
import 'grapesjs-rulers/dist/grapesjs-rulers.min.css';
import 'grapesjs-plugin-toolbox/dist/grapesjs-plugin-toolbox.min.css';
import '../../../../css/app.css?raw';

export const useEditorConfig = () => {
    const getEditorConfig = (plugins: any[] = []) => {
        return {
            container: '#grapesjs-editor',
            height: '88vh',
            width: '100%',
            storageManager: { type: 'none' },
            layerManager: { appendTo: '.layers-container' },
            selectorManager: { appendTo: '.styles-container' },
            styleManager: { appendTo: '.styles-container' },
            traitManager: { appendTo: '.traits-container' },
            blockManager: { appendTo: '.blocks-container' },
            deviceManager: {
                devices: [
                    { name: 'Desktop', width: '' },
                    { name: 'Mobile', width: '320px', widthMedia: '480px' },
                ],
            },
            panels: {
                defaults: [
                    {
                        id: 'options',
                        buttons: [],
                    },
                    {
                        id: 'basic-actions',
                        el: '.view-plugin-panels',
                        buttons: [
                            {
                                id: 'visibility',
                                active: true,
                                className: 'btn-toggle-borders',
                                label: '<u>B</u>',
                                command: 'sw-visibility',
                            },
                            {
                                attributes: { title: 'Open Code' },
                                className: 'fa fa-code',
                                command: 'open-code',
                                id: 'open-code'
                            },
                            {
                                attributes: { title: 'Toggle Rulers' },
                                context: 'toggle-rulers',
                                label: `<svg width="18" viewBox="0 0 16 16"><path d="M0 8a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5A.5.5 0 0 1 0 8z"/><path d="M4 3h8a1 1 0 0 1 1 1v2.5h1V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2.5h1V4a1 1 0 0 1 1-1zM3 9.5H2V12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9.5h-1V12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/></svg>`,
                                command: 'ruler-visibility',
                                id: 'ruler-visibility'
                            }
                        ],
                    }
                ],
            },
            plugins: [
                usePlugin(gjsTailwindCSS),
                usePlugin(gjsClick),
                usePlugin(codeEditorPlugin, {
                    panelId: 'code-editor-panel',
                    appendTo: '.panel__right',
                    openState: { pn: '35%', cv: '65%' },
                    closedState: { pn: '15%', cv: '85%' },
                    codeViewOptions: {},
                    preserveWidth: true,
                    clearData: false,
                    cleanCssBtn: true,
                    htmlBtnText: 'Apply',
                    cssBtnText: 'Apply',
                    cleanCssBtnText: 'Delete'
                }),
                usePlugin(RulersPlugin),
                ...plugins,
                usePlugin(async (editor: any) => {
                    try {
                        const ToolboxPlugin = (await import('grapesjs-plugin-toolbox')).default;
                        return ToolboxPlugin(editor, {});
                    } catch (error) {
                        console.error('Failed to load ToolboxPlugin:', error);
                        return null;
                    }
                }),
            ],
            pluginsOpts: {},
        };
    };

    return { getEditorConfig };
};

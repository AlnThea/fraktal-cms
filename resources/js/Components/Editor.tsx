import React, { useEffect, useRef, useState } from 'react';
import grapesjs, { usePlugin, Block, Component, Editor as GjsEditor } from 'grapesjs';
import gjsBlockBasic from 'grapesjs-blocks-basic';
import gjsTailwindCSS from 'grapesjs-tailwindcss-plugin';
import gjsClick, { getMouseListener, showGrabbedInfo, hideGrabbedInfo, MouseListener } from 'grapesjs-click';
import customAppCss from '../../css/app.css?raw';
import axios from 'axios';

interface Plugin {
    id: number;
    name: string;
    slug: string;
    version: string;
    status: string;
    assets: {
        js: string[];
    };
    main_file: string;
}

interface EditorProps {
    onSave?: (data: string) => void;
    initialData?: any;
    editorRef?: React.MutableRefObject<any>;
}

const grabIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="currentColor" d="M188 76a31.85 31.85 0 0 0-11.21 2A32 32 0 0 0 128 67a32 32 0 0 0-52 25v16h-8a32 32 0 0 0-32 32v12a92 92 0 0 0 184 0v-44a32 32 0 0 0-32-32m8 76a68 68 0 0 1-136 0v-12a8 8 0 0 1 8-8h8v20a12 12 0 0 0 24 0V92a8 8 0 0 1 16 0v28a12 12 0 0 0 24 0V92a8 8 0 0 1 16 0v28a12 12 0 0 0 24 0v-12a8 8 0 0 1 16 0Z"/></svg>';

const capitalizeValue = (value?: string) => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.charAt(0).toUpperCase() + value.replace(/[_-]+/, ' ').slice(1);
};

const Editor: React.FC<EditorProps> = ({ onSave, initialData, editorRef }) => {
    const editorInstanceRef = useRef<any>(null);
    const editorRefInternal = useRef<any>(null);
    const [isSidebarLeftOpen, setIsSidebarLeftOpen] = useState(false);
    const [isSidebarRightOpen, setIsSidebarRightOpen] = useState(false);
    const [activeBlocksPanel, setActiveBlocksPanel] = useState('basic');

    const fetchActivePlugins = async (): Promise<Plugin[]> => {
        try {
            const response = await axios.get('/api/active-plugins'); // Endpoint untuk get plugins aktif
            return response.data;
        } catch (error) {
            console.error('Failed to fetch plugins:', error);
            return [];
        }
    };

    const loadPlugin = (plugin: Plugin): Promise<any> => {
        return new Promise((resolve, reject) => {
            // Untuk UMD build, kita harus load sebagai script, bukan ES6 module
            const script = document.createElement('script');
            script.src = plugin.main_file;

            script.onload = () => {
                console.log('✅ UMD Script loaded, checking global exports...');

                // Cek berbagai possible global names dari UMD build
                const possibleGlobals = [
                    'TCoreBlocks',      // Dari name: 'TCoreBlocks' di vite config
                    'tCoreBlocks',
                    't_core_blocks'
                ];

                let pluginModule = null;
                for (const globalName of possibleGlobals) {
                    if (window[globalName as any]) {
                        pluginModule = window[globalName as any];
                        console.log(`🎯 Found plugin at window.${globalName}`);
                        break;
                    }
                }

                if (pluginModule) {
                    resolve(pluginModule);
                } else {
                    console.error('❌ No global export found. Available globals:', Object.keys(window).filter(k => k.includes('Core') || k.includes('Block')));
                    reject(new Error(`Plugin ${plugin.name} loaded but no global export found`));
                }
            };

            script.onerror = () => {
                console.error(`❌ Failed to load script: ${plugin.main_file}`);
                reject(new Error(`Failed to load plugin: ${plugin.name}`));
            };

            document.head.appendChild(script);
        });
    };

    useEffect(() => {
        if (window.innerWidth >= 1024) {
            setIsSidebarLeftOpen(true);
            setIsSidebarRightOpen(true);
        }
    }, []);

    useEffect(() => {
        if (!editorInstanceRef.current) return;

        const initializeEditor = async () => {
            // Fetch active plugins dari CMS
            const activePlugins = await fetchActivePlugins();

            const editor = grapesjs.init({
                container: editorInstanceRef.current,
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
                    defaults: [],
                },
                plugins: [
                    usePlugin(gjsTailwindCSS),
                    usePlugin(gjsBlockBasic),
                    usePlugin(gjsClick),
                    // Load plugins dari CMS secara dinamis
                    ...activePlugins.map(plugin =>
                        usePlugin(async (editor: any, options: any) => {
                            try {
                                console.log(`🔄 Loading plugin: ${plugin.name}...`);
                                const pluginModule = await loadPlugin(plugin);
                                console.log(`✅ Plugin ${plugin.name} loaded:`, pluginModule);

                                // Handle berbagai format export
                                if (typeof pluginModule === 'function') {
                                    // Langsung function
                                    console.log(`🚀 Initializing plugin ${plugin.name} as function...`);
                                    return pluginModule(editor, options);
                                }
                                else if (pluginModule && typeof pluginModule.TCoreBlocks === 'function') {
                                    // Export sebagai TCoreBlocks property
                                    console.log(`🚀 Initializing plugin ${plugin.name} via TCoreBlocks property...`);
                                    return pluginModule.TCoreBlocks(editor, options);
                                }
                                else if (pluginModule && typeof pluginModule.default === 'function') {
                                    // Export sebagai default property
                                    console.log(`🚀 Initializing plugin ${plugin.name} via default export...`);
                                    return pluginModule.default(editor, options);
                                }
                                else {
                                    console.warn(`❌ Plugin ${plugin.name} has no initialize function:`, pluginModule);
                                    return null;
                                }
                            } catch (error) {
                                console.error(`💥 Failed to initialize plugin ${plugin.name}:`, error);
                            }
                        })
                    ),
                ],
                pluginsOpts: {},
            });

            editorRefInternal.current = editor;
            if (editorRef) editorRef.current = editor;

            // --- GRAPESJS-CLICK LOGIC ---
            const grabbedInfoEl = document.getElementById('grabbed-info');
            if (grabbedInfoEl) {
                const mouseListener = getMouseListener(editor, grabbedInfoEl);

                const resetGrabbedInfo = (element: HTMLElement) => {
                    element.textContent = '';
                    element.style.top = '0';
                    element.style.left = '0';
                };

                editor.on('click:grab-block', (block: Block) => {
                    const label = block.getLabel();
                    const category = block.getCategoryLabel();
                    grabbedInfoEl.textContent = `${label} (${category})`;
                    showGrabbedInfo(grabbedInfoEl, mouseListener);
                });

                editor.on('click:drop-block', () => {
                    resetGrabbedInfo(grabbedInfoEl);
                    hideGrabbedInfo(grabbedInfoEl, mouseListener);
                });

                editor.on('click:grab-component', (component: Component) => {
                    const { name, type } = component.props();
                    const label = name || capitalizeValue(type);
                    grabbedInfoEl.textContent = label;
                    showGrabbedInfo(grabbedInfoEl, mouseListener);
                });

                editor.on('click:drop-component', () => {
                    resetGrabbedInfo(grabbedInfoEl);
                    hideGrabbedInfo(grabbedInfoEl, mouseListener);
                });
            }

            editor.on('component:selected', (selectedComponent: Component) => {
                const { type: componentType } = selectedComponent.props();
                const toolbar = selectedComponent.get('toolbar') || [];
                const isWrapperComponent = componentType === 'wrapper';
                const hasGrabbedAction = toolbar.some(({ command }) => command === 'click:grab-component');

                if (isWrapperComponent || hasGrabbedAction) {
                    return;
                }

                toolbar.unshift({
                    label: grabIcon,
                    command: 'click:grab-component',
                    attributes: { title: 'Grab this component' },
                });

                selectedComponent.set('toolbar', toolbar);
            });

            // --- COMMANDS ---
            editor.Commands.add('export-template', {
                run(editor) {
                    const html = editor.getHtml();
                    const css = editor.getCss();
                    const code = `<div>${html}</div><style>${css}</style>`;
                    const modalContent = `
                  <textarea readonly style="width:100%; height: 250px; background-color: #1e1e1e; color: #d4d4d4; border: none; border-radius: 5px;">${code}</textarea>
                  <button id="copy-to-clipboard-btn" class="gjs-btn-prim" style="display: block; margin: 10px auto 0;">Copy</button>
                `;
                    editor.Modal.setTitle('Export Template').setContent(modalContent).open();
                    const modalContentEl = editor.Modal.getContentEl();
                    if (modalContentEl) {
                        const copyBtn = modalContentEl.querySelector<HTMLButtonElement>('#copy-to-clipboard-btn');
                        if (copyBtn) {
                            copyBtn.addEventListener('click', () => {
                                navigator.clipboard.writeText(code).then(() => {
                                    copyBtn.innerText = 'Copied!';
                                    setTimeout(() => (copyBtn.innerText = 'Copy'), 2000);
                                });
                            });
                        }
                    }
                },
            });

            editor.Commands.add('show-json', {
                run(editor) {
                    editor.Modal.setTitle('Components JSON')
                        .setContent(`<textarea style="width:100%; height:250px;">${JSON.stringify(editor.getComponents(), null, 2)}</textarea>`)
                        .open();
                },
            });

            const showOnly = (activePanel: 'layers' | 'styles' | 'traits') => {
                const panels = {
                    layers: document.querySelector('.layers-container'),
                    styles: document.querySelector('.styles-container'),
                    traits: document.querySelector('.traits-container'),
                };

                Object.keys(panels).forEach(key => {
                    const el = panels[key as keyof typeof panels];
                    if (el instanceof HTMLElement) {
                        el.style.display = key === activePanel ? '' : 'none';
                    }
                });
            };

            editor.Commands.add('show-blocks', {
                run() {
                    const blocksPanel = document.querySelector<HTMLElement>('.blocks-container');
                    if (blocksPanel) {
                        blocksPanel.style.display = blocksPanel.style.display === 'none' ? '' : 'none';
                    }
                },
            });

            editor.Commands.add('show-layers', { run: () => showOnly('layers') });
            editor.Commands.add('show-styles', { run: () => showOnly('styles') });
            editor.Commands.add('show-traits', { run: () => showOnly('traits') });
            editor.Commands.add('set-device-desktop', { run: (editor) => editor.setDevice('Desktop') });
            editor.Commands.add('set-device-mobile', { run: (editor) => editor.setDevice('Mobile') });

            editor.on('device:change', () => {
                const device = editor.getDevice();
                if (device === 'Mobile') {
                    setIsSidebarLeftOpen(false);
                    setIsSidebarRightOpen(false);
                } else if (device === 'Desktop') {
                    setIsSidebarLeftOpen(true);
                    setIsSidebarRightOpen(true);
                }
            });

            editor.on('load', () => {
                showOnly('styles');

                // Add onClick to all blocks to enable grab functionality
                const blockManager = editor.BlockManager;
                blockManager.getAll().forEach((block: Block) => {
                    block.set('onClick', () => {
                        editor.runCommand('click:grab-block', { id: block.getId() });
                    });
                });
            });

            if (initialData) {
                editor.loadProjectData(initialData);
            }

            return () => {
                editor.destroy();
            };
        };

        // Panggil fungsi async
        initializeEditor();
    }, [editorRef]);

    const handleCommand = (command: string) => {
        if (editorRefInternal.current) {
            editorRefInternal.current.Commands.run(command);
        }
    };

    return (
        <div className="flex bg-slate-300 w-full relative h-screen overflow-hidden">
            <div
                id="grabbed-info"
                style={{ position: 'absolute', display: 'none', padding: '5px 10px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '5px', zIndex: 10000, pointerEvents: 'none' }}
            ></div>

            {/* Tombol Toggle Sidebar Kiri */}
            <div
                className={`absolute top-20 z-40 transition-all duration-300 ease-in-out ${
                    isSidebarLeftOpen ? 'left-[17.9rem]' : 'left-0'
                }`}
            >
                <div className="flex items-center w-10 text-teal-400 bg-white border-t-2 border-r-2 border-b-2 rounded-tr-xl rounded-br-xl border-teal-300">
                    <button
                        title="Block Manager"
                        className="p-1"
                        onClick={() => setIsSidebarLeftOpen(!isSidebarLeftOpen)}
                        dangerouslySetInnerHTML={{
                            __html: isSidebarLeftOpen
                                ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>'
                                : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-blocks"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 4a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z" /><path d="M3 14h12a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h3a2 2 0 0 1 2 2v12" /></svg>',
                        }}
                    />
                </div>
            </div>

            {/* Panel Kiri (Sidebar) */}
            <aside
                className={`absolute left-0 bg-white w-72 z-40 flex-shrink-0 transition-transform duration-300 ease-in-out h-full ${
                    isSidebarLeftOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-4 flex flex-col space-y-4 h-full border-r-2 border-teal-300">
                    <div className="flex gap-2 mb-2">
                        <button
                            className={`p-2 rounded flex-1 text-sm ${activeBlocksPanel === 'basic' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setActiveBlocksPanel('basic')}
                        >

                        </button>
                        <button
                            className={`p-2 rounded flex-1 text-sm ${activeBlocksPanel === 'tailwind' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setActiveBlocksPanel('tailwind')}
                        >
                            Tailwind Blocks
                        </button>
                    </div>
                    <div className="blocks-container flex-grow overflow-y-auto"></div>
                </div>
            </aside>

            {/* Area Editor Utama */}
            <main className="flex flex-col flex-grow relative bg-slate-300">
                <div className="panel__top h-12 w-full flex justify-between items-center px-4 bg-slate-700 text-white z-10">
                    <div className="flex items-center space-x-2">
                        {[
                            { id: 'core:preview', label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>', title: 'Preview' },
                            { id: 'export-template', label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>', title: 'Export Code' },
                            { id: 'show-json', label: '{...}', title: 'View JSON' },
                        ].map((btn) => (
                            <button key={btn.id} title={btn.title} className="p-2 hover:bg-slate-600 rounded" onClick={() => handleCommand(btn.id)} dangerouslySetInnerHTML={{ __html: btn.label }} />
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        {[
                            { id: 'set-device-desktop', label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z" /><path d="M7 20h10" /><path d="M9 16v4" /><path d="M15 16v4" /></svg>', title: 'Desktop View' },
                            { id: 'set-device-mobile', label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z" /><path d="M11 4h2" /><path d="M12 17v.01" /></svg>', title: 'Mobile View' },
                        ].map((btn) => (
                            <button key={btn.id} title={btn.title} className="p-2 hover:bg-slate-600 rounded" onClick={() => handleCommand(btn.id)} dangerouslySetInnerHTML={{ __html: btn.label }} />
                        ))}
                    </div>

                    <div className="flex items-center space-x-2">
                        {[
                            { id: 'show-layers', label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" /><path d="M16 16v2a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h2" /></svg>', title: 'Layers' },
                            { id: 'show-styles', label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M17 17a2 2 0 0 1 -2 -2v-8h-5a2 2 0 0 0 -2 2" /><path d="M7 17a2.775 2.775 0 0 0 2.632 -1.897l.368 -1.103a13.4 13.4 0 0 1 3.236 -5.236l1.764 -1.764" /><path d="M10 14h5" /></svg>', title: 'Styles' },
                            { id: 'show-traits', label: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>', title: 'Traits' },
                        ].map((btn) => (
                            <button key={btn.id} title={btn.title} className="p-2 hover:bg-slate-600 rounded" onClick={() => handleCommand(btn.id)} dangerouslySetInnerHTML={{ __html: btn.label }} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-grow w-full">
                    {/* Canvas Utama */}
                    <div className="flex-grow editor-canvas">
                        <div ref={editorInstanceRef}></div>
                    </div>

                    {/* Tombol Toggle Sidebar Kanan (Hanya Muncul di Mobile) */}
                    <div className={`absolute top-20 z-40 transition-all duration-300 ease-in-out lg:hidden ${ isSidebarRightOpen ? 'right-[17.9rem]' : 'right-0' }`}>
                        <div className="flex items-center w-10 text-teal-400 bg-white border-t-2 border-l-2 border-b-2 rounded-tl-xl rounded-bl-xl border-teal-300">
                            <button title="Style Manager" className="p-1" onClick={() => setIsSidebarRightOpen(!isSidebarRightOpen)}
                                    dangerouslySetInnerHTML={{
                                        __html: isSidebarRightOpen
                                            ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>'
                                            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M17 17a2 2 0 0 1 -2 -2v-8h-5a2 2 0 0 0 -2 2" /><path d="M7 17a2.775 2.775 0 0 0 2.632 -1.897l.368 -1.103a13.4 13.4 0 0 1 3.236 -5.236l1.764 -1.764" /><path d="M10 14h5" /></svg>',
                                    }}
                            />
                        </div>
                    </div>

                    {/* Panel Kanan (Digabung untuk Mobile & Desktop) */}
                    <aside
                        className={`bg-white text-xs transition-transform duration-300 ease-in-out z-40
                                   flex-shrink-0
                                   lg:relative lg:w-72 lg:translate-x-0 lg:border-l-2 lg:border-teal-300
                                   absolute top-0 right-0 h-full w-72
                                   ${isSidebarRightOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    >
                        <div className="panel__right h-full p-4 flex flex-col space-y-2 overflow-y-auto">
                            <div className="layers-container" style={{ display: 'none' }}></div>
                            <div className="styles-container" style={{ display: 'none' }}></div>
                            <div className="traits-container" style={{ display: 'none' }}></div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};
export default Editor;

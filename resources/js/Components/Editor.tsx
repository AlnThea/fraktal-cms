import React, {useEffect, useRef, useState} from 'react';
import Modal from '@alnthea/react-tailwind-modal';
import grapesjs from 'grapesjs';

import gjsBlockBasic from 'grapesjs-blocks-basic';


interface EditorProps {
    onSave?: (data: string) => void;
    initialData?: any;
    editorRef?: React.MutableRefObject<any>;
}

const Editor: React.FC<EditorProps> = ({onSave, initialData, editorRef}) => {
    const editorInstanceRef = useRef<any>(null);
    const editorRefInternal = useRef<any>(null); // Simpan editor di sini
    const statusRef = useRef<{ [key: string]: boolean }>({});
    const [isSidebarLeftOpen, setIsSidebarLeftOpen] = useState(false);

    const closeModal = () => {
        setIsSidebarLeftOpen(false);
    };

    useEffect(() => {
        if (!editorInstanceRef.current) return;

        const editor = grapesjs.init({
            container: editorInstanceRef.current,
            height: '89vh',
            width: 'auto',
            storageManager: {type: 'none'},
            layerManager: {appendTo: '.layers-container'},
            deviceManager: {
                devices: [
                    {name: 'Desktop', width: ''},
                    {name: 'Mobile', width: '320px', widthMedia: '480px'},
                ],
            },
            panels: {
                defaults: [
                    {
                        id: 'layers',
                        el: '.panel__right',
                        resizable: {
                            maxDim: 350,
                            minDim: 200,
                            cl: true,
                            tc: false,
                            cr: false,
                            bc: false,
                            keyWidth: 'flex-basis',
                        },
                    },
                    {
                        id: 'panel-switcher',
                        el: '.panel__switcher',
                        buttons: [
                            {
                                id: 'show-layers',
                                active: true,
                                label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" /><path d="M16 16v2a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h2" /></svg>',
                                command: 'show-layers',
                                togglable: false,
                            },
                            {
                                id: 'show-styles',
                                active: true,
                                label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M17 17a2 2 0 0 1 -2 -2v-8h-5a2 2 0 0 0 -2 2" /><path d="M7 17a2.775 2.775 0 0 0 2.632 -1.897l.368 -1.103a13.4 13.4 0 0 1 3.236 -5.236l1.764 -1.764" /><path d="M10 14h5" /></svg>',
                                command: 'show-styles',
                                togglable: false,
                            },
                            {
                                id: 'show-traits',
                                active: true,
                                label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" /></svg>',
                                command: 'show-traits',
                                togglable: false,
                            },
                        ],
                    },
                    {
                        id: 'panel-devices',
                        el: '.panel__devices',
                        buttons: [
                            {
                                id: 'device-desktop',
                                label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z" /><path d="M7 20h10" /><path d="M9 16v4" /><path d="M15 16v4" /></svg>',
                                command: 'set-device-desktop',
                                active: true,
                                togglable: false,
                            },
                            {
                                id: 'device-mobile',
                                label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z" /><path d="M11 4h2" /><path d="M12 17v.01" /></svg>',
                                command: 'set-device-mobile',
                                togglable: false,
                            },
                        ],
                    },
                ],
            },
            blockManager: {
                appendTo: '#blocks',
                blocks: [
                    {
                        id: 'section',
                        label: '<b>Section</b>',
                        attributes: {class: 'gjs-block-section'},
                        content: `<section><h1>This is a simple title</h1><div>This is just a Lorem text</div></section>`,
                    },
                    {
                        id: 'text',
                        label: 'Text',
                        content: '<div data-gjs-type="text">Insert your text here</div>',
                    },
                    {
                        id: 'image',
                        label: 'Image',
                        select: true,
                        content: {type: 'image'},
                        activate: true,
                    },
                ],
            },
            selectorManager: {appendTo: '.styles-container'},
            styleManager: {
                appendTo: '.styles-container',
                sectors: [
                    {
                        name: 'Dimension',
                        open: false,
                        buildProps: ['width', 'min-height', 'padding'],
                    },
                    {
                        name: 'Extra',
                        open: false,
                        buildProps: ['background-color', 'box-shadow'],
                    },
                ],
            },
            traitManager: {appendTo: '.traits-container'},
            plugins: [
                // gjsTailwindCSS,
                gjsBlockBasic,
                // gjsNavbar,
                // gjsPluginForms,
                // gjsCountdown,
                // gjsStyleGradient,
                // gjsStyleFilter,
                // gjsFlexbox,
                // gjsTabs,
                // gjsTyped,
                // gjsCustomCode,
                // gjsTooltip,
                // codeEditor,
                // gjsRuler,
                // gjsPostCSS,
                // gjspresetWebpage,
                // gjsNewsletter,
            ],
        });

        // Simpan editor ke ref agar bisa diakses di JSX
        editorRefInternal.current = editor;
        if (editorRef) editorRef.current = editor;

        // Tambahkan panel top
        editor.Panels.addPanel({
            id: 'panel-top',
            el: '.panel__top',
        });

        // 1. Toggle visibility (border pada komponen)

        // 2. Export template (bawaan GrapeJS, pastikan aktif)
        editor.Commands.add('export-template', {
            run(editor) {
                const html = editor.getHtml();
                const css = editor.getCss();
                const code = `<div>${html}</div><style>${css}</style>`;

                const modalContent = `
                  <pre class="gjs-field-pre" style="width:100%; height: 250px; overflow-y: auto; font-family: monospace; padding: 10px; background-color: #1e1e1e; color: #d4d4d4; border-radius: 3px; margin-bottom: 10px; white-space: pre-wrap; word-break: break-all;">
                    ${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                  </pre>
                  <button id="copy-to-clipboard-btn" class="gjs-btn-prim" style="display: block; margin: 10px auto 0; width: fit-content;">
                    Copy to Clipboard
                  </button>
                `;

                editor.Modal
                    .setTitle('Export Template')
                    .setContent(modalContent)
                    .open();

                const modalContentEl = editor.Modal.getContentEl();

                if (modalContentEl) {
                    // Menggunakan Type Assertion untuk memberi tahu TypeScript bahwa ini adalah HTMLButtonElement
                    const copyBtn = modalContentEl.querySelector<HTMLButtonElement>('#copy-to-clipboard-btn');

                    if (copyBtn) {
                        copyBtn.addEventListener('click', () => {
                            navigator.clipboard.writeText(code)
                                .then(() => {
                                    console.log('Code copied to clipboard!');
                                    copyBtn.innerText = 'Copied!';
                                    setTimeout(() => copyBtn.innerText = 'Copy to Clipboard', 2000);
                                })
                                .catch(err => {
                                    console.error('Failed to copy text: ', err);
                                });
                        });
                    }
                }
            },
        });
        // 3. Show JSON (kamu sudah punya, tapi pastikan command-nya benar)
        editor.Commands.add('show-json', {
            run(editor) {
                editor.Modal.setTitle('Components JSON')
                    .setContent(`
                        <textarea style="width:100%; height:250px; font-size:12px;">
                          ${JSON.stringify(editor.getComponents(), null, 2)}
                        </textarea>
                      `)
                    .open();
            }
        });

        // Register commands
        const showOnly = (activePanel:  'layers' | 'styles' | 'traits') => {
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

            statusRef.current = {
                layers: activePanel === 'layers',
                styles: activePanel === 'styles',
                traits: activePanel === 'traits',
            };
        };

        editor.Commands.add('show-blocks', {
            run() {
                const blocksPanel = document.querySelector<HTMLElement>('.blocks-container');
                if (blocksPanel) {
                    // Logika untuk hanya menampilkan/menyembunyikan panel Blocks
                    blocksPanel.style.display = blocksPanel.style.display === 'none' ? '' : 'none';
                }
            },
        });



        editor.Commands.add('show-layers', {
            run() {
                showOnly('layers');
            },
        });

        editor.Commands.add('show-styles', {
            run() {
                showOnly('styles');
            },
        });

        editor.Commands.add('show-traits', {
            run() {
                showOnly('traits');
            },
        });

        editor.Commands.add('set-device-desktop', {run: (editor) => editor.setDevice('Desktop')});
        editor.Commands.add('set-device-mobile', {run: (editor) => editor.setDevice('Mobile')});

        if (initialData) {
            editor.loadProjectData(initialData);
        }

        return () => {
            editor.destroy();
        };
    }, [editorRef]);

    // Akses editor dari ref
    const handleCommand = (command: string) => {
        if (editorRefInternal.current) {
            editorRefInternal.current.Commands.run(command);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-7xl">
            {/* Panel Atas */}

            <div className="panel__top h-11 max-w-7xl bg-gray-800 w-full flex justify-between items-center px-2">
                {/* Kiri: Basic Actions */}

                <div className="flex space-x-2">
                    {[
                        {
                            id: 'toggle-preview',
                            label: '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-eye"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>',
                            command: 'core:preview'
                        },
                        {
                            id: 'export',
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21l-8 -4.5v-9l8 -4.5l8 4.5v4.5" /><path d="M12 12l8 -4.5" /><path d="M12 12v9" /><path d="M12 12l-8 -4.5" /><path d="M15 18h7" /><path d="M19 15l3 3l-3 3" /></svg>',
                            command: 'export-template'
                        },
                        {
                            id: 'show-json',
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16v-8l3 8v-8" /><path d="M15 8a2 2 0 0 1 2 2v4a2 2 0 1 1 -4 0v-4a2 2 0 0 1 2 -2z" /><path d="M1 8h3v6.5a1.5 1.5 0 0 1 -3 0v-.5" /><path d="M7 15a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-1a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h1a1 1 0 0 1 1 1" /></svg>',
                            command: 'show-json'
                        },
                        {
                            id: 'show-blocks',
                            active: true,
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M16 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M8 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M4 3m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z" /><path d="M12 7v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M16 7v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M8 7v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M12 11v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M16 11v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M8 11v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M12 15v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M16 15v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M8 15v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M12 19v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M16 19v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /><path d="M8 19v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2" /></svg>',
                            command: 'show-blocks',
                            togglable: false,
                        },

                    ].map((btn) => (
                        <button
                            key={btn.id}
                            className="p-1 text-white hover:bg-gray-600 rounded transition-colors"
                            onClick={() => handleCommand(btn.command)}
                            dangerouslySetInnerHTML={{__html: btn.label}}
                        />
                    ))}
                </div>

                {/* Tengah: Devices */}
                <div className="flex space-x-2">
                    {[
                        {
                            id: 'device-desktop',
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10z" /><path d="M7 20h10" /><path d="M9 16v4" /><path d="M15 16v4" /></svg>',
                            command: 'set-device-desktop'
                        },
                        {
                            id: 'device-mobile',
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z" /><path d="M11 4h2" /><path d="M12 17v.01" /></svg>',
                            command: 'set-device-mobile'
                        },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            className="p-1 text-white hover:bg-gray-600 rounded transition-colors"
                            onClick={() => handleCommand(btn.command)}
                            dangerouslySetInnerHTML={{__html: btn.label}}
                        />
                    ))}
                </div>

                {/* Kanan: Switcher */}
                <div className="flex space-x-2">
                    {[
                        {
                            id: 'show-layers',
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" /><path d="M16 16v2a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h2" /></svg>',
                            command: 'show-layers'
                        },
                        {
                            id: 'show-styles',
                            label: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M17 17a2 2 0 0 1 -2 -2v-8h-5a2 2 0 0 0 -2 2" /><path d="M7 17a2.775 2.775 0 0 0 2.632 -1.897l.368 -1.103a13.4 13.4 0 0 1 3.236 -5.236l1.764 -1.764" /><path d="M10 14h5" /></svg>',
                            command: 'show-styles'
                        },
                        {
                            id: 'show-traits',
                            label: '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-settings"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>',
                            command: 'show-traits'
                        },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            className="p-1 text-white hover:bg-gray-600 rounded transition-colors"
                            onClick={() => handleCommand(btn.command)}
                            dangerouslySetInnerHTML={{__html: btn.label}}
                        />
                    ))}
                </div>
            </div>

            {/* Konten Utama */}
            <div className="flex w-full mt-11 bg-white">
                <div className="relative w-3/12">
                    <button
                        onClick={() => setIsSidebarLeftOpen(true)}
                        className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
                    >
                        Open Right Sidebar
                    </button>
                    <div className="panel__left items-center px-2 h-10 flex space-x-2 text-xs  ">
                        {[
                            {
                                id: 'show-blocks',
                                active: true,
                                label: '<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-blocks"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 4a1 1 0 0 1 1 -1h5a1 1 0 0 1 1 1v5a1 1 0 0 1 -1 1h-5a1 1 0 0 1 -1 -1z" /><path d="M3 14h12a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h3a2 2 0 0 1 2 2v12" /></svg>',
                                command: 'show-blocks',
                                togglable: false,
                            },

                        ].map((btn) => (
                            <button
                                key={btn.id}
                                className="p-1 text-white hover:bg-gray-600 rounded transition-colors"
                                onClick={() => handleCommand(btn.command)}
                                dangerouslySetInnerHTML={{__html: btn.label}}
                            />
                        ))}
                    </div>
                    <div id="blocks" className="blocks-container"></div>
                </div>
                <div className="editor-row w-12/12">
                    <div className="editor-canvas">
                        <div ref={editorInstanceRef} className=""></div>
                    </div>
                </div>
                <div className="w-4/12">
                    <div className="panel__right w-[16.85rem] text-xs">
                        <div className="layers-container" style={{display: 'none'}}></div>
                        <div className="styles-container" style={{display: 'none'}}></div>
                        <div className="traits-container" style={{display: 'none'}}></div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isSidebarLeftOpen} onClose={closeModal} type="sidebar-left" className={'z-99'}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Right Sidebar</h2>
                    <p className="text-gray-600">Your sidebar content goes here.</p>
                </div>
            </Modal>
        </div>
    );
};

export default Editor;

import { log } from '@/Types/debug';

export const initializeEditorCommands = (editor: any) => {
    // Undo/Redo Commands
    editor.Commands.add('core:undo', {
        run(editor: any) {
            editor.UndoManager.undo();
        }
    });

    editor.Commands.add('core:redo', {
        run(editor: any) {
            editor.UndoManager.redo();
        }
    });

    // Export Commands
    editor.Commands.add('export-template', {
        run(editor: any) {
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
                const copyBtn = (modalContentEl as HTMLElement).querySelector('#copy-to-clipboard-btn') as HTMLButtonElement;
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
        run(editor: any) {
            editor.Modal.setTitle('Components JSON')
                .setContent(`<textarea style="width:100%; height:250px;">${JSON.stringify(editor.getComponents(), null, 2)}</textarea>`)
                .open();
        },
    });

    // Panel Management Commands
    const showOnly = (editor: any, activePanel: 'layers' | 'styles' | 'traits') => {
        const layersPanel = document.querySelector('.layers-container') as HTMLElement;
        const stylesPanel = document.querySelector('.styles-container') as HTMLElement;
        const traitsPanel = document.querySelector('.traits-container') as HTMLElement;

        if (layersPanel) layersPanel.style.display = activePanel === 'layers' ? '' : 'none';
        if (stylesPanel) stylesPanel.style.display = activePanel === 'styles' ? '' : 'none';
        if (traitsPanel) traitsPanel.style.display = activePanel === 'traits' ? '' : 'none';
    };

    editor.Commands.add('show-blocks', {
        run(editor: any) {
            const blocksPanel = document.querySelector('.blocks-container') as HTMLElement;
            if (blocksPanel) {
                blocksPanel.style.display = blocksPanel.style.display === 'none' ? '' : 'none';
            }
        },
    });

    editor.Commands.add('show-layers', {
        run: (editor: any) => showOnly(editor, 'layers')
    });

    editor.Commands.add('show-styles', {
        run: (editor: any) => showOnly(editor, 'styles')
    });

    editor.Commands.add('show-traits', {
        run: (editor: any) => showOnly(editor, 'traits')
    });

    // Device Commands
    editor.Commands.add('set-device-desktop', {
        run: (editor: any) => editor.setDevice('Desktop')
    });

    editor.Commands.add('set-device-mobile', {
        run: (editor: any) => editor.setDevice('Mobile')
    });

    // Code Editor Command
    editor.Commands.add('toggle-code-editor', {
        run(editor: any) {
            editor.runCommand('open-code');
        }
    });

    // Ruler visibility command
    editor.Commands.add('ruler-visibility', {
        run(editor: any) {
            // Toggle ruler visibility logic here
            log('Toggle rulers command executed');
        }
    });
};

// Export default untuk kompatibilitas
export default { initializeEditorCommands };

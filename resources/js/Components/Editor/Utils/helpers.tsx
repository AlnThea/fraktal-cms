import { getMouseListener, showGrabbedInfo, hideGrabbedInfo } from 'grapesjs-click';

// Hapus import capitalizeValue dan gunakan deklarasi lokal saja
export const capitalizeValue = (value?: string) => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.charAt(0).toUpperCase() + value.replace(/[_-]+/, ' ').slice(1);
};

export const setupGrabFunctionality = (editor: any) => {
    const grabbedInfoEl = document.getElementById('grabbed-info');
    if (grabbedInfoEl) {
        const mouseListener = getMouseListener(editor, grabbedInfoEl);

        const resetGrabbedInfo = (element: HTMLElement) => {
            element.textContent = '';
            element.style.top = '0';
            element.style.left = '0';
        };

        editor.on('click:grab-block', (block: any) => {
            const label = block.getLabel();
            const category = block.getCategoryLabel();
            grabbedInfoEl.textContent = `${label} (${category})`;
            showGrabbedInfo(grabbedInfoEl, mouseListener);
        });

        editor.on('click:drop-block', () => {
            resetGrabbedInfo(grabbedInfoEl);
            hideGrabbedInfo(grabbedInfoEl, mouseListener);
        });

        editor.on('click:grab-component', (component: any) => {
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

    editor.on('component:selected', (selectedComponent: any) => {
        const { type: componentType } = selectedComponent.props();
        const toolbar = selectedComponent.get('toolbar') || [];
        const isWrapperComponent = componentType === 'wrapper';
        const hasGrabbedAction = toolbar.some(({ command }: any) => command === 'click:grab-component');

        if (isWrapperComponent || hasGrabbedAction) {
            return;
        }

        const grabIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="currentColor" d="M188 76a31.85 31.85 0 0 0-11.21 2A32 32 0 0 0 128 67a32 32 0 0 0-52 25v16h-8a32 32 0 0 0-32 32v12a92 92 0 0 0 184 0v-44a32 32 0 0 0-32-32m8 76a68 68 0 0 1-136 0v-12a8 8 0 0 1 8-8h8v20a12 12 0 0 0 24 0V92a8 8 0 0 1 16 0v28a12 12 0 0 0 24 0V92a8 8 0 0 1 16 0v28a12 12 0 0 0 24 0v-12a8 8 0 0 1 16 0Z"/></svg>';

        toolbar.unshift({
            label: grabIcon,
            command: 'click:grab-component',
            attributes: { title: 'Grab this component' },
        });

        selectedComponent.set('toolbar', toolbar);
    });

    // Add onClick to all blocks to enable grab functionality
    editor.on('load', () => {
        const blockManager = editor.BlockManager;
        blockManager.getAll().forEach((block: any) => {
            block.set('onClick', () => {
                editor.runCommand('click:grab-block', { id: block.getId() });
            });
        });
    });
};

// Export default - HAPUS capitalizeValue dari sini karena sudah diexport di atas
export default { setupGrabFunctionality };

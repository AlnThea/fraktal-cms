export interface EditorProps {
    onSave?: (data: string) => void;
    initialData?: any;
    editorRef?: React.MutableRefObject<any>;
}

export interface Plugin {
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

export interface SidebarProps {
    isLeftOpen: boolean;
    isRightOpen: boolean;
    activeBlocksPanel: string;
    onBlocksPanelChange: (panel: string) => void;
}

export interface ToolbarProps {
    onCommand: (command: string) => void;
}

export interface ToggleButtonsProps {
    isSidebarLeftOpen: boolean;
    isSidebarRightOpen: boolean;
    onToggleLeft: () => void;
    onToggleRight: () => void;
    onCommand: (command: string) => void;
}

export interface FullscreenState {
    isFullscreen: boolean;
    enterFullscreen: (editor: any) => void;
    exitFullscreen: (editor: any) => void;
}

import React, { useEffect, useRef} from 'react';
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
    initialData?: string;
}

const Editor: React.FC<EditorProps> = ({ onSave, initialData }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const grapesInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        const editor = grapesjs.init({
            container: editorRef.current,
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

        grapesInstanceRef.current = editor;


        if (initialData) {
            try {
                const parsedData = JSON.parse(initialData);
                editor.loadProjectData(parsedData);
                console.log('Data awal dimuat ke Editor');
            } catch (e) {
                console.error('Gagal memuat data awal:', e);
            }
        }

        const events = [
            'component:add',
            'component:remove',
            'component:update',
            'style:add',
            'style:remove',
            'style:update',
        ] as const;

        events.forEach((event) => {
            (editor as any).on(event, () => {
                // Bisa aktifkan auto save di sini
                // const data = editor.getProjectData();
                // onSave?.(JSON.stringify(data));
            });
        });

        return () => {
            editor.destroy();
            console.log('Editor destroyed');
        };
    }, []);

    const handleSave = () => {
        if (grapesInstanceRef.current) {
            const data = grapesInstanceRef.current.getProjectData();
            console.log('🧪 Data disimpan:', data);

            if (onSave) {
                console.log('🧪 onSave DIKIRIM!');
                onSave(JSON.stringify(data, null, 2));
            } else {
                console.log('🚫 onSave TIDAK ADA!');
            }
        }
    };

    const handleLoad = () => {
        const input = prompt('Masukkan data JSON Editor:');
        if (input && grapesInstanceRef.current) {
            try {
                const data = JSON.parse(input);
                grapesInstanceRef.current.loadProjectData(data);
                console.log('Data dimuat dari input');
            } catch (e) {
                alert('Data JSON tidak valid!');
                console.error('Gagal memuat data:', e);
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="bg-gray-200 p-2 flex flex-wrap gap-2 items-center">
                <button
                    onClick={handleSave}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                    Simpan
                </button>
                <button
                    onClick={handleLoad}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                >
                    Muat
                </button>
            </div>

            <div ref={editorRef} className="flex-grow" />
        </div>
    );
};

export default Editor;

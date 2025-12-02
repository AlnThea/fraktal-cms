// resources/js/Components/Editor/Hooks/usePlugins.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { log, err } from '@/Types/debug';
import { Plugin } from '@/Types/editor';
import { loadPlugin } from '../Utils/pluginLoader';

export const usePlugins = () => {
    const [plugins, setPlugins] = useState<Plugin[]>([]);

    const fetchActivePlugins = async (): Promise<Plugin[]> => {
        try {
            const response = await axios.get('/api/active-plugins');
            return response.data;
        } catch (error) {
            err('Failed to fetch plugins:', error);
            return [];
        }
    };

    const loadPlugins = async (): Promise<any[]> => {
        try {
            const activePlugins = await fetchActivePlugins();
            setPlugins(activePlugins);
            log('📦 Active plugins to load:', activePlugins);

            return activePlugins.map(plugin =>
                async (editor: any, options: any) => {
                    try {
                        log(`🔄 Initializing plugin: ${plugin.name}...`);

                        if (!editor.getWrapper()) {
                            await new Promise((resolve) => {
                                editor.once('load', resolve);
                                editor.once('editor:ready', resolve);
                            });
                        }

                        await new Promise(resolve => setTimeout(resolve, 100));
                        const pluginModule = await loadPlugin(plugin);

                        log(`✅ Plugin ${plugin.name} loaded successfully:`, pluginModule);

                        if (typeof pluginModule === 'function') {
                            return pluginModule(editor, options);
                        } else if (pluginModule && typeof pluginModule.default === 'function') {
                            return pluginModule.default(editor, options);
                        } else if (pluginModule && typeof pluginModule.init === 'function') {
                            return pluginModule.init(editor, options);
                        } else {
                            console.warn(`⚠️ Plugin ${plugin.name} has no initialize function`);
                            return pluginModule;
                        }
                    } catch (error) {
                        err(`💥 Failed to initialize plugin ${plugin.name}:`, error);
                        return null;
                    }
                }
            );
        } catch (error) {
            err('Failed to load plugins:', error);
            return [];
        }
    };

    return { plugins, loadPlugins };
};

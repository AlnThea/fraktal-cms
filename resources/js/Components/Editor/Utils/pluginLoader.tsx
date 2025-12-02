import { log, err } from '@/Types/debug';
import { Plugin } from '@/Types/editor';

export const capitalizeValue = (value?: string) => {
    if (typeof value !== 'string') {
        return '';
    }
    return value.charAt(0).toUpperCase() + value.replace(/[_-]+/, ' ').slice(1);
};

export const loadPlugin = (plugin: Plugin): Promise<any> => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = plugin.main_file;

        const beforeLoadGlobals = Object.keys(window);
        log(`🔄 Loading plugin: ${plugin.name} from ${plugin.main_file}`);

        script.onload = () => {
            log(`✅ Script loaded for: ${plugin.name}`);
            const win = window as any;

            const cleanName = plugin.name.replace(/[^a-zA-Z0-9]/g, '');
            const cleanSlug = plugin.slug.replace(/[^a-zA-Z0-9]/g, '');

            const generatedNames = [
                cleanName + 'Blocks',
                cleanName + 'Plugin',
                't' + cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
                cleanSlug + 'Blocks',
                cleanSlug + 'Plugin',
                cleanName,
                cleanName.charAt(0).toLowerCase() + cleanName.slice(1) + 'Blocks',
                cleanName.toLowerCase() + '_blocks',
                cleanSlug.split('-').map((word, index) =>
                    index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
                ).join('') + 'Blocks',
            ];

            const uniqueNames = [...new Set(generatedNames.filter(name => name && name.length > 0))];
            log(`🔍 Trying generated names for ${plugin.name}:`, uniqueNames);

            for (const name of uniqueNames) {
                if (win[name]) {
                    log(`✅ Found export with generated name: ${name}`);
                    const module = win[name];
                    delete win[name];
                    return resolve(module);
                }
            }

            const afterLoadGlobals = Object.keys(win);
            const newGlobals = afterLoadGlobals.filter(
                key => !beforeLoadGlobals.includes(key)
            );

            log(`🆕 New globals after load:`, newGlobals);

            if (newGlobals.length > 0) {
                const functionExports = newGlobals.filter(
                    key => typeof win[key] === 'function'
                );

                if (functionExports.length > 0) {
                    log(`🔄 Using function export: ${functionExports[0]}`);
                    const module = win[functionExports[0]];
                    delete win[functionExports[0]];
                    return resolve(module);
                }

                const objectExports = newGlobals.filter(
                    key => typeof win[key] === 'object' &&
                        win[key] !== null &&
                        !Array.isArray(win[key]) &&
                        !['location', 'document', 'navigator', 'history'].includes(key)
                );

                if (objectExports.length > 0) {
                    log(`📦 Using object export: ${objectExports[0]}`);
                    const module = win[objectExports[0]];
                    delete win[objectExports[0]];
                    return resolve(module);
                }

                const nonInternalGlobals = newGlobals.filter(key =>
                    !key.startsWith('_') &&
                    !key.startsWith('webkit') &&
                    !key.startsWith('$') &&
                    key !== 'InstallTrigger'
                );

                if (nonInternalGlobals.length > 0) {
                    log(`⚠️ Using first non-internal global: ${nonInternalGlobals[0]}`);
                    const module = win[nonInternalGlobals[0]];
                    delete win[nonInternalGlobals[0]];
                    return resolve(module);
                }
            }

            const allFunctionGlobals = Object.keys(win).filter(
                key => typeof win[key] === 'function' &&
                    !key.startsWith('_') &&
                    !['webkitStorageInfo', 'chrome', 'runtime', 'browser'].includes(key) &&
                    !beforeLoadGlobals.includes(key)
            );

            if (allFunctionGlobals.length > 0) {
                log(`🔧 Final fallback to function: ${allFunctionGlobals[0]}`);
                const module = win[allFunctionGlobals[0]];
                return resolve(module);
            }

            err('❌ No valid export found. Available globals:', afterLoadGlobals);
            reject(new Error(
                `Plugin ${plugin.name} loaded but no identifiable export found. ` +
                `Tried ${uniqueNames.length} generated names and found ${newGlobals.length} new globals. ` +
                `Please ensure the plugin exports a global function or object.`
            ));
        };

        script.onerror = () => {
            err(`❌ Failed to load script: ${plugin.main_file}`);
            reject(new Error(`Failed to load plugin: ${plugin.name}`));
        };

        document.head.appendChild(script);
    });
};

// Export default
export default { loadPlugin, capitalizeValue };

// @/Types/debug.ts
type DebugConfig = {
    enabled: boolean;
    prefix?: string;
    showTimestamp?: boolean;
};

class Debugger {
    private config: DebugConfig;

    constructor(config: Partial<DebugConfig> = {}) {
        const defaultEnabled = this.getDefaultEnabled();

        this.config = {
            enabled: config.enabled ?? defaultEnabled,
            prefix: config.prefix,
            showTimestamp: config.showTimestamp ?? false
        };
    }

    private getDefaultEnabled(): boolean {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('debug') === 'true') return true;
            if (localStorage.getItem('DEBUG') === 'true') return true;
        }
        return false;
    }

    private formatMessage(message: string): string {
        let formatted = '';

        if (this.config.showTimestamp) {
            formatted += `[${new Date().toLocaleTimeString()}] `;
        }

        if (this.config.prefix) {
            formatted += `[${this.config.prefix}] `;
        }

        return formatted + message;
    }

    log = (...args: any[]) => {
        if (this.config.enabled) {
            console.log(this.formatMessage(args[0]), ...args.slice(1));
        }
    };

    warn = (...args: any[]) => {
        if (this.config.enabled) {
            console.warn(this.formatMessage(args[0]), ...args.slice(1));
        }
    };

    // ✅ GUNAKAN NAMA LAIN UNTUK ERROR
    err = (...args: any[]) => {
        console.error(this.formatMessage(args[0]), ...args.slice(1));
    };

    // ✅ ATAU PAKAI NAMA YANG LEBIH DESKRIPTIF
    logError = (...args: any[]) => {
        console.error(this.formatMessage(args[0]), ...args.slice(1));
    };

    info = (...args: any[]) => {
        if (this.config.enabled) {
            console.info(this.formatMessage(args[0]), ...args.slice(1));
        }
    };

    debug = (...args: any[]) => {
        if (this.config.enabled) {
            console.debug(this.formatMessage(args[0]), ...args.slice(1));
        }
    };

    setConfig = (config: Partial<DebugConfig>) => {
        this.config = { ...this.config, ...config };
    };

    enable = () => {
        this.config.enabled = true;
        if (typeof window !== 'undefined') {
            localStorage.setItem('DEBUG', 'true');
        }
    };

    disable = () => {
        this.config.enabled = false;
        if (typeof window !== 'undefined') {
            localStorage.setItem('DEBUG', 'false');
        }
    };

    get isEnabled() {
        return this.config.enabled;
    }
}

// Buat instances untuk berbagai bagian aplikasi
export const mainDebug = new Debugger({ prefix: 'APP' });
export const pluginDebug = new Debugger({ prefix: 'PLUGIN' });
export const editorDebug = new Debugger({ prefix: 'EDITOR' });
export const apiDebug = new Debugger({ prefix: 'API' });

// ✅ EXPORT DENGAN NAMA BARU
export const { log, warn, err, info, debug } = mainDebug;
export const { setConfig, enable, disable, isEnabled } = mainDebug;

// Export class untuk custom instances
export { Debugger };
export default mainDebug;

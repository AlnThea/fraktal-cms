<?php

namespace App\Services;

use App\Models\Plugin;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class PluginService
{
    protected $pluginsPath;
    protected $publicPath;

    public function __construct()
    {
        $this->pluginsPath = storage_path('app/plugins/');
        $this->publicPath = public_path('plugins/');

        \Log::info('PluginService initialized', [
            'plugins_path' => $this->pluginsPath,
            'public_path' => $this->publicPath,
            'os' => PHP_OS,
            'symlink_working' => $this->isSymlinkWorking()
        ]);

        // Ensure directories exist - dengan error handling
        try {
            if (!File::exists($this->pluginsPath)) {
                File::ensureDirectoryExists($this->pluginsPath, 0755, true);
                \Log::info('Created plugins directory', ['path' => $this->pluginsPath]);
            }

            if (!File::exists($this->publicPath)) {
                File::ensureDirectoryExists($this->publicPath, 0755, true);
                \Log::info('Created public plugins directory', ['path' => $this->publicPath]);
            }
        } catch (\Exception $e) {
            \Log::warning('Directory creation warning: ' . $e->getMessage());
        }
    }

    /**
     * Check if symlink is working
     */
    public function isSymlinkWorking()
    {
        $link = public_path('plugins');
        $target = storage_path('app/plugins');

        if (!file_exists($link) || !file_exists($target)) {
            return false;
        }

        // Check if it's a symlink
        if (is_link($link)) {
            return true;
        }

        // Windows junction detection
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            return is_dir($link) && realpath($link) === realpath($target);
        }

        return false;
    }

    /**
     * Sync single plugin assets
     */
    public function syncPluginAssets($pluginId)
    {
        $plugin = Plugin::findOrFail($pluginId);

        $source = $plugin->plugin_path;
        $destination = public_path("plugins/{$plugin->slug}");

        if (!File::exists($source)) {
            throw new \Exception("Source directory not found: {$source}");
        }

        // Remove existing
        if (File::exists($destination)) {
            File::deleteDirectory($destination);
        }

        // Copy files
        File::ensureDirectoryExists(dirname($destination), 0755, true);
        File::copyDirectory($source, $destination);

        return true;
    }

    /**
     * Sync all plugin assets manually
     */
    public function syncAllPluginAssets()
    {
        try {
            $plugins = Plugin::all();
            $copied = 0;

            foreach ($plugins as $plugin) {
                $source = $plugin->plugin_path;
                $destination = public_path("plugins/{$plugin->slug}");

                if (File::exists($source)) {
                    // Remove existing destination
                    if (File::exists($destination)) {
                        File::deleteDirectory($destination);
                    }

                    // Create directory and copy
                    File::ensureDirectoryExists(dirname($destination), 0755, true);
                    File::copyDirectory($source, $destination);
                    $copied++;

                    \Log::info("Synced plugin assets: {$plugin->slug}");
                }
            }

            return $copied;
        } catch (\Exception $e) {
            \Log::error('Plugin asset sync failed: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get asset URL with cross-platform support
     */
    public function getPluginAssetUrls($plugin)
    {
        try {
            $assets = ['js' => [], 'css' => []];

            // Gunakan assets dari database jika ada
            if ($plugin->assets && is_array($plugin->assets)) {
                foreach ($plugin->assets as $type => $files) {
                    if (in_array($type, ['js', 'css']) && is_array($files)) {
                        foreach ($files as $file) {
                            if (!empty($file)) {
                                $assetUrl = $this->getAssetUrl($plugin->slug, $file);
                                // Hanya tambahkan jika file exists dan URL valid
                                if ($assetUrl) {
                                    $assets[$type][] = $assetUrl;
                                }
                            }
                        }
                    }
                }
            } else {
                // Fallback ke main_file atau default
                $mainFile = $plugin->main_file ?: "{$plugin->slug}.umd.js";
                $assetUrl = $this->getAssetUrl($plugin->slug, $mainFile);
                if ($assetUrl) {
                    $assets['js'][] = $assetUrl;
                }
            }

            return $assets;

        } catch (\Exception $e) {
            \Log::error('Error in getPluginAssetUrls: ' . $e->getMessage());
            return ['js' => [], 'css' => []];
        }
    }

    /**
     * Get asset URL with cross-platform path detection
     */
    protected function getAssetUrl($slug, $filename)
    {
        $possiblePaths = [
            $filename,
            "dist/{$filename}",
            "assets/{$filename}",
            "js/{$filename}",
            "css/{$filename}",
            "build/{$filename}",
        ];

        foreach ($possiblePaths as $path) {
            $fullPath = "{$slug}/{$path}";

            // Priority 1: Cek di public/plugins (setelah symlink/copy)
            $publicPath = "plugins/{$fullPath}";
            $publicFullPath = public_path($publicPath);

            // Check if file exists in public directory (via symlink or manual copy)
            if (file_exists($publicFullPath)) {
                return url($publicPath);
            }

            // Priority 2: Cek di storage via route (fallback)
            if (Storage::disk('plugins')->exists($fullPath)) {
                // Use the named route we defined
                return route('plugins.assets', ['slug' => $slug, 'path' => $path]);
            }
        }

        \Log::warning("Asset not found: {$slug}/{$filename}", [
            'possible_paths' => $possiblePaths,
            'public_exists' => file_exists(public_path("plugins/{$slug}")),
            'storage_exists' => Storage::disk('plugins')->exists($slug)
        ]);

        return null;
    }

    /**
     * Upload and install plugin
     */
    public function uploadPlugin($file)
    {
        $tempPath = null;

        try {
            \Log::info('🔄 Starting plugin upload', [
                'filename' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'size_mb' => round($file->getSize() / 1024 / 1024, 2) . ' MB'
            ]);

            // Validate file type
            if ($file->getClientOriginalExtension() !== 'zip') {
                throw new \Exception('Only ZIP files are allowed');
            }

            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $slug = Str::slug($originalName);

            \Log::info('Generated slug', ['slug' => $slug]);

            // Check if plugin already exists
            if (Plugin::where('slug', $slug)->exists()) {
                $existing = Plugin::where('slug', $slug)->first();
                \Log::error('Plugin slug conflict', [
                    'requested_slug' => $slug,
                    'existing_plugin' => $existing->name
                ]);
                throw new \Exception("Plugin with slug '{$slug}' already exists");
            }

            // Create temporary extraction path
            $tempPath = $this->pluginsPath . 'temp_' . $slug . '_' . time();
            \Log::info('Creating temp path', ['temp_path' => $tempPath]);

            File::ensureDirectoryExists($tempPath);

            // Extract ZIP
            \Log::info('Extracting ZIP file');
            $zip = new ZipArchive;
            if ($zip->open($file->getRealPath()) === TRUE) {
                $zip->extractTo($tempPath);
                $zip->close();
                \Log::info('ZIP extraction successful');
            } else {
                throw new \Exception('Failed to extract ZIP file');
            }

            // Look for plugin.json configuration
            \Log::info('Looking for plugin.json');
            $pluginConfig = $this->findPluginConfig($tempPath);
            if (!$pluginConfig) {
                \Log::error('plugin.json not found in extracted files');
                File::deleteDirectory($tempPath);
                throw new \Exception('plugin.json not found');
            }

            \Log::info('plugin.json found', ['config' => $pluginConfig]);

            // Validate plugin.json structure
            $validatedConfig = $this->validatePluginConfig($pluginConfig);
            \Log::info('Plugin config validated');

            // Tentukan main_file dan assets dari plugin.json
            $mainFile = $validatedConfig['main_file'] ?? $validatedConfig['assets']['js'][0] ?? "{$slug}.umd.js";
            $assets = $validatedConfig['assets'] ?? [
                'js' => [$mainFile],
                'css' => $validatedConfig['css'] ?? []
            ];

            \Log::info('Plugin assets determined', [
                'main_file' => $mainFile,
                'assets' => $assets
            ]);

            // Move to final location
            $finalPath = $this->pluginsPath . $slug;

            \Log::info('Moving to final location', [
                'temp_path' => $tempPath,
                'final_path' => $finalPath,
                'temp_exists' => File::exists($tempPath),
                'final_exists' => File::exists($finalPath)
            ]);

            if (File::exists($finalPath)) {
                \Log::error('Final path already exists', ['path' => $finalPath]);
                throw new \Exception("Plugin directory already exists: {$slug}");
            }

            File::move($tempPath, $finalPath);
            \Log::info('Move completed successfully');

            // Copy public assets if exists
            $this->handlePublicAssets($finalPath, $slug);

            // Auto-sync assets if symlink not working
            if (!$this->isSymlinkWorking()) {
                $this->info('Symlink not working, auto-syncing assets...');
                $publicDest = $this->publicPath . $slug;
                if (File::exists($finalPath) && !File::exists($publicDest)) {
                    File::copyDirectory($finalPath, $publicDest);
                }
            }

            // Create plugin record
            \Log::info('Creating plugin database record', [
                'name' => $validatedConfig['name'],
                'slug' => $slug,
                'type' => $validatedConfig['type'] ?? 'extension',
            ]);

            $plugin = Plugin::create([
                'name' => $validatedConfig['name'],
                'slug' => $slug,
                'version' => $validatedConfig['version'],
                'description' => $validatedConfig['description'] ?? null,
                'author' => $validatedConfig['author'] ?? null,
                'author_url' => $validatedConfig['author_url'] ?? null,
                'plugin_url' => $validatedConfig['plugin_url'] ?? null,
                'dependencies' => $validatedConfig['dependencies'] ?? null,
                'plugin_path' => $finalPath,
                'main_file' => $mainFile,
                'assets' => $assets,
                'settings' => $validatedConfig['settings'] ?? null,
                'type' => $validatedConfig['type'] ?? 'extension',
            ]);

            \Log::info('✅ Plugin created successfully', [
                'plugin_id' => $plugin->id,
                'plugin_name' => $plugin->name
            ]);

            return $plugin;

        } catch (\Exception $e) {
            \Log::error('❌ Plugin upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Cleanup on error
            if (isset($tempPath) && File::exists($tempPath)) {
                \Log::info('Cleaning up temp directory', ['temp_path' => $tempPath]);
                File::deleteDirectory($tempPath);
            }
            throw $e;
        }
    }

    protected function findPluginConfig($path)
    {
        // Check root directory first
        $configPath = $path . '/plugin.json';
        if (File::exists($configPath)) {
            \Log::info('✅ plugin.json found in root');
            return json_decode(File::get($configPath), true);
        }

        // Check common subdirectories
        $commonDirs = ['dist', 'src', 'assets', 'build', 'public'];

        foreach ($commonDirs as $dir) {
            $configPath = $path . '/' . $dir . '/plugin.json';
            if (File::exists($configPath)) {
                \Log::info("✅ plugin.json found in {$dir}/ directory");
                return json_decode(File::get($configPath), true);
            }
        }

        // Check all subdirectories recursively as fallback
        $directories = File::directories($path);
        foreach ($directories as $directory) {
            $configPath = $directory . '/plugin.json';
            if (File::exists($configPath)) {
                \Log::info("✅ plugin.json found in subdirectory: " . basename($directory));
                return json_decode(File::get($configPath), true);
            }

            // Check sub-subdirectories (like dist/assets/etc)
            $subDirs = File::directories($directory);
            foreach ($subDirs as $subDir) {
                $configPath = $subDir . '/plugin.json';
                if (File::exists($configPath)) {
                    \Log::info("✅ plugin.json found in subdirectory: " . basename($directory) . '/' . basename($subDir));
                    return json_decode(File::get($configPath), true);
                }
            }
        }

        \Log::error('❌ plugin.json not found in any location');
        \Log::error('Available files in temp directory:', [
            'files' => File::files($path),
            'directories' => File::directories($path)
        ]);

        return null;
    }

    protected function validatePluginConfig($config)
    {
        $required = ['name', 'version', 'type'];
        foreach ($required as $field) {
            if (!isset($config[$field])) {
                throw new \Exception("Missing required field: {$field}");
            }
        }

        return $config;
    }

    protected function handlePublicAssets($pluginPath, $slug)
    {
        $publicSrc = $pluginPath . '/public';
        $publicDest = $this->publicPath . $slug;

        if (File::exists($publicSrc)) {
            File::copyDirectory($publicSrc, $publicDest);
        }
    }

    public function activatePlugin($pluginId)
    {
        $plugin = Plugin::findOrFail($pluginId);

        // Load plugin bootstrap file if exists
        $bootstrapFile = $plugin->plugin_path . '/bootstrap.php';
        if (File::exists($bootstrapFile)) {
            require_once $bootstrapFile;
        }

        $plugin->update(['is_active' => true]);

        return $plugin;
    }

    public function deactivatePlugin($pluginId)
    {
        $plugin = Plugin::findOrFail($pluginId);
        $plugin->update(['is_active' => false]);

        return $plugin;
    }

    public function deletePlugin($pluginId)
    {
        $plugin = Plugin::findOrFail($pluginId);

        // Delete files
        if (File::exists($plugin->plugin_path)) {
            File::deleteDirectory($plugin->plugin_path);
        }

        // Delete public assets
        $publicPath = $this->publicPath . $plugin->slug;
        if (File::exists($publicPath)) {
            File::deleteDirectory($publicPath);
        }

        $plugin->delete();

        return true;
    }

    public function getActiveGrapeJSBlocks()
    {
        return Plugin::where('is_active', true)
            ->where('type', 'grapejs-block')
            ->get()
            ->map(function($plugin) {
                $blockConfig = $this->loadBlockConfig($plugin);
                return $blockConfig ? array_merge($blockConfig, [
                    'plugin_slug' => $plugin->slug
                ]) : null;
            })
            ->filter()
            ->values();
    }

    protected function loadBlockConfig(Plugin $plugin)
    {
        $configPath = $plugin->plugin_path . '/block.json';
        if (File::exists($configPath)) {
            return json_decode(File::get($configPath), true);
        }
        return null;
    }

    /**
     * Helper method for console output
     */
    protected function info($message)
    {
        if (app()->runningInConsole()) {
            \Illuminate\Support\Facades\Artisan::output($message);
        } else {
            \Log::info($message);
        }
    }

    /**
     * Clean up orphaned plugin directories
     */
    public function cleanupOrphanedPlugins()
    {
        try {
            $dbSlugs = Plugin::pluck('slug')->toArray();
            $storageDirs = File::directories($this->pluginsPath);
            $publicDirs = File::directories($this->publicPath);

            $cleaned = 0;

            // Clean storage directories
            foreach ($storageDirs as $dir) {
                $dirName = basename($dir);
                if (strpos($dirName, 'temp_') === 0) {
                    // Delete temp directories
                    File::deleteDirectory($dir);
                    $cleaned++;
                    \Log::info("Deleted temp directory: {$dirName}");
                } elseif (!in_array($dirName, $dbSlugs)) {
                    // Delete orphaned plugin directories
                    File::deleteDirectory($dir);
                    $cleaned++;
                    \Log::info("Deleted orphaned plugin directory: {$dirName}");
                }
            }

            // Clean public directories
            foreach ($publicDirs as $dir) {
                $dirName = basename($dir);
                if (!in_array($dirName, $dbSlugs)) {
                    File::deleteDirectory($dir);
                    $cleaned++;
                    \Log::info("Deleted orphaned public directory: {$dirName}");
                }
            }

            return $cleaned;

        } catch (\Exception $e) {
            \Log::error('Cleanup failed: ' . $e->getMessage());
            return 0;
        }
    }
}

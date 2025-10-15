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

        // Ensure directories exist
        File::ensureDirectoryExists($this->pluginsPath);
        File::ensureDirectoryExists($this->publicPath);
    }

    public function uploadPlugin($file)
    {
        try {
            // Validate file type
            if ($file->getClientOriginalExtension() !== 'zip') {
                throw new \Exception('Only ZIP files are allowed');
            }

            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $slug = Str::slug($originalName);

            // Check if plugin already exists
            if (Plugin::where('slug', $slug)->exists()) {
                throw new \Exception('Plugin already exists');
            }

            // Create temporary extraction path
            $tempPath = $this->pluginsPath . 'temp_' . $slug . '_' . time();
            File::ensureDirectoryExists($tempPath);

            // Extract ZIP
            $zip = new ZipArchive;
            if ($zip->open($file->getRealPath()) === TRUE) {
                $zip->extractTo($tempPath);
                $zip->close();
            } else {
                throw new \Exception('Failed to extract ZIP file');
            }

            // Look for plugin.json configuration
            $pluginConfig = $this->findPluginConfig($tempPath);
            if (!$pluginConfig) {
                File::deleteDirectory($tempPath);
                throw new \Exception('plugin.json not found');
            }

            // Validate plugin.json structure
            $validatedConfig = $this->validatePluginConfig($pluginConfig);

            // Move to final location
            $finalPath = $this->pluginsPath . $slug;
            File::move($tempPath, $finalPath);

            // Copy public assets if exists
            $this->handlePublicAssets($finalPath, $slug);

            // Create plugin record
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
                'settings' => $validatedConfig['settings'] ?? null,
                'type' => $validatedConfig['type'] ?? 'extension', // Tambahkan ini
            ]);

            return $plugin;

        } catch (\Exception $e) {
            // Cleanup on error
            if (isset($tempPath) && File::exists($tempPath)) {
                File::deleteDirectory($tempPath);
            }
            throw $e;
        }
    }

    protected function findPluginConfig($path)
    {
        $configPath = $path . '/plugin.json';
        if (File::exists($configPath)) {
            return json_decode(File::get($configPath), true);
        }

        // Check in subdirectories
        $directories = File::directories($path);
        foreach ($directories as $directory) {
            $configPath = $directory . '/plugin.json';
            if (File::exists($configPath)) {
                return json_decode(File::get($configPath), true);
            }
        }

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
}

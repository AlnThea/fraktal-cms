<?php

namespace App\Providers;

use App\Services\PluginService;
use Illuminate\Support\ServiceProvider;

class PluginServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(PluginService::class, function ($app) {
            return new PluginService();
        });
    }

    public function boot()
    {
        // Load active plugins
        $this->loadActivePlugins();
    }

    protected function loadActivePlugins()
    {
        try {
            $pluginService = app(PluginService::class);
            $activePlugins = \App\Models\Plugin::active()->get();

            foreach ($activePlugins as $plugin) {
                $this->loadPlugin($plugin);
            }
        } catch (\Exception $e) {
            // Log error but don't break the application
            \Log::error('Failed to load plugins: ' . $e->getMessage());
        }
    }

    protected function loadPlugin($plugin)
    {
        $bootstrapFile = $plugin->plugin_path . '/bootstrap.php';

        if (file_exists($bootstrapFile)) {
            require_once $bootstrapFile;
        }

        // Register plugin routes if exists
        $routesFile = $plugin->plugin_path . '/routes.php';
        if (file_exists($routesFile)) {
            $this->loadRoutesFrom($routesFile);
        }

        // Register plugin views if exists
        $viewsPath = $plugin->plugin_path . '/views';
        if (is_dir($viewsPath)) {
            $this->loadViewsFrom($viewsPath, $plugin->slug);
        }
    }
}

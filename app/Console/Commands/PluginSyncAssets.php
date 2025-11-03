<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\Plugin;

class PluginSyncAssets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'plugin:sync-assets {--force : Force re-sync all plugins}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync plugin assets manually (fallback when symlink fails)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Syncing plugin assets...');

        $plugins = Plugin::all();
        $synced = 0;
        $skipped = 0;

        if ($plugins->count() === 0) {
            $this->warn('No plugins found in database.');
            return 0;
        }

        $this->info("Found {$plugins->count()} plugin(s) in database");

        foreach ($plugins as $plugin) {
            $this->line("Processing: {$plugin->name} ({$plugin->slug})");

            $source = $plugin->plugin_path;
            $destination = public_path("plugins/{$plugin->slug}");

            if (!File::exists($source)) {
                $this->warn("  ⚠️  Source directory not found: {$source}");
                $skipped++;
                continue;
            }

            // Check if already exists and not forcing
            if (File::exists($destination) && !$this->option('force')) {
                $this->line("  ⏭️  Already synced, use --force to re-sync");
                $skipped++;
                continue;
            }

            try {
                // Remove existing destination if forcing
                if (File::exists($destination) && $this->option('force')) {
                    File::deleteDirectory($destination);
                    $this->line("  ♻️  Removed existing directory");
                }

                // Create destination directory
                File::ensureDirectoryExists(dirname($destination), 0755, true);

                // Copy files
                $this->line("  📁 Copying from {$source} to {$destination}");
                File::copyDirectory($source, $destination);

                $this->line("  ✅ Synced successfully");
                $synced++;

            } catch (\Exception $e) {
                $this->error("  ❌ Failed to sync: " . $e->getMessage());
                $skipped++;
            }
        }

        $this->line("");

        if ($synced > 0) {
            $this->info("✅ Successfully synced {$synced} plugin(s)");
        }

        if ($skipped > 0) {
            $this->warn("⏭️  Skipped {$skipped} plugin(s)");
        }

        $this->line("");
        $this->line("💡 Note: Manual sync means you need to run this command");
        $this->line("   again when plugin files change.");

        return 0;
    }
}

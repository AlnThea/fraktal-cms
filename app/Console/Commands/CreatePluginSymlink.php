<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CreatePluginSymlink extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'plugin:symlink';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create symlink for plugins directory';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $target = storage_path('app/plugins');
        $link = public_path('plugins');

        $this->info("Target: {$target}");
        $this->info("Link: {$link}");

        // Check if target exists
        if (!file_exists($target)) {
            $this->error("Target directory does not exist: {$target}");
            return 1;
        }

        // Check if link already exists
        if (file_exists($link)) {
            if (is_link($link)) {
                $this->info("✅ Plugin symlink already exists");
                $this->info("   Linked to: " . readlink($link));
                return 0;
            } else {
                $this->warn("⚠️ 'plugins' exists but is not a symlink - it's a directory");
                $this->warn("   Removing directory and creating symlink...");

                // Remove directory and create symlink
                \Illuminate\Support\Facades\File::deleteDirectory($link);
            }
        }

        // Create symlink
        if (symlink($target, $link)) {
            $this->info("✅ Plugin symlink created successfully");
            $this->info("   {$link} -> {$target}");

            // Verify
            if (file_exists($link . '/ti-core-blocks-free/dist/ti-core-blocks-free.umd.js')) {
                $this->info("✅ File verification: ti-core-blocks-free.umd.js accessible via symlink");
            }

            return 0;
        } else {
            $this->error("❌ Failed to create plugin symlink");
            return 1;
        }
    }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

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

        // Ensure target exists
        if (!File::exists($target)) {
            $this->info("Creating target directory: {$target}");
            File::ensureDirectoryExists($target, 0755, true);
        }

        // Check if link already exists
        if (File::exists($link)) {
            if ($this->isSymlink($link)) {
                $this->info("✅ Plugin symlink already exists");
                $this->info("   Linked to: " . $this->readlink($link));
                return 0;
            } else {
                $this->warn("⚠️ 'plugins' exists but is not a symlink - it's a directory");
                $this->warn("   Removing directory and creating symlink...");

                try {
                    File::deleteDirectory($link);
                    $this->info("✅ Directory removed successfully");
                } catch (\Exception $e) {
                    $this->error("❌ Failed to remove directory: " . $e->getMessage());
                    $this->suggestFallback();
                    return 1;
                }
            }
        }

        // Create symlink based on OS
        $this->info("🖥️  Detected OS: " . PHP_OS);

        try {
            if ($this->createSymlink($target, $link)) {
                $this->info("✅ Plugin symlink created successfully");
                $this->info("   {$link} -> {$target}");

                // Verify
                $this->verifySymlink($link, $target);
                return 0;
            } else {
                $this->error("❌ Failed to create symlink");
                $this->suggestFallback();
                return 1;
            }
        } catch (\Exception $e) {
            $this->error("❌ Error: " . $e->getMessage());
            $this->suggestFallback();
            return 1;
        }
    }

    /**
     * Create symlink based on operating system
     */
    protected function createSymlink($target, $link)
    {
        // Normalize paths
        $target = rtrim($target, '/\\');
        $link = rtrim($link, '/\\');

        // Windows
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $this->info("🪟 Windows detected, using mklink junction...");

            // Use mklink command to create junction
            $command = "mklink /J \"{$link}\" \"{$target}\"";
            exec($command, $output, $returnCode);

            if ($returnCode === 0) {
                $this->info("✅ Windows junction created successfully");
                return true;
            } else {
                $this->warn("⚠️ Junction failed (code: {$returnCode}), trying symlink...");

                // Fallback to regular symlink (requires admin privileges on Windows)
                return symlink($target, $link);
            }
        }
        // Linux/Mac
        else {
            $this->info("🐧 Linux/Mac detected, using symlink...");
            return symlink($target, $link);
        }
    }

    /**
     * Check if path is a symlink (cross-platform)
     */
    protected function isSymlink($path)
    {
        if (is_link($path)) {
            return true;
        }

        // Windows junction detection
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            return $this->isWindowsJunction($path);
        }

        return false;
    }

    /**
     * Basic Windows junction detection
     */
    protected function isWindowsJunction($path)
    {
        if (!is_dir($path)) {
            return false;
        }

        // Try to read link target
        $target = $this->readlink($path);
        return $target !== false && $target !== $path;
    }

    /**
     * Read link target (cross-platform)
     */
    protected function readlink($path)
    {
        if (is_link($path)) {
            return readlink($path);
        }

        // Windows: try to get junction target
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $command = "dir /A:L \"{$path}\"";
            exec($command, $output, $returnCode);

            if ($returnCode === 0) {
                foreach ($output as $line) {
                    if (strpos($line, 'JUNCTION') !== false) {
                        // Extract target from dir output
                        preg_match('/\[(.*?)\]/', $line, $matches);
                        return $matches[1] ?? false;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Verify symlink works
     */
    protected function verifySymlink($link, $target)
    {
        if (!File::exists($link)) {
            $this->error("❌ Symlink verification failed: link doesn't exist");
            return false;
        }

        if (!File::exists($target)) {
            $this->error("❌ Symlink verification failed: target doesn't exist");
            return false;
        }

        $this->info("✅ Symlink verification: Both link and target exist");

        // Test file access
        $testFile = $link . '/test.txt';
        $testTarget = $target . '/test.txt';

        try {
            // Create test file in target
            File::put($testTarget, 'test');

            // Read via link
            if (File::exists($testFile) && File::get($testFile) === 'test') {
                $this->info("✅ File access test: PASSED");
                File::delete($testTarget);
            } else {
                $this->warn("⚠️ File access test: PARTIAL - symlink created but file access limited");
            }
        } catch (\Exception $e) {
            $this->warn("⚠️ File access test: SKIPPED - " . $e->getMessage());
        }

        return true;
    }

    /**
     * Suggest fallback options
     */
    protected function suggestFallback()
    {
        $this->line("");
        $this->line("💡 Alternative solutions:");
        $this->line("   1. Run as Administrator (Windows)");
        $this->line("   2. Use directory copy instead: php artisan plugin:sync-assets");
        $this->line("   3. Manually create the symlink/junction");
        $this->line("");
    }
}

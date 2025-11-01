<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CreatePluginSymlink extends Command
{
    protected $signature = 'plugin:symlink';
    protected $description = 'Create symlink for plugins directory';

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
            if (is_link($link) || $this->isWindowsSymlink($link)) {
                $this->info("✅ Plugin symlink already exists");
                $currentTarget = is_link($link) ? readlink($link) : $this->getWindowsSymlinkTarget($link);
                $this->info("   Linked to: " . $currentTarget);
                return 0;
            } else {
                $this->warn("⚠️ 'plugins' exists but is not a symlink - it's a directory");
                $this->warn("   Removing directory and creating symlink...");
                File::deleteDirectory($link);
            }
        }

        // Create symlink dengan approach cross-platform
        if ($this->createCrossPlatformSymlink($target, $link)) {
            $this->info("✅ Plugin symlink created successfully");
            $this->info("   {$link} -> {$target}");

            // Verify
            if (file_exists($link . '/ti-core-blocks-free/dist/ti-core-blocks-free.umd.js')) {
                $this->info("✅ File verification: ti-core-blocks-free.umd.js accessible via symlink");
            }

            return 0;
        } else {
            $this->error("❌ Failed to create plugin symlink");

            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $this->warn("Windows tip: Run as Administrator or use manual command:");
                $winTarget = str_replace('/', '\\', $target);
                $winLink = str_replace('/', '\\', $link);
                $this->line("mklink /D \"{$winLink}\" \"{$winTarget}\"");
            }

            return 1;
        }
    }

    /**
     * Create cross-platform symlink
     */
    private function createCrossPlatformSymlink($target, $link)
    {
        // Untuk Windows
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            return $this->createWindowsSymlink($target, $link);
        }

        // Untuk Linux/Mac - langsung pakai symlink()
        return symlink($target, $link);
    }

    /**
     * Create symlink di Windows dengan multiple approaches
     */
    private function createWindowsSymlink($target, $link)
    {
        // Approach 1: Coba symlink() biasa (bisa work di Windows dengan PHP 7.2+)
        if (@symlink($target, $link)) {
            return true;
        }

        // Approach 2: Gunakan mklink via command line
        $winTarget = str_replace('/', '\\', $target);
        $winLink = str_replace('/', '\\', $link);

        $command = "mklink /D \"{$winLink}\" \"{$winTarget}\" 2>nul";
        exec($command, $output, $returnCode);

        if ($returnCode === 0) {
            return true;
        }

        // Approach 3: Gunakan junction (alternative symlink)
        $junctionCommand = "mklink /J \"{$winLink}\" \"{$winTarget}\" 2>nul";
        exec($junctionCommand, $junctionOutput, $junctionReturnCode);

        return $junctionReturnCode === 0;
    }

    /**
     * Check if path is a Windows symlink/junction
     */
    private function isWindowsSymlink($path)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
            return false;
        }

        $command = "dir \"{$path}\" 2>nul";
        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            return false;
        }

        // Check output untuk <SYMLINKD> atau <JUNCTION>
        foreach ($output as $line) {
            if (str_contains($line, '<SYMLINKD>') || str_contains($line, '<JUNCTION>')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get Windows symlink target
     */
    private function getWindowsSymlinkTarget($path)
    {
        $command = "dir \"{$path}\" 2>nul";
        exec($command, $output, $returnCode);

        foreach ($output as $line) {
            if (str_contains($line, '<SYMLINKD>') || str_contains($line, '<JUNCTION>')) {
                // Extract target from line like: "05/12/2023  10:00 AM    <SYMLINKD>     plugins [C:\web\fraktal-cms\storage\app\plugins]"
                if (preg_match('/\[(.+)\]/', $line, $matches)) {
                    return $matches[1];
                }
            }
        }

        return 'Unknown';
    }
}

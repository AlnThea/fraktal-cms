<?php

namespace App\Http\Controllers;

use App\Models\Plugin;
use App\Services\PluginService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PluginController extends Controller
{
    protected $pluginService;

    public function __construct(PluginService $pluginService)
    {
        $this->pluginService = $pluginService;
    }

    public function index(Request $request)
    {
        $perPage = $request->get('perPage', 10);
        $search = $request->get('search', '');
        $sortColumn = $request->get('sortColumn', 'created_at');
        $sortDirection = $request->get('sortDirection', 'desc');

        $plugins = Plugin::query()
            ->when($search, function($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('author', 'like', "%{$search}%");
            })
            ->orderBy($sortColumn, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        if ($request->header('X-Inertia')) {
            return Inertia::render('Plugins/Index', [
                'plugins' => $plugins,
                'filters' => [
                    'perPage' => (int) $perPage,
                    'search' => $search,
                    'sortColumn' => $sortColumn,
                    'sortDirection' => $sortDirection,
                ]
            ]);
        }

        return response()->json($plugins);
    }

    public function store(Request $request)
    {
        $request->validate([
            'plugin_file' => 'required|file|mimes:zip|max:10240' // 10MB max
        ]);

        try {
            $plugin = $this->pluginService->uploadPlugin($request->file('plugin_file'));

            return redirect()->route('plugins.index')
                ->with('success', 'Plugin ' . $plugin->name . ' berhasil diupload!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal upload plugin: ' . $e->getMessage());
        }
    }

    public function activate(Plugin $plugin)
    {
        try {
            $updatedPlugin = $this->pluginService->activatePlugin($plugin->id);

            return redirect()->back()
                ->with('success', 'Plugin ' . $updatedPlugin->name . ' berhasil diaktifkan!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal mengaktifkan plugin: ' . $e->getMessage());
        }
    }

    public function deactivate(Plugin $plugin)
    {
        try {
            $updatedPlugin = $this->pluginService->deactivatePlugin($plugin->id);

            return redirect()->back()
                ->with('success', 'Plugin ' . $updatedPlugin->name . ' berhasil dinonaktifkan!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menonaktifkan plugin: ' . $e->getMessage());
        }
    }

    public function destroy(Plugin $plugin)
    {
        try {
            $pluginName = $plugin->name;
            $this->pluginService->deletePlugin($plugin->id);

            return redirect()->route('plugins.index')
                ->with('success', 'Plugin ' . $pluginName . ' berhasil dihapus!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Gagal menghapus plugin: ' . $e->getMessage());
        }
    }

    // API endpoint untuk GrapeJS blocks
    public function getGrapeJSBlocks()
    {
        try {
            $blocks = $this->pluginService->getActiveGrapeJSBlocks();

            return response()->json([
                'success' => true,
                'blocks' => $blocks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load blocks: ' . $e->getMessage(),
                'blocks' => []
            ], 500);
        }
    }

    public function getActivePlugins()
    {
        $activePlugins = Plugin::where('is_active', true)->get();

        return $activePlugins->map(function($plugin) {
            // Generate full URL untuk plugin file
            $pluginUrl = url("storage/plugins/{$plugin->slug}/dist/t-core-blocks.umd.js");

            return [
                'id' => $plugin->id,
                'name' => $plugin->name,
                'slug' => $plugin->slug,
                'version' => $plugin->version,
                'status' => $plugin->is_active ? 'active' : 'inactive',
                'assets' => [
                    'js' => [$pluginUrl]
                ],
                'main_file' => $pluginUrl // FULL URL: http://localhost:8000/storage/plugins/t-core-blocks/dist/t-core-blocks.umd.js
            ];
        });
    }
}

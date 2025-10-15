<?php

use App\Http\Controllers\PageController;
use App\Http\Controllers\PluginController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('homepage');

// API route untuk GrapeJS blocks - bisa diakses tanpa auth
Route::get('/api/plugin/grapejs-blocks', [PluginController::class, 'getGrapeJSBlocks'])
    ->name('plugin.grapejs.blocks');

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/editor', function () {
        return Inertia::render('Post/NewPost');
    })->name('editor');

    Route::name('pages.')->prefix('pages')->group(function () {
        Route::get('/', [PageController::class, 'index'])->name('index');
        Route::get('/new-pages', [PageController::class, 'create'])->name('create');
        Route::put('/update-status-multiple', [PageController::class, 'updateMultipleStatus'])->name('update.multiple.status');
        Route::put('/{page}/status', [PageController::class, 'updateStatus'])->name('update.status');
        Route::delete('/destroy-multiple', [PageController::class, 'destroyMultiple'])->name('destroy.multiple');
        Route::post('/', [PageController::class, 'store'])->name('store');
        Route::get('/{slug}/e/{page}/edit', [PageController::class, 'edit'])->name('edit');
        Route::put('/{page}', [PageController::class, 'update'])->name('update');
        Route::delete('/{page}', [PageController::class, 'destroy'])->name('destroy');
    });

    // Plugin management routes - hanya untuk authenticated users
    Route::name('plugin.')->prefix('plugin')->group(function () {
        Route::get('/', [PluginController::class, 'index'])->name('index');
        Route::post('/', [PluginController::class, 'store'])->name('store');
        Route::put('/{plugin}/activate', [PluginController::class, 'activate'])->name('activate');
        Route::put('/{plugin}/deactivate', [PluginController::class, 'deactivate'])->name('deactivate');
        Route::delete('/{plugin}', [PluginController::class, 'destroy'])->name('destroy');
    });


});


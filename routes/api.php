<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/active-plugins', [\App\Http\Controllers\PluginController::class, 'getActivePlugins']);

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Plugin extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'version',
        'description',
        'author',
        'author_url',
        'plugin_url',
        'dependencies',
        'is_active',
        'plugin_path',
        'settings',
        'type'
    ];

    protected $casts = [
        'dependencies' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    protected static function booted()
    {
        static::creating(function ($plugin) {
            if (empty($plugin->slug)) {
                $plugin->slug = \Illuminate\Support\Str::slug($plugin->name);
            }
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
}

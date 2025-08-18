<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['title', 'slug', 'content', 'users_id', 'status', 'type_post', 'scheduled_at'];

    protected $casts = [
        'content' => 'array',
    ];

    public function author()
    {
        return $this->belongsTo(User::class,  'users_id');
    }


}

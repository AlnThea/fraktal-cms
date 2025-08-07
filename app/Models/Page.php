<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['title', 'content', 'users_id', 'status', 'type_post'];

    protected $casts = [
        'content' => 'array',
    ];

    public function author()
    {
        return $this->belongsTo(User::class,  'users_id');
    }


}

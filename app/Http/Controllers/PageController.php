<?php

// app/Http/Controllers/PageController.php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Pages/Index', [
            'pages' => Page::with('author')
                ->select('id', 'title', 'status', 'created_at', 'updated_at', 'users_id')
                ->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Pages/NewPage');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'content' => 'nullable|array',
        ]);

        if (Auth::check()) {
            $userId = Auth::user()->id;
        } else {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $pageData = $request->all();

        if (is_string($pageData['content'])) {
            $pageData['content'] = json_decode($pageData['content'], true);
        }

        // Tangani slug untuk memastikan keunikan
        $slug = $this->generateUniqueSlug($request->title, $request->slug);

        $page = Page::create([
            'title' => $pageData['title'],
            'slug' => $slug, // Menggunakan slug yang sudah dijamin unik
            'content' => $pageData['content'],
            'users_id' => $userId,
            'status' => 'draft',
            'type_post' => 'pages',
        ]);

        return response()->json(['success' => true, 'id' => $page->id]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Page $page)
    {
        return Inertia::render('Pages/Edit', [
            'page' => $page
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Page $page)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'content' => 'nullable|array',
        ]);

        $pageData = $request->all();

        if (is_string($pageData['content'])) {
            $pageData['content'] = json_decode($pageData['content'], true);
        }

        // Tangani slug untuk memastikan keunikan saat update
        $slug = $this->generateUniqueSlug($request->title, $request->slug, $page->id);

        $page->update([
            'title' => $pageData['title'],
            'slug' => $slug, // Menggunakan slug yang sudah dijamin unik
            'content' => $pageData['content'],
        ]);

        return response()->json(['success' => true, 'id' => $page->id]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page)
    {
        $page->delete();

        return redirect()->route('pages.index')->with('success', 'Page deleted!');
    }

    /**
     * Generate a unique slug for the page.
     */
    protected function generateUniqueSlug(string $title, string $baseSlug, ?int $pageId = null): string
    {
        // Gunakan base slug dari frontend, atau generate jika kosong
        $slug = $baseSlug ?: Str::slug($title, '-');

        $originalSlug = $slug;
        $count = 1;
        $query = Page::where('slug', $slug);

        // Abaikan halaman saat ini saat update
        if ($pageId) {
            $query->where('id', '!=', $pageId);
        }

        while ($query->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $query = Page::where('slug', $slug);

            if ($pageId) {
                $query->where('id', '!=', $pageId);
            }
            $count++;
        }

        return $slug;
    }
}

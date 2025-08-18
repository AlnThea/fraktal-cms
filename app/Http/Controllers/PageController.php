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
    public function index(Request $request)
    {
        $perPage = $request->input('perPage', 10);
        $search = $request->input('search');
        $sortColumn = $request->input('sortColumn', 'created_at');
        $sortDirection = $request->input('sortDirection', 'desc');

        $query = Page::with('author');

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        if ($sortColumn === 'author') {
            $query->join('users', 'pages.users_id', '=', 'users.id')
                ->select('pages.*')
                ->orderBy('users.name', $sortDirection);
        } else {
            $query->orderBy($sortColumn, $sortDirection);
        }

        $pages = $query->paginate($perPage);

        return Inertia::render('Pages/Index', [
            'pages' => $pages,
            'filters' => $request->all(['perPage', 'search', 'sortColumn', 'sortDirection']),
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
            'status' => 'required|in:draft,published,scheduled',
            'scheduled_at' => 'nullable|date',
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

        $slug = $this->generateUniqueSlug($request->title, $request->slug);

        $page = Page::create([
            'title' => $pageData['title'],
            'slug' => $slug,
            'content' => $pageData['content'],
            'users_id' => $userId,
            'status' => $pageData['status'],
            'scheduled_at' => $pageData['scheduled_at'] ?? null,
            'type_post' => 'pages',
        ]);

        return response()->json(['success' => true, 'id' => $page->id]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $slug, Page $page)
    {
        if ($page->slug !== $slug) {
            return redirect()->route('pages.edit', ['slug' => $page->slug, 'page' => $page->id]);
        }

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
            'status' => 'required|in:draft,published,scheduled',
            'scheduled_at' => 'nullable|date',
        ]);

        $pageData = $request->all();

        if (is_string($pageData['content'])) {
            $pageData['content'] = json_decode($pageData['content'], true);
        }

        $slug = $this->generateUniqueSlug($request->title, $request->slug, $page->id);

        $page->update([
            'title' => $pageData['title'],
            'slug' => $slug,
            'content' => $pageData['content'],
            'status' => $pageData['status'],
            'scheduled_at' => $pageData['scheduled_at'] ?? null,
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
        $slug = $baseSlug ?: Str::slug($title, '-');
        $originalSlug = $slug;
        $count = 1;
        $query = Page::where('slug', $slug);

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

    public function destroyMultiple(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ]);

        Page::whereIn('id', $request->input('ids'))->delete();

        return redirect()->route('pages.index')->with('success', 'Pages deleted!');
    }

    public function updateStatus(Request $request, Page $page)
    {
        $request->validate([
            'status' => 'required|in:draft,published,scheduled',
            'scheduled_at' => 'nullable|date', // <--- Tambahkan validasi ini
        ]);

        $page->update([
            'status' => $request->status,
            'scheduled_at' => $request->scheduled_at // <--- Perbarui kolom ini
        ]);

        return redirect()->back()->with('success', 'Status updated successfully!');
    }

    public function updateMultipleStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'status' => 'required|in:draft,published,scheduled',
        ]);

        Page::whereIn('id', $request->ids)->update([
            'status' => $request->status
        ]);

        return redirect()->back()->with('success', 'Selected pages status updated!');
    }
}

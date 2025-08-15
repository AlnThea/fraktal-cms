<?php

// app/Http/Controllers/PageController.php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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

        $page = Page::create([
            'title' => $pageData['title'],
            'content' => $pageData['content'],
            'users_id' => $userId,
            'status' => 'draft',
            'type_post' => 'pages',
        ]);

        // Mengembalikan respons JSON dengan ID halaman yang baru dibuat
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
            'content' => 'nullable|array',
        ]);

        $pageData = $request->all();

        if (is_string($pageData['content'])) {
            $pageData['content'] = json_decode($pageData['content'], true);
        }

        $page->update([
            'title' => $pageData['title'],
            'content' => $pageData['content'],
        ]);

        // Mengembalikan respons JSON untuk memberi tahu frontend bahwa update berhasil
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
}

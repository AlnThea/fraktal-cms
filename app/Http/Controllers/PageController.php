<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Pages/Index', [
            'pages' => Page::latest()->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Pages/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        \Log::info('📥 Request masuk ke store()', $request->all());

        $request->validate([
            'title' => 'required|string',
            'content' => 'nullable|array',
        ]);

        $page = Page::create([
            'title' => $request->title,
            'content' => $request->content,
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
            'title' => 'required|string',
            'content' => 'nullable|array',
        ]);

        $page->update(attributes: [
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return redirect()->route('pages.index')->with('success', 'Page updated!');
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

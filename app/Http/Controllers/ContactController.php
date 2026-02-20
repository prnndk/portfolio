<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function index()
    {
        return \Inertia\Inertia::render('Admin/Contacts/Index', [
            'contacts' => Contact::latest()->paginate(10),
        ]);
    }

    public function show(Contact $contact)
    {
        if ($contact->status === 'new') {
            $contact->update(['status' => 'read']);
        }

        return \Inertia\Inertia::render('Admin/Contacts/Show', [
            'contact' => $contact,
        ]);
    }

    public function store(Request $request)
    {
        // Honeypot check - if 'website' field is filled, it's a bot
        if ($request->filled('website')) {
            Log::warning('Contact form honeypot triggered', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            // Return success to not alert the bot, but don't save
            return back()->with('success', 'Thank you for your message!');
        }

        // Timestamp validation - form submitted too quickly (less than 3 seconds) is likely a bot
        $formTimestamp = $request->input('_timestamp');
        if ($formTimestamp) {
            $elapsedSeconds = time() - (int) $formTimestamp;
            if ($elapsedSeconds < 3) {
                Log::warning('Contact form submitted too quickly', [
                    'ip' => $request->ip(),
                    'elapsed_seconds' => $elapsedSeconds,
                ]);
                return back()->with('success', 'Thank you for your message!');
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        // Additional spam checks
        $message = strtolower($validated['message']);
        $name = strtolower($validated['name']);

        // Check for common spam patterns
        $spamKeywords = ['viagra', 'casino', 'lottery', 'bitcoin', 'crypto', 'investment opportunity', 'earn money', 'click here', 'free money'];
        foreach ($spamKeywords as $keyword) {
            if (str_contains($message, $keyword) || str_contains($name, $keyword)) {
                Log::warning('Contact form spam keyword detected', [
                    'ip' => $request->ip(),
                    'keyword' => $keyword,
                ]);
                return back()->with('success', 'Thank you for your message!');
            }
        }

        // Check for too many URLs in message (likely spam)
        $urlCount = preg_match_all('/https?:\/\/[^\s]+/', $validated['message']);
        if ($urlCount > 3) {
            Log::warning('Contact form too many URLs', [
                'ip' => $request->ip(),
                'url_count' => $urlCount,
            ]);
            return back()->with('success', 'Thank you for your message!');
        }

        Contact::create($validated);

        return back()->with('success', 'Thank you for your message! I will get back to you soon.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return back()->with('success', 'Contact deleted successfully.');
    }
}

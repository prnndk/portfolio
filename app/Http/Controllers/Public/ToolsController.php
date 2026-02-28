<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ToolsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Public/Tools/Index');
    }

    public function imageCompress(): Response
    {
        return Inertia::render('Public/Tools/ImageCompress');
    }

    public function jpgToPdf(): Response
    {
        return Inertia::render('Public/Tools/JpgToPdf');
    }

    public function pdfMerge(): Response
    {
        return Inertia::render('Public/Tools/PdfMerge');
    }

    public function pdfSplit(): Response
    {
        return Inertia::render('Public/Tools/PdfSplit');
    }

    public function pdfToImages(): Response
    {
        return Inertia::render('Public/Tools/PdfToImages');
    }

    public function pdfCompress(): Response
    {
        return Inertia::render('Public/Tools/PdfCompress');
    }

    public function pdfRotate(): Response
    {
        return Inertia::render('Public/Tools/PdfRotate');
    }
}

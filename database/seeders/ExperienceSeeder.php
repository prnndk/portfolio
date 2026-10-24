<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Journey;
use Illuminate\Database\Seeder;

/**
 * Real experience taken from the CV. Replaces the DemoContentSeeder placeholders.
 *
 *   php artisan db:seed --class=ExperienceSeeder
 *
 * Safe to re-run (rows are matched by title). Row order = display order.
 * Only `journeys` get education; `activities` (home page + /activities) skip it.
 */
class ExperienceSeeder extends Seeder
{
    /** Placeholder / superseded rows removed on every run. */
    private const STALE = [
        'Software Engineer',
        'Backend Developer Intern',
        'B.Sc. Informatics',
        'National Hackathon Finalist',
        'Teaching Assistant, Web Programming',
        'Pelatihan BPJS Kesehatan',
    ];

    // [title, subtitle, organization, type, description, skills, start, end]
    private const ENTRIES = [
        ['Programmer / IT Engineer (Intern)', 'Internship', 'Badan Siber dan Sandi Negara (BSSN)', 'work',
            'Direktorat Keamanan Siber dan Sandi TIK, Media, dan Transportasi. Technical assistance on the Cybersecurity Maturity Index (IKAS) for ICT, media and transportation stakeholders, covering the assessment process and data compilation. Design and develop features for the directorate\'s internal web application.',
            ['Cybersecurity', 'IKAS', 'Web Development'], '2026-09-01', null],
        ['Fullstack Developer', 'SENOPATI ITS', 'Institut Teknologi Sepuluh Nopember', 'work',
            'Sepuluh Nopember Personal Assistant with Intelligence. Build, deploy and maintain AI applications end to end: frontend, backend, model integration and cloud servers. Run an on-premise Proxmox system hosting hundreds of VMs. Shipped a BPJS auto-claim module, an SPMB admissions chatbot, document-based RAG tools, an automated paper grading engine and a practicum platform with double scoring.',
            ['LLM', 'RAG', 'Proxmox', 'Docker', 'Golang', 'Laravel'], '2025-01-01', null],
        ['Penetration Testing Expert', 'Certificate of Appreciation', 'Dinas Kependudukan dan Pencatatan Sipil Kota Blitar', 'work',
            'Ran a penetration test on the SIPAK website (Sistem Informasi Pelayanan Adminduk) to improve its cybersecurity.',
            ['Penetration Testing', 'Web Security'], '2026-04-30', '2026-05-05'],
        ['Fullstack Developer and DevOps', null, 'Explora Nusantara', 'work',
            'Built a Laravel marketplace for SME import and export with seller and buyer transactions across 3 user roles. Integrated Zoom meetings and a per-transaction chat between sellers and buyers.',
            ['Laravel', 'DevOps', 'Zoom API'], '2025-02-01', '2025-12-01'],
        ['Backend Developer (Intern)', 'Internship', 'Bank Syariah Indonesia Region Office VIII Surabaya', 'work',
            'Built the backend of a dashboard information system for Region VIII Surabaya using Laravel, plus a service that parses Excel files and loads the data into a database per stakeholder requests.',
            ['Laravel', 'MySQL', 'Excel Parsing'], '2025-04-01', '2025-07-01'],
        ['Fullstack Developer, Autograding System for CPNS', null, 'East Java Provincial BKD', 'work',
            'Built an autograding system for the East Java CPNS selection: authentication, submission scoring, live score and submission management. Deployed the backend, frontend and cloud server.',
            ['Fullstack', 'Deployment'], '2024-08-01', '2024-12-01'],
        ['Assistant Instructor, AI Training for BPJS', 'Training', 'BPJS Kesehatan', 'work',
            'Pre-Beginner AI (Oct 2025), AI Beginner in Bogor (Jan 2026) and a 3-day Antigravity AI for Large-Scale Engineering program in Jakarta (Feb 2026): monolith-to-microservice decomposition, AI-assisted scaffolding in Go and Java, Elasticsearch benchmarking, SQL optimization and AI agents for automated audits.',
            ['Teaching', 'Machine Learning', 'Golang', 'Microservices'], '2025-10-01', '2026-02-01'],
        ['Assistant Instructor, East Java Provincial Government', 'Training', 'BKD and Diskominfo Provinsi Jawa Timur', 'work',
            'n8n workflow automation (4 days, Nov 2025) including a RAG chatbot, and AI for Smart ASN (Dec 2025): data security and AI ethics, AI-assisted coding, generated documentation and SQL.',
            ['Teaching', 'n8n', 'RAG', 'AI Ethics'], '2025-11-01', '2025-12-01'],
        ['Head Laboratory Administrator (Batch 2022)', 'Algorithm and Programming Laboratory', 'Institut Teknologi Sepuluh Nopember', 'work',
            'Ran lab operations and administration as the main contact between faculty and students. Built software and AI applications for faculty research, built and ran an on-premise Proxmox system hosting hundreds of VMs, and taught lab practicums and corporate trainings.',
            ['Leadership', 'Proxmox', 'Teaching'], '2024-06-01', '2026-07-01'],
        ['Head of Community Outreach Bureau', 'Himpunan Mahasiswa Teknik Computer-Informatika (HMTC) ITS', 'SSD HMTC ITS', 'work',
            'Led the bureau and ran two programs, Pengabdian Masyarakat (HMTC Goes to School) and Rumah Pengabdian, with BEM-F FTEIC.',
            ['Leadership', 'Community'], '2025-02-01', '2025-11-01'],
        ['Backend Developer, ITS Student Events', null, 'ITS Student Events and Organizations', 'work',
            'UKM Expo ITS 2024 (Lead Backend): concert ticketing with Midtrans and UKM registration in Golang (Gin, GORM). Schematics ITS 2024: registration with payment gateway using Express and TypeScript. SRE Chapter ITS: maintained a Golang backend.',
            ['Golang', 'Gin', 'GORM', 'Express.js', 'TypeScript', 'Midtrans'], '2024-03-01', '2025-06-01'],
        ['Certificate of Appreciation, SIPAK Penetration Test', 'Achievement', 'Dinas Kependudukan dan Pencatatan Sipil Kota Blitar', 'achievement',
            'Awarded in May 2026 as expert for the SIPAK website penetration test.',
            ['Penetration Testing'], '2026-05-01', null],
        ['Finalist, GEMASTIK Data Mining Competition 2025', 'Achievement', 'GEMASTIK', 'achievement',
            'Built an image classification model for Hanacaraka script in a 5-hour competition. The team ranked 7th of 20 by accuracy.',
            ['Python', 'PyTorch', 'Image Classification'], '2025-10-01', null],
        ['Informatics Engineering', 'Bachelor, GPA 3.68', 'Institut Teknologi Sepuluh Nopember (ITS)', 'education',
            'Thesis: Time Series-Based Model Development for Forecasting Number of Optical Fiber Network Disruptions. Built a predictive maintenance pipeline for 12 WITELs and compared regression with ordinal classification; AutoARIMA and NHPP beat the ML models in 7 of 12 regions.',
            ['Time Series', 'Machine Learning', 'Python'], '2022-08-01', '2026-07-01'],
        ['Senior High School 1 Blitar', 'High School', 'SMAN 1 Blitar', 'education', null, null, '2019-07-01', '2022-06-01'],
    ];

    public function run(): void
    {
        Journey::whereIn('title', self::STALE)->delete();
        Activity::whereIn('title', self::STALE)->delete();

        foreach (self::ENTRIES as $i => [$title, $subtitle, $org, $type, $description, $skills, $start, $end]) {
            Journey::updateOrCreate(['title' => $title], [
                'subtitle' => $subtitle,
                'organization' => $org,
                'type' => $type,
                'description' => $description,
                'skills' => $skills,
                'start_date' => $start,
                'end_date' => $end,
                'sort_order' => $i,
                'is_active' => true,
            ]);

            if ($type === 'education') {
                continue;
            }

            Activity::updateOrCreate(['title' => $title], [
                'role' => $title,
                'organization' => $org,
                'description' => $description,
                'start_date' => $start,
                'end_date' => $end,
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }
    }
}

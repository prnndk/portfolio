<?php

namespace App\Console\Commands;

use App\Models\TechStack;
use Illuminate\Console\Command;

class CacheTechIcons extends Command
{
    protected $signature = 'tech-icons:cache';

    protected $description = 'Download external tech stack icon URLs to local storage';

    public function handle(): int
    {
        $failed = 0;

        TechStack::whereNotNull('icon_url')->get()->each(function (TechStack $stack) use (&$failed) {
            if ($stack->cacheRemoteIcon()) {
                $this->info("cached  {$stack->name}");
            } else {
                $failed++;
                $this->warn("failed  {$stack->name}  {$stack->icon_url}");
            }
        });

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}

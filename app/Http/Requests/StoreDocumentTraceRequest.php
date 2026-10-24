<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentTraceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'website' => ['prohibited'], // honeypot, real users never see this field
            'rights' => ['accepted'],
            'kind' => ['required', 'in:pdf,image'],
            'mode' => ['required', 'in:visible,hidden,both'],
            'recipient_name' => ['required', 'string', 'max:120'],
            'issuer_name' => ['nullable', 'string', 'max:120'],
            'page_count' => ['required', 'integer', 'min:1', 'max:500'],
            'settings' => ['nullable', 'array'],
            'details_ciphertext' => ['nullable', 'string', 'max:12000', 'required_with:details_iv'],
            'details_iv' => ['nullable', 'string', 'size:16', 'required_with:details_ciphertext'],
            'details_salt' => ['required', 'string', 'size:24'],
            'details_kdf' => ['required', 'array'],
            'details_kdf.alg' => ['required', 'in:PBKDF2-SHA256'],
            'details_kdf.iter' => ['required', 'integer', 'min:100000', 'max:2000000'],
            'auth_key' => ['required', 'string', 'size:44'],
        ];
    }

    protected function passedValidation(): void
    {
        if (strlen(json_encode($this->input('settings', []))) > 16384) {
            abort(422, 'Settings are too large.');
        }
    }
}

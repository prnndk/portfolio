# Document Protection Tools: implementation plan

Scope: three new tools in `/tools`, all built on the same trace layer:

1. **Watermark & Trace**: watermark PDFs and images, visible and/or hidden, with a different watermark per page and a copyright footer naming who the data is for.
2. **Signature**: place a PNG signature anywhere on a PDF, plus a cryptographic integrity seal.
3. **Verify**: upload a PDF or image and learn whether it is authentic, who issued it, for whom (admin only), which page it is, and whether it was altered.

Existing principle kept: **the file never leaves the browser.** All PDF and image processing runs on the client (`pdf-lib`, `pdfjs-dist`, canvas). The server stores only hashes, codes and metadata, so it never stores the content of sensitive documents.

---

## 1. Decisions (confirmed)

| # | Decision |
|---|---|
| D1 | **Both public visitors and the admin can create traceable documents.** The creator sets their own **passphrase** to unlock the details (purpose, notes, original file name, issuer contact). Details are encrypted **in the browser** with a key derived from the passphrase, so the server stores only ciphertext and cannot read them. Logged-in admins also get their own trace list in the admin panel. |
| D2 | **Not legally binding.** Ed25519 integrity seal + QR verify is enough. No PAdES/`.p12` and no PSrE. |
| D3 | Verify shows the **recipient name only; email is never collected or shown.** Other details require the passphrase. |
| D4 | **Records are kept permanently and stay verifiable for good.** No expiry and no automatic deletion. A trace can only be revoked manually by its creator (passphrase) or by the admin, and stays in the registry marked `revoked`. |

---

## 2. Trace layers (defence in depth)

No single invisible watermark survives everything. So each document gets several layers; the verifier tries them from strongest to weakest.

| Layer | Visible? | PDF | Image | Survives | Lost by |
|---|---|---|---|---|---|
| L1 Visible watermark (tiled text, per page) | yes | vector overlay, or **flatten** (burned into raster) | burned into pixels | everything except cropping/retouching | Overlay mode: deleted in a PDF editor. Flatten mode: only by cropping |
| L2 Copyright footer + short code | yes | per page | bottom strip | same as L1 | cropping |
| L3 Per-page HMAC code | yes (small) + hidden | footer + invisible text | footer + L6 | pages leaked one at a time | cropping/re-typing |
| L4 Metadata | no | Info dict + XMP (`gading:traceId`) | PNG `tEXt` / JPEG `COM` | direct sharing of the original file | re-save, WhatsApp, screenshot |
| L5 Invisible text layer | no | text with render mode 3 (invisible), copyable | – | copy-paste, PDF-to-text | flatten, print to image |
| L6 Invisible DCT watermark | no | flatten mode only | yes | JPEG recompression (q ≥ ~70), light brightness/contrast changes | heavy resize, rotation, arbitrary crops, screen photos |
| L7 SHA-256 + Ed25519 seal | no | yes | yes | identifies the *exact* file | any modification (and that is the point: it detects tampering) |
| L8 Perceptual hash (pHash) per page | no | yes | yes | recompression, light resize, re-save | crops, heavy edits |
| L9 QR verify (`/v/{code}`) | yes (optional) | yes | yes | printing, screen photos | cropping |

"No visible watermark, embedded in the hash only" = the **hidden** mode: L1/L2/L9 off; L3 (hidden part), L4, L5, L6, L7 and L8 on.

Honest limits to show in the UI: someone who retypes the content or photographs the screen and then crops defeats every layer except perhaps L1 and L8. The watermark is a **deterrent and a tracing aid**, not a leak preventer.

---

## 3. Data model (backend)

Migration `document_traces`:

| Column | Type | Notes |
|---|---|---|
| `id` | ulid PK | |
| `code` | char(10) unique | short base32 (50 bit, random, **not** derived from personal data), printed on the document |
| `user_id` | FK users **nullable** | null = created by a public visitor |
| `kind` | enum `pdf`,`image` | |
| `mode` | enum `visible`,`hidden`,`both` | |
| `recipient_name` | varchar(120), `encrypted` cast | the only personal data the server can read (shown on Verify). No email column |
| `issuer_name` | varchar(120) nullable | name shown as the issuer (optional for the public) |
| `details_ciphertext` | text nullable | AES-256-GCM of the JSON `{purpose, note, original_filename, issuer_contact}`, encrypted in the browser |
| `details_iv` | char(24) | AES-GCM nonce (base64) |
| `details_salt` | char(24) | PBKDF2 salt (base64) |
| `details_kdf` | json | `{alg: "PBKDF2-SHA256", iter: 600000}`, so the parameters can be raised later without breaking old records |
| `auth_hash` | varchar(255) | `password_hash(authKey)`; see section 3a |
| `page_count` | smallint | |
| `sha256` | char(64) nullable, index | hash of the final file, filled at finalize |
| `seal` | text nullable | base64 Ed25519 signature over the canonical payload |
| `key_version` | tinyint | which HMAC/seal key generation was used (records are permanent, so old keys must stay verifiable) |
| `settings` | json | watermark template, font, angle, spacing and per-page rules (no document content) |
| `issued_at`, `revoked_at` | timestamps | no `expires_at`: records are permanent |

Migration `document_trace_pages`: `trace_id`, `page_no`, `page_code` char(8) index, `phash` char(16) nullable index.

Migration `document_verifications` (audit of who verified what): `trace_id` nullable, `result` enum, `matched_by` (sha256/page_code/metadata/dct/phash), `ip_hash` (salted SHA-256, not the raw IP), `created_at`.

Keys (`.env`, generated by `php artisan doc-trace:keygen`):
- `DOC_TRACE_HMAC_KEY`: secret for page codes.
- `DOC_SEAL_SECRET_KEY` / `DOC_SEAL_PUBLIC_KEY`: Ed25519 pair (`sodium_crypto_sign_keypair`). The public key is published on the Verify page so anyone can check the seal independently.

Code formulas:
- `page_code = base32(HMAC-SHA256(DOC_TRACE_HMAC_KEY, "{code}:{page_no}"))[0..8]`. This is the "hashing-level watermark": every page gets a different code, cannot be forged without the key, and the server can tie it back to the document and page.
- `seal = Ed25519_sign(canonical_json({code, sha256, page_count, issued_at, issuer}))`.

Note: the SHA-256 of the final file **cannot** be embedded inside the file itself (changing the file changes the hash). That is why the hash and the seal live in the registry, while the document carries `code` + QR.

### 3a. Passphrase for the details (zero-knowledge)

In the browser (WebCrypto, no dependency):

```text
master  = PBKDF2-SHA256(passphrase, salt, 600k iter, 512 bit)
encKey  = master[0..32]   → AES-256-GCM encrypts the details JSON (never sent)
authKey = master[32..64]  → sent to the server at create and unlock time
```

- The server stores `password_hash(authKey)`, **not** the passphrase or `encKey`.
- Unlock: `POST /tools/verify/{code}/unlock {authKey}`. The server checks `password_verify` (throttled, 5 attempts/minute per code+IP) and only then returns `ciphertext + iv`. The browser decrypts with `encKey`.
- Why split the key: if the ciphertext were returned to anyone holding the code, an attacker could brute-force the passphrase offline. With the `authKey` gate, guesses must go through the server, which throttles them.
- Minimum passphrase of 10 characters, with a strength meter. **A lost passphrase cannot be recovered**, by design; the UI must state this clearly before saving.
- Revoke by the creator: `POST /tools/trace/{code}/revoke {authKey}`.
- Admin: traces created while logged in also appear in `/admin/document-traces`, but their details are still locked by the passphrase (consistent with the public flow, and the server never holds plaintext details).

---

## 4. Endpoints

All placed **above** the catch-all `/{code}` in `routes/web.php`.

| Method | Route | Middleware | Purpose |
|---|---|---|---|
| POST | `/tools/trace` | throttle:10,60 per IP (admin: 60,1) | Create a draft trace `{recipient_name, issuer_name?, page_count, mode, settings, details_ciphertext, iv, salt, kdf, authKey}` → `{code, page_codes[], verify_url, finalize_token}` |
| POST | `/tools/trace/{trace:code}/finalize` | `finalize_token` (one-time, 30 minutes) | Send `sha256`, `phashes[]` → server signs the seal → `{seal}`. Drafts never finalized are deleted after 24 hours (the only automatic deletion; they were never valid documents) |
| POST | `/tools/trace/{trace:code}/revoke` | throttle:5,1 | Revoke with `authKey` |
| POST | `/tools/verify` | throttle:20,1 | Send `{sha256?, code?, page_codes[]?, phashes[]?}` (never the file) → result (recipient name, without details) |
| POST | `/tools/verify/{trace:code}/unlock` | throttle:5,1 per code+IP | `{authKey}` → `{ciphertext, iv}` |
| GET | `/v/{code}` | throttle:60,1 | Public "certificate" page (QR target) |
| GET | `/tools/watermark`, `/tools/image-watermark`, `/tools/pdf-sign`, `/tools/verify` | – | Inertia pages |
| resource | `/admin/document-traces` (index, show, destroy) + `POST {id}/revoke` | auth, verified | Registry and verification log |

Verify result: `authentic` (sha256 matches and the seal is valid) · `modified` (no hash match, but a code/page code/DCT/pHash points to a trace) · `revoked` · `unknown`.

Abuse controls for public creation (D1): IP throttling, a honeypot field, length limits (name ≤ 120 characters, ciphertext ≤ 8 KB, `settings` ≤ 16 KB, `page_count` ≤ 500), and a visible "Create traceable document" button only after the user ticks "I have the right to share this document".

New backend files:
- `app/Models/DocumentTrace.php`, `DocumentTracePage.php`, `DocumentVerification.php`
- `app/Services/DocumentTrace/TraceService.php` (codes, HMAC, seal, lookup in priority order)
- `app/Http/Controllers/Public/DocumentTraceController.php` (store, finalize, verify, certificate)
- `app/Http/Controllers/Admin/DocumentTraceController.php`
- `app/Console/Commands/DocTraceKeygen.php` (adds a new key generation without deleting the old one), plus a daily prune of unfinalized drafts in `routes/console.php`
- `ext-sodium` added to `composer.json` `require`; check that the Docker image has it (official PHP images bundle it).

---

## 5. Frontend: shared library `resources/js/lib/doc-trace/`

| File | Contents |
|---|---|
| `hash.ts` | `sha256(bytes)` via `crypto.subtle`; `phash(imageData)` (32×32 DCT, 64 bit; about 40 lines, no dependency) |
| `template.ts` | Watermark template variables: `{recipient} {issuer} {date} {page} {pages} {code} {pageCode}` plus per-page rules (`"1-3": "CONFIDENTIAL"`, `"4": "DRAFT"`, `default`). `{purpose}` is not included because purpose is a passphrase-locked detail; type it as plain text if you want it printed |
| `fonts.ts` | Watermark font list (see section 5a); lazy-loads the TTF only when that font is chosen |
| `passphrase.ts` | PBKDF2 → `encKey`/`authKey`, AES-GCM encrypt/decrypt (WebCrypto) |
| `pdf-watermark.ts` | `applyPdfWatermark(file, opts)`: tiled/diagonal/center/corner text (opacity, angle, size, colour), footer, invisible text (L5), metadata (L4). `flatten` mode: render the page with pdfjs → canvas → watermark + DCT → embed as an image in a new PDF |
| `image-watermark.ts` | Canvas: visible watermark, footer strip, DCT, PNG `tEXt` / JPEG `COM` chunk |
| `dct-watermark.ts` | Embed/extract the payload in Y (luma) 8×8 blocks: mid-frequency coefficient pairs (3,4)/(4,3), payload 50-bit code + CRC-16, repeated across all blocks and decoded by majority vote. Runs in a Web Worker. Pure functions over `Float32Array`, so they can be tested in Node |
| `signature.ts` | `placeSignatures(pdf, placements[])` via `embedPng` + `drawImage`; `removeBackground(png)` (white threshold → transparent) for photographed signatures |
| `qr.ts` | QR for the verify URL. **New dependency: `qrcode`** (QR generation is not worth writing by hand) |
| `verify.ts` | Extract every layer from an uploaded file → payload for `POST /tools/verify` |

Fixed order when building a document (the seal must come last):
`watermark per page → signature PNG → footer + QR → metadata + invisible text → (flatten + DCT) → save → sha256 + phash → finalize → download`

Bugs to watch for in coordinates: PDF has its origin at the bottom left, pages may have `/Rotate` 90/180/270, and the CropBox may differ from the MediaBox. Every placement (watermark, footer, signature) must convert preview pixels → PDF points using the page's CropBox and rotation.

### 5a. Watermark settings

Every setting can be global or overridden per page or page range.

| Setting | Options |
|---|---|
| Text | free text, multi-line, plus the template variables above. Several text lines can be stacked |
| Font | **Standard** (no download, built into pdf-lib): Helvetica, Helvetica Bold, Times, Times Bold Italic, Courier, Courier Bold. **Custom**: Inter, Bricolage Grotesque, JetBrains Mono (the site fonts) + a "Upload TTF/OTF" option. Custom fonts are embedded via `@pdf-lib/fontkit` (**new dependency**) and subset, so only the glyphs used are added to the file |
| Size | 8–200 pt, or "auto" (fits the page width) |
| Angle | slider −90° to 90° + presets 0°, 30°, 45°, −45°, 90° |
| Spacing | horizontal and vertical gap between repetitions (0.5×–5× the text width/height), with "tight / normal / loose" presets. Optional row offset (staggered brick pattern) |
| Layout | tile over the whole page, single at center, top/bottom/corners, custom (drag on the preview) |
| Style | colour, opacity 5–100%, outline/stroke, blend (normal/multiply) |
| Footer | separate font/size/colour, left/center/right alignment, auto margin |

Images use the same settings on canvas (the selected font is loaded via the `FontFace` API so the preview matches the result).

The preview renders page 1 plus the page currently selected; changing a setting redraws only that page (debounced at 150 ms).

pdf-lib's standard fonts support WinAnsi only (enough for Indonesian). Non-Latin characters require a custom font; the UI warns when the text contains characters the chosen font cannot encode.

---

## 6. UI pages

Follow the existing tools pattern (`pages/Public/Tools/*.tsx`, Signal style, `PageHeader`).

**`/tools/watermark`: Protect PDF (wizard)**
1. Upload PDF → thumbnails (`getPdfPages`).
2. Mode: *Visible* / *Hidden (hash only)* / *Both*; option **Flatten** ("cannot be removed, text not selectable, larger file").
3. Watermark: template + per-page rules, live preview per page, style (opacity, angle, tile/center).
4. Footer: default `© {year} Arya Gading Prinandika · Provided only to {recipient} for {purpose} · {date} · ID {code}-{pageCode} · Do not distribute.` (editable).
5. Signature (optional): jump into the same signature step as `/tools/pdf-sign`.
6. Trace (optional, for everyone): recipient name, issuer name, details (purpose/notes) + **passphrase** (twice, strength meter, "a lost passphrase cannot be recovered" warning). Without this step the tool is a plain watermarker with no registry.
7. Generate → download, plus a summary (code, verify link).

**`/tools/image-watermark`**: same flow for JPG/PNG/HEIC (convert HEIC first with `heic2any`, which is already installed), batch processing with one code per file.

**`/tools/pdf-sign`**
- Upload a signature PNG (or a photo → remove background), or draw one on a canvas pad.
- Render the page with pdfjs; drag and resize the signature with pointer events (no new library); several placements; "apply to all pages / selected pages"; initials on every page.
- Optional: integrity seal (through the same trace step, passphrase included) + QR "Verify document".

**`/tools/verify`**
- Drop a PDF or image → client-side extraction (hash, metadata, invisible text, page codes, DCT, pHash) → result card: status, issue date, issuer, recipient name, pages, page matched, seal valid, `matched_by`, a warning if the file was modified. No email.
- "Open details" button → passphrase field → details decrypted in the browser (purpose, notes, original file name, issuer contact).
- A manual field for typing a code or page code (for printed or photographed documents).
- The Ed25519 public key is shown for independent verification.

**`/v/{code}`**: certificate page from the QR: status plus non-sensitive metadata.

**Admin `/admin/document-traces`**: list of all traces (recipient, date, status, public/admin), detail (pages + codes, verification log; details unlock with the passphrase), revoke. No delete button (D4); hard deletion only via an artisan command, for legal requests.

Add the new tools to `pages/Public/Tools/Index.tsx` and the nav menu.

---

## 7. Phases

| Phase | Work | Output |
|---|---|---|
| 0 | Confirm D1–D4 | – |
| 1 | Backend: migrations, models, `TraceService`, keygen, trace/finalize/revoke/verify/unlock endpoints, abuse controls, Pest tests | API ready |
| 2 | `lib/doc-trace`: hash, passphrase, template, fonts, pdf-watermark (overlay + footer + metadata + invisible text), qr | core library |
| 3 | `/tools/watermark` page (text, font, angle, spacing, per-page rules, preview) + trace step | first tool live |
| 4 | `/tools/pdf-sign` + signature step in the wizard | signature PNG |
| 5 | `dct-watermark` (worker) + `image-watermark` + flatten mode for PDF | invisible layer |
| 6 | `/tools/verify` + unlock details + `/v/{code}` | verification |
| 7 | Admin registry + verification log + draft prune | management |
| 8 | QA: `npm run types`, `npm run lint`, `npm run build`, `composer test`, manual check (desktop + phone, light + dark) | ready to merge |

---

## 8. Tests

- **Pest (backend)**: deterministic page codes; the same code cannot be created twice; a valid seal verifies and fails if one byte of `sha256` changes; a seal made with an old `key_version` still verifies after a new key is generated; verify priority (sha256 > page_code > code > phash); revoked; the verify response never contains ciphertext or email; unlock with a wrong `authKey` → 403, and is throttled after 5 attempts; finalize without a valid token → 403; guests can create (D1), but the honeypot and size limits reject abuse.
- **JS self-check** (one `assert`-based file, run with `npx tsx`): DCT embed → simulated JPEG quantisation q=75 → extract returns the same payload; pHash distance is small for a lightly recompressed image; template rules produce the right text for each page; passphrase → encrypt → decrypt round-trips, and a wrong passphrase fails.
- **Manual**: a watermarked PDF opened in Acrobat and Chrome; overlay mode removable in an editor (expected) versus flatten mode not; an image sent through WhatsApp, then verified (expect the DCT/pHash layer to still identify it).

---

## 9. Privacy and security

- Document content never goes to the server; only hashes, codes, the recipient name and the passphrase-encrypted details.
- The recipient name is the only personal data the server can read: `encrypted` cast with `APP_KEY` at rest, shown on Verify (D3). No email is collected. The other details are zero-knowledge (section 3a).
- **Records are permanent (D4), so key loss is permanent too.** `APP_KEY`, `DOC_TRACE_HMAC_KEY` and every `DOC_SEAL_*` generation must be backed up somewhere other than the server. Losing them = recipient names unreadable / page codes and seals unverifiable for every old document.
- Key rotation adds a new generation (`key_version`); old keys are never deleted, only stop being used to sign.
- Those keys go only in `.env` and the deployment secrets, never in git.
- The verify endpoint is throttled, returns no ciphertext or email, and logs IPs as salted hashes.
- Because the public can create records (D1), add a short notice on the tool page: what is stored (recipient name, hashes, encrypted details), that it is stored permanently, and how to ask for deletion (contact page → admin runs the hard-delete command).
- CSP: the PDF/DCT workers need `worker-src 'self' blob:`; check the current nginx config.

---

## 10. Implementation status

All phases in section 7 are built on branch `feat/redesign-signal`. Differences from the plan above:

| Plan | As built |
|---|---|
| XMP metadata | PDF **Info dictionary** key `GadingTrace` (read back through pdf.js). Pictures: PNG `tEXt` chunk / JPEG comment. XMP was dropped: same purpose, far more code |
| DCT worker | Runs on the main thread. A 12 MP photo takes a couple of seconds. Move to a Web Worker if that becomes a complaint |
| Site fonts for the PDF watermark | Inter Bold (`/fonts`), Bricolage Grotesque and JetBrains Mono (`@fontsource`, bundled and served from the same origin because the CSP allows no other `connect-src`), plus uploaded TTF/OTF, all embedded as subsets via `@pdf-lib/fontkit` |
| Verify statuses | Added `registered`: a lone code only proves a record exists. A code found inside an uploaded file that fails the hash check is `modified` |
| `kdf.salt` | Returned with the verify result (not secret) so the browser can derive the keys before asking for the ciphertext |
| Unregistered documents | Template parts whose variables are empty (`{recipient}`, `{code}`...) are dropped, so the footer never shows a dangling "ID -" |
| Pixel watermark in flattened PDFs | Written into the page pictures. It is read back by uploading an image extracted from the PDF to Verify. Verifying the PDF itself uses sha256, page codes, metadata and perceptual hashes |

New files: `app/Services/DocumentTrace/`, `app/Models/Document*.php`, `config/doc-trace.php`, `resources/js/lib/doc-trace/`, `resources/js/components/doc-trace/`, tools pages `Watermark`, `ImageWatermark`, `PdfSign`, `Verify`, admin `DocumentTraces`.

Setup on a new environment: `php artisan migrate`, then `php artisan doc-trace:keygen` and paste the output into `.env`.

Checks: `composer test` (Pest, including `DocumentTraceTest`), `npm run test:doc-trace` (DCT survives JPEG quality 70, template and layout rules, metadata round trip), `npm run types`, `npm run build`.

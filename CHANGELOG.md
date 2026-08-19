# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Komponen Reusable `FlowbiteModal.vue`** (`app/components/ui/FlowbiteModal.vue`):
  - Standardisasi dialog modal panel admin menggunakan hierarki kelas Flowbite resmi, `<Teleport to="body">`, transisi halus, backdrop click dismiss, dan varian ukuran responsif (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`).
  - Migrasi seluruh modal di `templates.vue`, `sessions.vue`, `logs.vue`, dan `settings.vue` ke komponen `FlowbiteModal`.

### Changed
- **Penyederhanaan Alur Template & Standardisasi Preset**:
  - Menyelaraskan preset bawaan ke format standar **Strip 2×6 (3 Foto Vertikal · 600×1800 px · 300 DPI)** (*Classic White Strip* & *Midnight Noir Strip*) di `app/services/presets.ts`.
  - Mengunci template preset bawaan agar tidak dapat dihapus/ditimpa secara langsung (tersedia tombol duplikasi).
  - Modal upload frame PNG kini langsung terhubung dengan slot koordinat 3 foto strip serta mendukung *drag & drop*.
- **Reviu Menyeluruh Salinan Teks (*Copywriting*) & Form Label Admin**:
  - Merapikan seluruh teks dan microcopy di Dashboard, Acara, Perangkat, Sesi Foto, Template, Pengaturan, dan Log agar ringkas, lugas (*to the point*), dan kontekstual.
  - Menyeragamkan seluruh label input form tanpa tanda titik dua dan deskripsi redundan.
  - Mempersingkat teks pada dialog konfirmasi modal dan tombol aksi.
- **Penyempurnaan Responsivitas Antarmuka**:
  - Penyesuaian layout pratinjau kanvas pada halaman pemilihan template (`setup.vue`) agar tersembunyi di layar kecil/mobile dan tampil fleksibel di desktop.
  - Penambahan batasan tinggi `max-h-[58dvh]` dan scrollbar pada panel kontrol sesi pemotretan saat orientasi portrait.

### Removed
- Menghapus preset 4-foto (`TEMPLATE_STRIP_4PHOTO` dan `TEMPLATE_GRID_4PHOTO`) dari preset bawaan sistem untuk memfokuskan alur pada format strip 2×6.

### Security
- Hashing PIN Admin & Operator menggunakan **Web Crypto API (SHA-256)** — PIN tidak lagi tersimpan sebagai plaintext di IndexedDB maupun server (`app/utils/crypto.ts`, `app/composables/useAuth.ts`).
- Migrasi backward-compatible: PIN plaintext lama otomatis di-hash saat `loadPins()` pertama kali dipanggil setelah update.
- Endpoint `GET /api/settings` tidak lagi mengembalikan `adminPin` dan `operatorPin` ke client.
- Input PIN di halaman Settings dikosongkan saat dimuat — user harus mengetik PIN baru secara eksplisit (PIN lama tidak bisa di-reverse dari hash).

### Performance
- Tambah **in-memory cache TTL 30 detik** untuk `settingsDB.get()` (`app/services/db.ts`) — sebelumnya setiap panggilan selalu melakukan `$fetch` ke server, sekarang hit cache jika data masih segar. Cache diinvalidasi otomatis saat `set()` dipanggil.

### Refactor
- **Pemecahan `app/pages/session.vue`** dari monolitik 656 baris menjadi ~240 baris, dengan ekstraksi:
  - `app/composables/useSessionCamera.ts` — logika kamera: `initCamera`, `stopCamera`, `grabFrame`, mock stream
  - `app/components/session/SessionCameraViewport.vue` — wrapper visual viewfinder + result preview
  - `app/components/session/SessionCountdownOverlay.vue` — overlay countdown SVG ring + animasi angka
  - `app/components/session/SessionControlPanel.vue` — panel aksi (READY/COUNTDOWN/PREVIEW) + slot `#done`
  - `app/components/session/SessionDonePanel.vue` — QR code + form email backup (auto-generate QR via `watch` prop `sessionId`)
- **Penyimpanan foto sebagai Blob native** di IndexedDB (`app/services/db.ts` v2):
  - Foto raw per slot dan output composite disimpan di `session_photos` store sebagai `Blob` (bukan base64 inline)
  - Session document di IDB hanya menyimpan metadata (tanpa binary) — hemat ~33% storage
  - Server `POST /api/sessions` (defense in depth): strip `outputUrl` dan `photos[].dataUrl` sebelum simpan ke `sessions.json`
  - `recoverActiveSession()` memulihkan foto dari Blob store secara otomatis setelah crash/restart
  - Download page `/download/[id]` menggunakan 4-tier fallback: server API → IDB session doc → Blob output (slot -1) → Blob foto pertama (slot 0)

### Fixed
- Mengatasi masalah template tidak tampil / stuck di *"Memuat koleksi template…"*:
  - Menambahkan inisialisasi awal default preset di `template.ts` agar daftar template langsung tersedia secara instan tanpa menunggu IndexedDB.
  - Menambahkan *error recovery* dan *fallback* ke `PRESET_TEMPLATES` di `loadTemplates()` jika IndexedDB mengalami kendala/timeout.
  - Menambahkan timeout guard (4 detik), `onblocked` handler, dan listener `onversionchange` pada `openDB()` di `app/services/db.ts` agar migrasi schema database tidak memblokir koneksi.
- Atribut `crossorigin` pada preconnect Google Fonts diubah dari string kosong ke nilai valid `'anonymous'` di `nuxt.config.ts`.

### Added
- **Integrasi Cloudinary Cloud Storage** (`server/api/upload/cloudinary.post.ts`, `server/api/upload/test-cloudinary.post.ts`):
  - Pengunggahan otomatis hasil foto ke Cloudinary di latar belakang dengan format PNG resolusi penuh 300 DPI.
  - Struktur pengelompokan folder otomatis per acara dan per sesi (`[folder]/[acara]/[sessionId]/photostrip.png`).
  - Kartu konfigurasi Cloudinary di Admin Pengaturan dengan tombol pengujian koneksi instan.
- **Sintesis Audio Feedback Murni (Web Audio API)** (`app/services/sound.ts`):
  - Nada hitung mundur (*countdown beeps* - 880 Hz & 1318 Hz).
  - Suara jepretan kamera mekanikal (*mechanical shutter click & flash noise*).
  - Melodi penyelesaian (*success chime* C-E-G-C).
  - Bebas ketergantungan file eksternal (*zero-latency & zero network delay*).
- **Manajemen Danger Zone di Admin Pengaturan** (`app/pages/admin/settings.vue`):
  - Tombol *Hapus Hari Ini* (membersihkan sesi hari ini saja).
  - Tombol *Hapus Semua* (membersihkan seluruh riwayat sesi foto dan file dari server dan IndexedDB) dengan modal konfirmasi keamanan.

### Fixed
- **Sinkronisasi Email Tamu ke Admin**:
  - Memperbarui deteksi perubahan polling riwayat di Pinia store (`loadHistory`) agar segera merefleksikan pembaruan `customerEmail` di halaman admin.
  - Form email di booth langsung menyimpan email ke state sesi, IndexedDB lokal, dan server API `/api/sessions`.
- **Logika Status Cetak Akurat di Admin**:
  - Memperbaiki penentuan status cetak dari yang sebelumnya hanya mengecek `outputUrl` menjadi pelacakan nyata `printedAt`, `printJobId`, dan `printCount`.
  - Tabel dan kartu admin kini membedakan secara tegas antara **Belum Dicetak** (kuning) dan **Tercetak** (hijau).
- **Format Gambar PNG**:
  - Mengubah output perender kanvas (`renderTemplate` di `app/services/renderer.ts`) menjadi `image/png` murni (*lossless*) agar tidak terkompresi menjadi JPEG.
- **Ukuran dan Resolusi QR Code Booth**:
  - Memperbesar ukuran matriks QR code di panel akhir pemotretan (`SessionDonePanel.vue`) menjadi 360px dengan visual kontras tinggi sehingga sangat mudah dipindai oleh smartphone.

### Removed
- Menghapus properti `customerName` dari seluruh model data (`types/session.ts`), store (`stores/session.ts`), dan komponen panel booth.
- Menghapus paket dan endpoint SMTP yang tidak digunakan.

### Added
- Halaman Diagnostik Perangkat (`app/pages/admin/devices.vue`) dengan pengujian live viewfinder kamera, pemilihan input kamera aktif, diagnostik antrean printer, dan cetak pola kalibrasi 300 DPI.
- Halaman Konfigurasi Acara (`app/pages/admin/event.vue`) untuk pengelolaan nama acara, waktu hitung mundur (countdown), template utama, serta opsi otomasi & efek audio.
- Halaman Sesi Foto Admin (`app/pages/admin/sessions.vue`) berbasis tabel Flowbite terstruktur, pencarian ID sesi/email, filter rentang waktu (*Semua Waktu*, *Hari Ini*, *Kemarin*, *7 Hari Terakhir*), modal detail foto, dan ekspor JSON.
- Halaman Log Audit Sistem (`app/pages/admin/logs.vue`) dengan filter level (*Info*, *Peringatan*, *Error*), modul, dan fitur pembersihan log.
- Layanan engine pencetakan fisik browser/OS (`app/services/printer.ts`) dengan pembangkit pola uji cetak 300 DPI.

### Changed
- Perombakan total antarmuka Admin Control Center sesuai spesifikasi desain `DESIGN.md` dengan palet warna terpadu (Zinc Dark Theme + Aksen Amber).
- Penyesuaian Role-Based Access Control (RBAC):
  - Operator (PIN: `123456`): Mengakses Dashboard, Konfigurasi Acara, Sesi Foto, dan Diagnostik Perangkat.
  - Admin (PIN: `888888`): Akses penuh termasuk Pengelolaan Template Kanvas, Pengaturan Keamanan PIN, dan Log Audit.
- Penyesuaian salinan teks (*copywriting*) tamu:
  - Tombol pratinjau hasil foto menjadi *"Selesai"*.
  - Pemberitahuan pengambilan foto disesuaikan (*"Foto akan dicetak oleh operator"*).
  - Placeholder email cadangan disesuaikan menjadi `kenzie@gmail.com`.
- Penyesuaian salinan teks admin:
  - Penghapusan kata *"ulang"* menjadi aksi langsung (*"Cetak Foto"*, *"Periksa Perangkat"*).
  - Penghapusan referensi nama tamu pada pencarian dan tabel (fokus pada ID Sesi dan Email).
  - Penambahan komponen tahun pada format tanggal dan waktu sesi (`dd MMM yyyy, HH.mm`).
- Filter kategori pada halaman Kelola Template dibuat dinamis sesuai kategori template yang tersedia.
- Perbaikan layouting navbar fixed dan independent scrolling container pada dashboard admin.

### Removed
- Preset template kolase 6 foto (`6-Photo Collage`) dari daftar preset bawaan sistem.
- Rute lama `app/pages/gallery.vue` digantikan oleh manajemen sesi foto terpusat di panel admin dan halaman unduh sesi tamu (`/download/[id]`).

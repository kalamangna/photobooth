# Photobooth — Design System & UX

## 1. Tujuan

Dokumen ini mendefinisikan rancangan visual, UX, dan struktur interface untuk aplikasi photobooth berbasis web.

Aplikasi memiliki dua pengalaman utama:

1. **Guest / Frontend** — berjalan pada iPad atau tablet yang digunakan langsung oleh pelanggan.
2. **Admin / Backend** — berjalan pada device lain seperti laptop, desktop, tablet, atau smartphone untuk mengelola dan mengoperasikan booth.

Prinsip utama:

> **Frontend harus sangat mudah digunakan pelanggan. Backend harus sangat jelas untuk operator. Keduanya menggunakan tone visual yang sama, tetapi tingkat informasi dan interaksinya berbeda.**

---

# 2. Prinsip Utama

## 2.1 Customer-first

Tablet adalah interface yang digunakan orang yang belum pernah melihat aplikasi sebelumnya. Pengguna harus dapat memahami apa yang harus dilakukan tanpa bantuan operator.

Flow dasar harus dapat dipahami secara intuitif:

```text
Mulai
↓
Berpose
↓
Foto
↓
Lihat hasil
↓
Cetak / Ambil digital
↓
Selesai
```

Hindari instruksi panjang, istilah teknis, dan pilihan yang tidak diperlukan.

## 2.2 Adaptive, bukan portrait-first

Aplikasi tidak mengasumsikan portrait maupun landscape sebagai orientasi wajib.

Guest UI harus menjadi **orientation-agnostic** dan menyesuaikan:

- ukuran tablet
- aspect ratio
- portrait
- landscape
- safe area
- resolusi layar

Layout ditentukan oleh ruang yang tersedia dan **camera viewport**, bukan orientasi perangkat.

## 2.3 Camera-first

Kamera adalah pusat pengalaman photobooth.

Prioritas visual:

1. Camera viewport
2. Posisi / arahan pengguna
3. Primary CTA
4. Branding event
5. Informasi tambahan

## 2.4 Touch-first

Frontend dirancang untuk sentuhan:

- target sentuh besar
- jarak antar kontrol cukup
- tidak bergantung pada hover
- tidak bergantung pada right-click
- tidak menggunakan kontrol kecil untuk aksi utama

## 2.5 Minimal UI

Hindari komponen dan copy yang berlebihan di frontend maupun backend.

Jangan menambahkan komponen hanya karena tersedia di library.

Jangan menampilkan informasi yang tidak dibutuhkan pada konteks saat itu.

Prinsip:

> **One screen, one clear purpose.**

## 2.6 Tone visual konsisten

Frontend dan backend harus menggunakan:

- warna utama yang sama
- semantic colors yang sama
- typography yang selaras
- radius dan border treatment yang konsisten
- pola status yang konsisten

Perbedaannya hanya pada komposisi dan kepadatan informasi.

## 2.7 Native feel, web architecture

Frontend tetap berbasis web, tetapi pengalaman guest harus terasa seperti aplikasi/produk photobooth khusus, bukan website biasa.

---

# 3. Teknologi UI

## Frontend / Guest

Gunakan:

- Vue / Nuxt
- TypeScript
- **Pure Tailwind CSS**

Tidak menggunakan Flowbite pada frontend guest.

Semua komponen guest dibuat khusus untuk kebutuhan photobooth agar UI tetap ringan, sederhana, dan terkontrol.

## Backend / Admin

Gunakan:

- Vue / Nuxt
- TypeScript
- Tailwind CSS
- **Flowbite** sebagai component foundation

Flowbite digunakan untuk komponen backend seperti:

- button
- input
- select
- modal
- dropdown
- table
- tabs
- badge
- alert
- drawer
- form

Komponen Flowbite boleh dikustomisasi agar mengikuti design token aplikasi.

## Aturan penting

Jangan menggunakan dua gaya visual yang berbeda antara Tailwind custom dan Flowbite.

Flowbite hanya menjadi implementation layer untuk backend, bukan identitas visual yang berbeda.

---

# 4. Arsitektur Experience

```text
                         PHOTOBOOTH
                              │
              ┌───────────────┴───────────────┐
              │                               │
       GUEST / FRONTEND                  ADMIN / BACKEND
              │                               │
       iPad / Tablet                   Laptop / HP / Tablet
              │                               │
        Touch-first                     Control-first
        Minimal                         Informative
        Immersive                       Functional
              │                               │
              └───────────────┬───────────────┘
                              │
                       Shared Design Tokens
```

---

# 5. Role Admin

Backend memiliki dua role:

```text
Admin
Operator
```

## 5.1 Admin

Admin mempunyai **all access**.

Admin dapat:

- mengatur booth
- mengatur event
- mengatur template
- mengatur kamera
- mengatur printer
- mengatur session
- melakukan reprint
- mengubah settings
- melihat logs
- mengelola operator
- mengubah PIN operator
- mengelola seluruh konfigurasi aplikasi

## 5.2 Operator

Operator digunakan untuk menjalankan booth saat event tanpa memberikan akses konfigurasi penuh.

Operator dapat:

- melihat status booth
- melihat kamera
- melihat printer
- memulai / menghentikan sesi
- melakukan retake bila diizinkan
- melakukan reprint
- melihat session yang relevan
- menjalankan tindakan operasional

Operator **tidak** dapat mengubah konfigurasi kritis seperti:

- camera configuration utama
- printer configuration utama
- event configuration permanen
- template management
- system settings
- operator management
- destructive actions

---

# 6. Login Admin

Login backend harus sederhana.

Role dapat dipilih atau ditentukan dari account yang digunakan.

Untuk penggunaan operator di lokasi event, gunakan **PIN login**.

Contoh:

```text
┌───────────────────────────────┐
│           BOOTH               │
│                               │
│        OPERATOR LOGIN         │
│                               │
│       • • • • • •             │
│                               │
│       [ 1 ] [ 2 ] [ 3 ]      │
│       [ 4 ] [ 5 ] [ 6 ]      │
│       [ 7 ] [ 8 ] [ 9 ]      │
│       [ ← ] [ 0 ] [ ✓ ]      │
│                               │
└───────────────────────────────┘
```

Untuk operator, PIN harus menjadi mekanisme login yang cepat dan praktis.

Admin tetap dapat menggunakan authentication penuh sesuai sistem account aplikasi.

---

# 7. Guest / Frontend

## 7.1 Tujuan

Frontend harus terasa seperti mesin photobooth, bukan dashboard atau website.

Guest tidak perlu mengetahui:

- tipe kamera
- tipe printer
- session ID
- status API
- sync
- storage
- konfigurasi perangkat
- error teknis internal

Jika masalah teknis terjadi, tampilkan pesan yang sederhana dan action yang jelas.

Contoh:

```text
Printer belum siap.
Silakan hubungi petugas.
```

Bukan:

```text
PrintServiceException: Device connection timeout...
```

---

# 8. Guest Layout

## 8.1 Landscape

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│                    CAMERA VIEW                       │
│                                                      │
│                                                      │
├──────────────────────┬───────────────────────────────┤
│  Instruksi singkat   │      [ MULAI FOTO ]          │
└──────────────────────┴───────────────────────────────┘
```

Landscape dapat memberikan ruang horizontal yang baik untuk camera viewport dan CTA.

## 8.2 Portrait

```text
┌────────────────────────┐
│        BRANDING        │
│                        │
│      CAMERA VIEW       │
│                        │
│       Instruksi        │
│                        │
│    [ MULAI FOTO ]      │
└────────────────────────┘
```

Portrait harus tetap terasa sebagai mode utama, bukan hasil layout desktop yang dipaksa menjadi vertikal.

---

# 9. Camera Viewport

Camera viewport adalah area paling penting di guest UI.

Jangan memaksa aspect ratio kamera sama dengan aspect ratio layar.

Contoh:

```text
Screen        : 16:10
Camera        : 4:3
Template      : 6×4
Print output  : 2×6
```

Masing-masing dapat mempunyai aspect ratio sendiri.

Aturan:

- jangan stretch preview
- gunakan `object-fit` sesuai kebutuhan
- pertahankan framing wajah
- gunakan safe framing guide bila diperlukan
- jangan mengorbankan preview kamera hanya untuk memperbesar branding

---

# 10. Welcome Screen

Tujuan: guest langsung tahu apa yang harus dilakukan.

Komponen minimum:

```text
Branding
Short instruction
Primary CTA
```

Contoh:

```text
LOGO

Siap foto?

[ MULAI FOTO ]
```

Hindari paragraf penjelasan.

---

# 11. Capture Screen

Saat capture berlangsung, fokus hanya pada kamera dan countdown.

```text
┌──────────────────────────────────┐
│                                  │
│          CAMERA VIEW             │
│                                  │
│              3                   │
│                                  │
│            SIAP!                 │
│                                  │
└──────────────────────────────────┘
```

State utama:

```text
3
2
1
CAPTURE
```

Countdown harus besar dan terbaca dari jarak beberapa meter.

---

# 12. Multiple Capture

Copy harus singkat dan natural.

Gunakan:

```text
Foto 1
Foto 2
Terakhir!
```

atau context yang sesuai event.

Hindari copy panjang seperti:

```text
Silakan bersiap untuk mengambil foto berikutnya...
```

---

# 13. Processing

Gunakan copy singkat dan nyata.

Contoh:

```text
Menyiapkan foto...
```

Jika proses membutuhkan waktu lebih lama:

```text
Menyiapkan foto...

[ progress ]
```

Jangan menampilkan istilah teknis.

---

# 14. Result Screen

Hasil sesi harus menjadi fokus utama.

```text
YOUR PHOTOS

[ PREVIEW ]

Printing...

[ QR CODE ]
Scan untuk mengambil foto
```

QR digunakan untuk membuka session gallery.

Jika printer aktif, status print cukup ditampilkan sebagai informasi sekunder.

---

# 15. Session Gallery

QR mengarah ke satu sesi:

```text
Event
  ↓
Session
  ├── Photo 01
  ├── Photo 02
  ├── Photo 03
  ├── Final Print
  ├── GIF
  └── Video
```

Tampilkan hanya media yang tersedia.

Action utama:

```text
[ DOWNLOAD ALL ]
```

---

# 16. Guest CTA

Primary CTA harus jelas dan besar.

Contoh:

```text
[ MULAI FOTO ]
[ LANJUTKAN ]
[ CETAK ]
[ SELESAI ]
```

Target touch area:

- kontrol umum: minimal sekitar 56 px
- primary CTA: sekitar 64–72 px

Gunakan spacing yang cukup sehingga kesalahan sentuh minimal.

---

# 17. Theme System

Frontend dan backend menggunakan **tone warna yang sama** melalui design tokens.

```text
--color-primary
--color-primary-foreground
--color-secondary
--color-background
--color-surface
--color-text
--color-muted
--color-accent
--color-border
--color-success
--color-warning
--color-danger
```

Theme event dapat mengubah visual frontend tanpa merusak hierarchy dasar.

```text
Theme
├── Colors
├── Logo
├── Background
├── Typography
├── CTA
└── Optional decorative assets
```

Backend tetap memakai semantic colors yang sama.

Contoh:

```text
Frontend primary button  → Primary
Backend primary button   → Primary
Success frontend         → Success
Success backend          → Success
Danger frontend          → Danger
Danger backend           → Danger
```

---

# 18. Color Rules

Jangan menggunakan warna khusus yang hanya muncul di satu bagian aplikasi tanpa alasan desain.

Gunakan warna berdasarkan makna:

| Token | Fungsi |
|---|---|
| Primary | Aksi utama dan identitas aplikasi |
| Secondary | Aksi sekunder |
| Success | Siap, berhasil, online |
| Warning | Perhatian |
| Danger | Error, delete, destructive action |
| Muted | Informasi sekunder |
| Surface | Panel / card / area kerja |

Frontend boleh tampil lebih imersif, tetapi semantic color tetap sama dengan backend.

---

# 19. Typography

Gunakan hierarchy sederhana:

```text
Display
Heading
Body
Label
Caption
```

Jangan menggunakan terlalu banyak ukuran font.

Frontend:

- headline jelas
- CTA mudah dibaca
- caption minimal

Backend:

- heading ringkas
- label jelas
- tabel dan form padat tetapi tetap terbaca

Gunakan maksimal dua font family pada satu theme/event.

---

# 20. Spacing

Gunakan spacing token yang konsisten.

```text
4   = 4px
8   = 8px
12  = 12px
16  = 16px
24  = 24px
32  = 32px
48  = 48px
64  = 64px
```

Backend dapat lebih padat daripada frontend, tetapi tetap berasal dari token yang sama.

---

# 21. Components

## Frontend

Gunakan komponen seperlunya:

```text
GuestShell
CameraViewport
PrimaryButton
Countdown
Instruction
PhotoPreview
ResultView
QRCode
StatusMessage
```

Hindari membuat abstraksi komponen hanya demi memecah file.

## Backend

Gunakan Flowbite untuk komponen umum:

```text
Button
Input
Select
Modal
Dropdown
Badge
Alert
Table
Tabs
Drawer
Toast
```

Komponen harus dipakai sesuai konteks, bukan dipaksakan ke semua halaman.

---

# 22. Copywriting Rules

Copy harus:

- pendek
- langsung
- natural
- sesuai konteks
- tidak terlalu formal
- tidak terdengar seperti output AI

Utamakan kata yang dipahami pengguna umum.

Contoh baik:

```text
Mulai Foto
Siap?
Senyum!
Terakhir!
Menyiapkan foto...
Cetak selesai
Scan untuk mengambil foto
```

Hindari:

```text
Silakan melakukan inisiasi proses pengambilan gambar.
Mohon menunggu sementara sistem melakukan pemrosesan data multimedia.
```

---

# 23. Admin / Backend Layout

Backend adalah control center.

Desktop:

```text
┌─────────────────────────────────────────────────────┐
│ Logo                  Event              Account     │
├────────────┬────────────────────────────────────────┤
│ Dashboard  │                                        │
│ Events     │               CONTENT                  │
│ Templates  │                                        │
│ Sessions   │                                        │
│ Devices    │                                        │
│ Settings   │                                        │
└────────────┴────────────────────────────────────────┘
```

Gunakan sidebar desktop dan navigation yang lebih ringkas pada mobile.

---

# 24. Admin Dashboard

Dashboard fokus pada kondisi booth, bukan dekorasi.

Prioritas informasi:

1. Booth status
2. Camera status
3. Printer status
4. Session activity
5. Operational actions

Contoh:

```text
Booth Status

Camera      ● Ready
Printer     ● Ready
Storage     72% free

Sessions today   48
Prints today     47
```

Jangan memenuhi dashboard dengan card statistik yang tidak membantu operator.

---

# 25. Admin Navigation

Menu awal cukup:

```text
Dashboard
Events
Templates
Sessions
Devices
Settings
```

Menu dapat bertambah jika fitur benar-benar dibutuhkan.

Operator melihat menu lebih sedikit berdasarkan permission.

---

# 26. Admin — Event

Halaman event harus fokus pada konfigurasi yang benar-benar digunakan booth.

```text
Event
├── General
├── Theme
├── Capture
├── Template
├── Print
└── Sharing
```

Gunakan tabs atau section yang jelas, bukan satu halaman panjang dengan terlalu banyak panel.

---

# 27. Admin — Devices

Tampilkan device dalam konteks operasional.

```text
Camera
● Connected

Printer
● Ready

Storage
● 72%
```

Action:

```text
[ TEST CAMERA ]
[ TEST PRINTER ]
```

Detail teknis tersedia saat dibutuhkan, bukan selalu terbuka.

---

# 28. Admin — Session

Session history menggunakan tabel Flowbite pada desktop.

Kolom inti:

```text
Time
Session
Photos
Print
Status
Action
```

Action utama:

```text
View
Reprint
```

Hindari menampilkan semua metadata pada tabel utama.

---

# 29. Admin — Operator

Admin dapat mengelola operator:

```text
Operator
├── Name
├── Status
├── PIN
└── Access
```

Operator tidak perlu memiliki account UI yang kompleks jika kebutuhan hanya login PIN.

Admin dapat:

- membuat operator
- mengubah PIN
- menonaktifkan operator
- melihat operator aktif

---

# 30. Operator Mode

Operator harus memiliki tampilan yang lebih sederhana daripada Admin.

Fokus:

```text
Booth Status
Current Event
Current Session
Camera
Printer
Reprint
Pause / Resume
```

Operator tidak melihat menu konfigurasi sistem jika tidak mempunyai izin.

---

# 31. Admin — All Access

Admin memiliki akses penuh ke seluruh interface dan fungsi.

Destructive action harus tetap menggunakan confirmation:

```text
Hapus template?

[TIDAK] [HAPUS]
```

Gunakan warna danger hanya pada aksi yang benar-benar destructive.

---

# 32. Admin Mobile

Mobile admin bukan versi desktop yang dipaksa mengecil.

Gunakan:

- top bar sederhana
- drawer / bottom navigation bila diperlukan
- list yang mudah disentuh
- action utama tetap terlihat

Contoh:

```text
┌───────────────────────┐
│ ☰  BoothOS       ●    │
├───────────────────────┤
│ Booth Ready           │
│                       │
│ Camera    ● Ready     │
│ Printer   ● Ready     │
│                       │
│ [ REPRINT ]           │
│                       │
│ Sessions              │
└───────────────────────┘
```

---

# 33. Template Editor

Template editor hanya digunakan pada backend.

Struktur desktop:

```text
┌────────────┬────────────────────────┬──────────────┐
│ Assets     │ Canvas                 │ Properties   │
│            │                        │              │
│ Photo      │      ┌─────────┐       │ Position     │
│ Text       │      │  PHOTO  │       │ Size         │
│ Image      │      └─────────┘       │ Typography   │
│ Shape      │                        │ Alignment    │
└────────────┴────────────────────────┴──────────────┘
```

Jangan membuat editor seperti Canva penuh pada MVP.

Mulai dari:

- photo slot
- text
- image/logo
- basic positioning
- basic sizing
- alignment

---

# 34. Motion

Motion digunakan untuk memberikan feedback:

- state transition
- countdown
- capture
- processing
- result
- print status

Hindari animasi dekoratif yang memperlambat task.

Guest motion harus singkat dan jelas.

Backend motion harus minimal.

---

# 35. Error Handling

## Frontend

Tampilkan hanya informasi yang dibutuhkan guest.

```text
Printer belum siap.
Silakan hubungi petugas.
```

## Backend

Operator harus mendapat informasi yang lebih berguna:

```text
Printer offline
Last connected: 18:42

[ RETRY ]
```

Admin dapat melihat detail teknis/log jika dibutuhkan.

```text
Error detail
Device: DNP DS-RX1
Status: offline
Last response: timeout
```

Jangan menampilkan stack trace kepada operator secara default.

---

# 36. State & Status

Gunakan pola status yang konsisten di frontend dan backend.

```text
● Ready
● Processing
● Printing
● Offline
● Error
```

Semantic colors berasal dari token yang sama.

Status tidak hanya mengandalkan warna; gunakan label atau icon agar tetap jelas.

---

# 37. Kiosk Behavior

Guest frontend harus dapat dijalankan dalam fullscreen/kiosk.

Tidak boleh ada akses guest ke:

- browser controls
- URL navigation
- developer tools
- admin route
- system settings

Akses admin dilakukan dari device admin atau mekanisme operator yang ditentukan sistem.

---

# 38. Responsive Rules

Guest:

- adaptive portrait/landscape
- camera-first
- touch-first
- minimal content

Admin:

- desktop: sidebar + content
- tablet: compact sidebar/navigation
- mobile: drawer/top bar + stacked content

Jangan sekadar mengecilkan desktop layout.

---

# 39. Design Token Implementation

Simpan token pada satu sumber agar frontend dan backend tidak mempunyai warna yang berbeda.

Contoh:

```text
/design-tokens
    colors.ts
    typography.ts
    spacing.ts
    radius.ts
    shadows.ts
```

Guest Tailwind menggunakan token yang sama.

Flowbite backend juga harus ditheme menggunakan token yang sama.

---

# 40. Aturan Anti-Overdesign

Jangan menambahkan:

- card tanpa fungsi
- badge yang tidak memberi informasi
- icon tanpa makna
- copy penjelasan panjang
- divider berlebihan
- modal untuk hal sederhana
- statistik dekoratif
- tombol duplikat
- halaman konfigurasi yang terlalu panjang

Sebelum menambahkan komponen, jawab:

> Apakah komponen ini membantu user menyelesaikan task?

Jika tidak, jangan tampilkan.

---

# 41. Design Checklist

## Frontend

- [ ] Mudah digunakan tanpa bantuan operator
- [ ] Camera viewport menjadi fokus utama
- [ ] Bisa portrait dan landscape
- [ ] Touch target besar
- [ ] Copy singkat
- [ ] Tidak ada menu teknis
- [ ] Pure Tailwind
- [ ] Warna mengikuti shared tokens

## Backend

- [ ] Admin dan Operator terpisah
- [ ] Admin memiliki all access
- [ ] Operator login menggunakan PIN
- [ ] Permission jelas
- [ ] Flowbite digunakan sebagai component foundation
- [ ] Dashboard tidak penuh card dekoratif
- [ ] Copy singkat dan kontekstual
- [ ] Warna mengikuti shared tokens

## Konsistensi

- [ ] Primary color sama
- [ ] Semantic colors sama
- [ ] Typography selaras
- [ ] Radius selaras
- [ ] Status behavior selaras
- [ ] Tidak ada visual language yang bertentangan antara frontend dan backend

---

# 42. Prinsip Akhir

Desain aplikasi mengikuti prinsip:

> **Simple for guests, powerful for operators, complete for admins.**

Guest hanya melihat hal yang diperlukan untuk mengambil dan menerima foto.

Operator mendapatkan kontrol operasional yang cepat.

Admin mendapatkan seluruh akses konfigurasi dan pengelolaan.

Frontend dan backend tetap terlihat sebagai satu produk melalui shared design tokens, sementara implementasinya tetap berbeda: **pure Tailwind untuk frontend guest dan Flowbite untuk backend admin/operator**.

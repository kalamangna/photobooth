# Photobooth — Design System & UX

## 1. Tujuan

Dokumen ini mendefinisikan rancangan visual dan UX untuk aplikasi photobooth berbasis web.

Aplikasi memiliki dua pengalaman utama:

1. **Guest Experience** — berjalan pada iPad/tablet yang menjadi layar utama photobooth.
2. **Admin Experience** — berjalan pada laptop, desktop, tablet, atau smartphone untuk konfigurasi dan pengendalian booth.

Prinsip utama:

> **Guest UI harus terasa seperti sebuah produk fisik photobooth, sedangkan Admin UI harus terasa seperti aplikasi web profesional.**

Desain guest bersifat **adaptive/orientation-agnostic**. Aplikasi tidak mengunci portrait maupun landscape.

---

## 2. Prinsip Desain

### 2.1 Guest-first, bukan dashboard-first

Layar photobooth harus sederhana, visual, dan langsung dipahami tanpa instruksi panjang.

Guest tidak perlu mengetahui:

- jenis kamera
- jenis printer
- status API
- session ID
- sinkronisasi
- detail teknis perangkat

Guest cukup memahami:

```text
Mulai
↓
Berpose
↓
Foto
↓
Lihat hasil
↓
Cetak / Ambil foto digital
```

### 2.2 Adaptive, bukan portrait-first

Orientasi layar bukan bagian dari identitas aplikasi.

Layout harus menyesuaikan ruang yang tersedia dan tetap optimal pada:

- landscape
- portrait
- berbagai ukuran tablet
- resolusi berbeda

Prioritas layout ditentukan oleh **camera viewport**, bukan oleh orientasi layar.

### 2.3 Camera viewport adalah pusat pengalaman

Preview kamera merupakan elemen visual paling penting pada layar guest.

Jangan membuat tombol atau branding mengambil ruang lebih besar daripada area yang dibutuhkan pengguna untuk melihat posisi mereka di kamera.

### 2.4 Touch-first

Semua interaksi guest dirancang untuk jari:

- tombol besar
- jarak antar kontrol cukup
- tidak bergantung pada hover
- tidak bergantung pada right click
- tidak menggunakan kontrol kecil yang sulit disentuh

### 2.5 Minimal chrome

Guest UI tidak menggunakan:

- sidebar
- navbar kompleks
- menu teknis
- tabel
- form konfigurasi
- elemen browser yang terlihat jika kiosk mode tersedia

### 2.6 Premium tetapi natural

Visual sebaiknya terasa:

- bersih
- modern
- hangat
- percaya diri
- tidak terlalu ramai
- tidak terlalu "techy"

Animasi digunakan untuk memberi konteks, bukan sekadar dekorasi.

---

# 3. Arsitektur Experience

```text
                        PHOTOBOOTH
                            │
             ┌──────────────┴──────────────┐
             │                             │
      GUEST EXPERIENCE              ADMIN EXPERIENCE
             │                             │
        iPad / Tablet              Laptop / Tablet / HP
             │                             │
       Touch-first                 Control-first
       Immersive                   Informative
       Minimal                     Functional
             │                             │
             └──────────────┬──────────────┘
                            │
                       Shared Design
                          System
```

Guest dan Admin menggunakan design tokens yang sama, tetapi memiliki komposisi dan tingkat informasi yang berbeda.

---

# 4. Guest Experience

## 4.1 Prinsip layout

Guest UI harus menggunakan **fluid composition**.

Jangan mengandalkan ukuran layar tertentu seperti:

```text
1024 × 1366
```

sebagai ukuran desain absolut.

Gunakan:

- container relatif
- aspect-ratio
- min/max width
- safe area
- viewport units
- responsive grid/flex layout

### Prioritas visual

1. Camera viewport
2. Posisi/arah pengguna
3. Primary CTA
4. Branding/event identity
5. Informasi sekunder

---

## 4.2 Landscape composition

Landscape dapat menjadi komposisi yang sangat baik untuk booth karena memberikan ruang horizontal bagi preview, branding, dan CTA.

Contoh konsep:

```text
┌──────────────────────────────────────────────────────┐
│                                                      │
│                     CAMERA VIEW                      │
│                                                      │
│                                                      │
│                                                      │
├──────────────────────┬───────────────────────────────┤
│  Event / Instruction │          [ START PHOTO ]      │
└──────────────────────┴───────────────────────────────┘
```

Ini bukan layout fixed. Komponen dapat berubah susunan sesuai ruang yang tersedia.

---

## 4.3 Portrait composition

Portrait juga harus menjadi mode kelas satu, bukan fallback yang terasa rusak.

Contoh:

```text
┌────────────────────────┐
│        BRANDING        │
│                        │
│     CAMERA VIEW        │
│                        │
│                        │
│      INSTRUCTION       │
│                        │
│    [ START PHOTO ]     │
└────────────────────────┘
```

Komponen disusun secara vertikal dengan camera viewport tetap menjadi elemen terbesar.

---

# 5. Camera Viewport

Camera viewport tidak boleh dipaksa mengikuti aspect ratio seluruh layar.

Contoh:

```text
Screen        : 16:10
Camera        : 4:3
Template      : 6×4
Print output  : 2×6
```

Masing-masing mempunyai aspect ratio sendiri.

Gunakan container khusus untuk preview kamera:

```text
.camera-viewport {
  aspect-ratio: 4 / 3;
}
```

Aspect ratio aktual dapat berubah berdasarkan kamera dan konfigurasi event.

### Aturan

- jangan stretch gambar kamera
- gunakan `object-fit: cover` atau `contain` sesuai mode preview
- jangan memotong wajah secara tidak terduga
- gunakan safe framing guide bila diperlukan

---

# 6. Welcome Screen

Tujuan utama: membuat guest langsung memahami tindakan pertama.

Komponen:

```text
Branding
Headline / event title
Short instruction
Primary CTA
Optional secondary information
```

Contoh:

```text
┌──────────────────────────────────┐
│                                  │
│              LOGO                │
│                                  │
│       Capture the moment.        │
│                                  │
│     Stand here and smile.        │
│                                  │
│        [ MULAI FOTO ]            │
│                                  │
└──────────────────────────────────┘
```

Jangan menampilkan pengaturan kamera atau printer.

---

# 7. Capture Screen

Saat capture berlangsung, interface harus fokus pada kamera dan countdown.

```text
┌──────────────────────────────────┐
│                                  │
│          CAMERA VIEW             │
│                                  │
│              3                   │
│                                  │
│           GET READY              │
│                                  │
└──────────────────────────────────┘
```

Countdown harus sangat mudah dilihat.

### State countdown

```text
3
2
1
CAPTURE
```

Gunakan animasi pendek yang memberi feedback jelas.

---

# 8. Multiple Capture

Jangan menggunakan istilah teknis seperti `Capture 1/3` sebagai satu-satunya informasi.

Gunakan microcopy yang lebih natural:

```text
PHOTO 1
Get ready.
```

```text
PHOTO 2
One more.
```

```text
PHOTO 3
Last one!
```

Informasi teknis seperti jumlah foto dapat tetap tersedia dalam overlay kecil jika diperlukan.

---

# 9. Processing Screen

Processing harus terlihat aktif tetapi tidak membuat guest merasa aplikasi macet.

Contoh:

```text
Preparing your photos...

[ subtle progress animation ]
```

Jika proses memang membutuhkan waktu cukup lama, tampilkan status nyata.

Jangan menggunakan spinner tanpa konteks untuk proses yang dapat berlangsung beberapa detik.

---

# 10. Result Screen

Hasil sesi harus menjadi momen utama setelah capture.

```text
┌──────────────────────────────────────┐
│                                      │
│             YOUR PHOTOS              │
│                                      │
│          [ PHOTO PREVIEW ]           │
│                                      │
│      Printing...                     │
│                                      │
│             [ QR CODE ]              │
│      Scan to get your photos         │
│                                      │
│  ── atau masukkan email untuk backup ─│
│  [email@example.com]  [ Kirim ]      │
│                                      │
└──────────────────────────────────────┘
```

QR menjadi metode utama untuk digital delivery.

Email dipertahankan sebagai **backup delivery** — ditampilkan di bawah QR sebagai opsi sekunder jika guest tidak dapat menscan QR. Email tidak bersifat wajib.

### Aturan email di Result Screen

- Ditampilkan setelah QR muncul, bukan sebelumnya
- Bukan field wajib — guest boleh skip
- Microcopy: "Atau masukkan email untuk backup"
- Input dan tombol kirim dalam satu baris agar ringkas
- Feedback sukses sederhana: "Terkirim ✓"

Jika printer aktif, status printing tetap terlihat tetapi tidak boleh mengambil fokus utama dari hasil.

---

# 11. Session Gallery

QR sebaiknya mengarah ke satu session gallery, bukan satu file.

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

Guest dapat melakukan:

- preview
- download
- download all
- share

Media yang tidak tersedia tidak perlu ditampilkan.

---

# 12. Guest CTA

Primary CTA harus sangat jelas.

Contoh:

```text
[ MULAI FOTO ]
[ LANJUTKAN ]
[ SELESAI ]
[ CETAK ]
```

### Ukuran

Target touch minimum:

- 56 px untuk kontrol umum
- 64–72 px untuk primary CTA

Gunakan ukuran berdasarkan viewport dan accessibility, bukan hanya angka tetap.

---

# 13. Theme System

Tema event harus dapat mengubah visual guest tanpa mengubah layout dasar.

## Design tokens

```text
--color-primary
--color-secondary
--color-background
--color-surface
--color-text
--color-muted
--color-accent
--color-button
--color-button-text
--color-border
```

### Event dapat memiliki

```text
Theme
├── Colors
├── Typography
├── Logo
├── Background
├── Buttons
├── Overlay
└── Motion preference
```

Contoh kategori tema:

- Wedding
- Birthday
- Corporate
- Graduation
- Custom

---

# 14. Typography

Typography harus jelas dari jarak beberapa meter.

Rekomendasi hierarchy:

```text
Display
Headline
Body
Label
Caption
```

Gunakan maksimal 2 keluarga font untuk satu event.

Primary CTA harus mempunyai kontras tinggi terhadap background.

---

# 15. Spacing

Gunakan spacing token konsisten.

Contoh:

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

Pada layar besar, spacing dapat menggunakan responsive scaling.

---

# 16. Motion

Motion digunakan untuk:

- perpindahan state
- countdown
- capture feedback
- processing feedback
- result appearance

Contoh:

```text
Welcome
  ↓ fade
Ready
  ↓ scale
Countdown
  ↓ punch
Capture
  ↓ smooth transition
Result
```

Hindari animasi yang:

- terlalu cepat
- terlalu ramai
- mengganggu preview kamera
- menghambat user mengambil foto

---

# 17. Error UX untuk Guest

Error teknis harus diterjemahkan ke bahasa sederhana.

### Jangan

```text
Camera SDK error: EDS_ERR_DEVICE_BUSY
```

### Gunakan

```text
Camera sedang tidak siap.
Kami sedang mencoba menghubungkannya kembali.
```

Jika tindakan user diperlukan:

```text
Camera belum siap.
Silakan coba lagi.

[ COBA LAGI ]
```

Detail teknis hanya diberikan kepada admin.

---

# 18. Admin Experience

Admin menggunakan device terpisah sehingga dapat menggunakan antarmuka yang jauh lebih informatif.

Target:

- laptop
- desktop
- tablet
- smartphone

Admin UI adalah **responsive web application**, bukan kiosk UI.

---

# 19. Admin Navigation

Desktop/tablet:

```text
┌───────────────┬─────────────────────────────────┐
│ Dashboard     │                                 │
│ Events        │           Content               │
│ Templates     │                                 │
│ Sessions      │                                 │
│ Devices       │                                 │
│ Settings      │                                 │
└───────────────┴─────────────────────────────────┘
```

Mobile:

```text
┌────────────────────────┐
│ ☰   BoothOS       ●    │
├────────────────────────┤
│                        │
│      Dashboard         │
│                        │
└────────────────────────┘
```

---

# 20. Admin Dashboard

Dashboard harus berfokus pada kondisi booth.

```text
┌──────────────────────────────────────────────┐
│ BOOTH STATUS                                 │
├──────────────────────────────────────────────┤
│                                              │
│ Camera        ● Connected                    │
│ Printer       ● Ready                        │
│ Storage       ● 72% free                     │
│ Browser       ● Connected                    │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│ Sessions Today        48                     │
│ Prints Today          47                     │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 21. Event Setup

Event adalah pusat konfigurasi.

```text
Event
├── General
├── Theme
├── Capture
├── Template
├── Print
└── Sharing
```

Admin membuat konfigurasi sebelum event berjalan.

---

# 22. Live Booth Control

Pisahkan konfigurasi dari kontrol langsung.

```text
Live Booth
├── Camera Status
├── Printer Status
├── Current Session
├── Reprint
├── Pause Booth
├── Resume Booth
└── Restart Session
```

Tindakan berisiko harus memiliki confirmation.

---

# 23. Device Management

Admin harus dapat melihat perangkat inti.

```text
Camera
● Connected

Printer
● Ready

Bridge
● Connected

Storage
● Healthy
```

Jika ada masalah:

```text
⚠ Printer Offline
```

atau:

```text
⚠ Camera disconnected
```

---

# 24. Live Preview Admin

Admin dapat melihat preview kamera bila diperlukan.

```text
┌──────────────────────┐
│                      │
│    LIVE CAMERA       │
│                      │
└──────────────────────┘

Camera: Connected
Session: Ready
```

Live preview admin sebaiknya tidak menjadi kebutuhan untuk operasi normal dan tidak boleh membebani jaringan/cloud tanpa alasan.

---

# 25. Template Editor

Template editor adalah bagian visual utama Admin Experience.

Desktop:

```text
┌────────────┬──────────────────────────┬─────────────┐
│ Assets     │                          │ Properties  │
│            │          CANVAS          │             │
│ Photo      │                          │ Position    │
│ Text       │          ┌───────┐       │ Size        │
│ Image      │          │ PHOTO │       │ Font        │
│ Shape      │          └───────┘       │ Color       │
└────────────┴──────────────────────────┴─────────────┘
```

Komponen awal:

- Photo slot
- Text
- Image/logo
- Shape
- Background

Tidak perlu membuat editor serumit Canva pada MVP.

---

# 26. Mobile Admin

Mobile cocok untuk:

- melihat status
- mengganti event
- melihat session
- reprint
- mengubah setting sederhana
- troubleshooting

Mobile tidak menjadi target utama untuk template editor kompleks.

---

# 27. Responsive Strategy

Jangan mendefinisikan desain berdasarkan perangkat tertentu saja.

Gunakan tiga kelas pengalaman:

```text
Guest Booth
Adaptive touch experience

Admin Desktop/Tablet
Full control experience

Admin Mobile
Compact control experience
```

### Guest

Gunakan adaptive layout berdasarkan:

- viewport width
- viewport height
- aspect ratio
- safe area

### Admin

Gunakan:

- responsive grid
- collapsible navigation
- mobile bottom actions jika sesuai
- table menjadi card/list pada layar kecil

---

# 28. Kiosk Behavior

Guest mode harus berjalan fullscreen.

Tidak boleh ada akses langsung ke:

- browser controls
- desktop
- developer tools
- settings aplikasi

Admin dapat keluar menggunakan mekanisme khusus seperti:

```text
Hidden admin gesture
→ Admin PIN
→ Control Panel
```

---

# 29. Design Tokens

Seluruh aplikasi menggunakan token bersama.

```text
colors
spacing
radius
shadow
typography
motion
z-index
breakpoints
```

Guest dan Admin boleh mempunyai density berbeda tetapi tidak boleh memiliki sistem visual yang saling bertentangan.

---

# 30. Component Groups

## Guest

```text
BoothShell
Branding
CameraViewport
Instruction
PrimaryCTA
Countdown
CaptureStatus
ProcessingState
ResultPreview
QRCode
SessionGalleryLink
```

## Admin

```text
AdminShell
Sidebar
TopBar
StatusCard
DeviceStatus
EventCard
SessionList
TemplateEditor
PropertyPanel
ConfirmDialog
Toast
```

---

# 31. Accessibility

Prioritas accessibility:

- kontras cukup
- ukuran teks dapat dibaca dari jarak booth
- touch target besar
- tidak bergantung pada warna saja untuk status
- focus state untuk keyboard/admin
- reduced motion bila pengguna/perangkat mengaktifkannya

Status gunakan kombinasi warna + ikon + label.

Contoh:

```text
● Connected
⚠ Needs attention
× Offline
```

---

# 32. Performance

Guest UI harus ringan karena selama event aplikasi berjalan terus-menerus.

Prioritas:

- minimalkan JavaScript yang tidak perlu
- lazy load editor/admin modules
- jangan memuat semua asset event sekaligus
- gunakan object URL untuk preview lokal
- jangan meng-upload original image sebelum dibutuhkan
- gunakan local processing untuk workflow normal
- hindari animasi berat

---

# 33. Prinsip Media Processing

Original file tidak boleh dioverwrite.

Struktur:

```text
session/
├── original/
├── processed/
└── output/
```

Contoh:

```text
original/01.jpg
processed/01.jpg
output/print.jpg
```

Ini memungkinkan retake, reprocessing, dan reprint tanpa mengambil foto ulang.

---

# 34. Design Direction

Arah visual utama:

> **Premium, clean, immersive, natural.**

Hindari:

- dashboard-like guest screen
- terlalu banyak card
- terlalu banyak border
- gradient berlebihan
- ikon kecil
- animasi berlebihan
- UI yang terasa seperti software teknis

Gunakan:

- whitespace yang cukup
- typography kuat
- camera preview dominan
- CTA besar
- visual event sebagai identitas
- motion singkat dan bermakna

---

# 35. Prinsip Utama

```text
THE BOOTH SHOULD FEEL LIKE A PRODUCT.
THE ADMIN SHOULD FEEL LIKE A WEB APP.
```

Guest datang untuk mengambil foto, bukan menggunakan software.

Admin datang untuk mengontrol software, bukan mengambil foto.

Karena itu kedua experience harus berbeda secara komposisi tetapi tetap konsisten melalui satu design system.

---

# 36. MVP Design Scope

### Guest

- [ ] Adaptive landscape/portrait welcome screen
- [ ] Camera viewport
- [ ] Start CTA
- [ ] Countdown
- [ ] Multiple capture state
- [ ] Processing state
- [ ] Result preview
- [ ] Print status
- [ ] QR/session access
- [ ] Kiosk mode

### Admin

- [ ] Dashboard
- [ ] Event configuration
- [ ] Camera status
- [ ] Printer status
- [ ] Session history
- [ ] Reprint
- [ ] Basic settings
- [ ] Basic template editor
- [ ] Responsive desktop/tablet/mobile layout

---

# 37. Kesimpulan

Aplikasi tidak menggunakan pendekatan **portrait-first** maupun **landscape-first**.

Pendekatan yang digunakan adalah:

> **Adaptive, camera-first, touch-first.**

Orientasi layar hanya memengaruhi komposisi layout. Camera viewport, CTA, branding, dan informasi utama akan disusun ulang berdasarkan ruang yang tersedia.

Dengan pendekatan ini, aplikasi dapat digunakan pada berbagai konfigurasi booth tanpa perlu membuat desain baru untuk setiap ukuran atau orientasi perangkat.

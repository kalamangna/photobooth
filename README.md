# RD Photobooth

Aplikasi Web Photobooth Modern berbasis Nuxt 4, Tailwind CSS, Pinia, dan IndexedDB lokal untuk operasional photobooth acara dan studio foto.

---

## 🚀 Fitur Utama

### 1. Guest Kiosk UI
* **Layar Awal**: Antarmuka interaktif responsif (portrait / landscape) dengan target sentuh ramah kiosk.
* **Pilihan Template**: Pemilihan bingkai foto (Strip 2×6 dan Grid 4×6) dengan pratinjau kanvas visual.
* **Sesi Pemotretan**: Hitung mundur (countdown 3s / 5s), shutter kamera interaktif, dan microcopy pemandu foto.
* **Hasil & Unduh**: Generator QR Code untuk unduhan langsung di smartphone tamu serta formulir pencatatan email cadangan.

### 2. Admin & Operator Control Center
* **Role-Based Access Control (RBAC)**:
  * **Operator** (PIN Default: `123456`): Mengakses Dashboard pemantauan, Konfigurasi Acara, Sesi Foto, dan Diagnostik Perangkat.
  * **Admin** (PIN Default: `888888`): Akses penuh termasuk Editor Template Kanvas, Pengaturan Keamanan PIN, dan Log Audit Sistem.
* **Dashboard Operasional**: Status booth online, pemantau perangkat (kamera & printer), statistik sesi dan cetak hari ini, serta reset booth remote.
* **Pengaturan Acara**: Konfigurasi nama acara, durasi countdown, template bawaan, otomasi cetak, dan efek audio.
* **Manajemen Sesi Foto**: Tabel Flowbite lengkap dengan filter rentang waktu, pratinjau resolusi tinggi, ekspor JSON, dan eksekusi cetak fisik.
* **Diagnostik Perangkat**: Pengujian kamera langsung (live viewfinder) dan uji cetak printer dengan pola kalibrasi 300 DPI.
* **Log Audit**: Riwayat jejak aktivitas sistem dan diagnosa error.

---

## 🛠️ Struktur Rute Aplikasi

| Rute | Peruntukan | Deskripsi |
| :--- | :--- | :--- |
| `/` | Tamu | Layar Utama Kiosk (Standby Screen) |
| `/setup` | Tamu | Pemilihan format template bingkai foto |
| `/session` | Tamu | Sesi pengambilan foto, pratinjau, QR unduh, & email backup |
| `/download/[id]` | Tamu | Halaman unduh foto sesi tamu via QR |
| `/admin` | Admin / Operator | Dashboard status operasional booth & quick actions |
| `/admin/event` | Admin / Operator | Konfigurasi identitas acara, countdown, & template default |
| `/admin/sessions` | Admin / Operator | Riwayat sesi foto, pencarian, cetak foto, & download |
| `/admin/devices` | Admin / Operator | Diagnostik & pengujian kamera/printer |
| `/admin/templates` | Admin | Pengelola dan visual editor template foto |
| `/admin/settings` | Admin | Pengaturan PIN keamanan dan pembersihan data |
| `/admin/logs` | Admin | Audit jejak log sistem dan error |

---

## 📦 Instalasi & Menjalankan Aplikasi

Pastikan Node.js (v18+) telah terpasang di sistem.

```bash
# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Build untuk produksi
npm run build
```

---

## 🔐 Keamanan & Autentikasi

Autentikasi panel admin menggunakan PIN 6-digit:
* **PIN Admin Default**: `888888`
* **PIN Operator Default**: `123456`

PIN dapat diperbarui kapan saja melalui menu **Pengaturan** oleh akun Admin.

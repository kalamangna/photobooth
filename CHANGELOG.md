# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

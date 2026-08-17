# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Halaman Pengaturan Sistem (`app/pages/admin/settings.vue`) dengan dukungan konfigurasi nama acara, alur pengambilan foto (countdown & jumlah foto), proteksi PIN Operator/Admin, dan pembersihan data.
- Dokumen perancangan antarmuka `DESIGN.md`.
- Dukungan autentikasi berbasis PIN sistem di admin.

### Changed
- Standardisasi dan perataan tata letak halaman admin (`max-w-7xl mx-auto`) dengan komponen UI yang konsisten.
- Penghapusan subjudul redundan dan frasa teknis yang tidak diperlukan oleh operator booth.
- Perombakan total halaman Galeri Sesi (`app/pages/gallery.vue`):
  - Penyesuaian filter bar responsif (pencarian ID sesi/acara/email, dropdown acara, dan tab tanggal).
  - Pembuatan ulang modal foto dengan layout 2-kolom lebar (`max-w-4xl`), showcase foto resolusi penuh, dan 3 tombol aksi utama (**Print**, **Download**, **Hapus**).
  - Penyederhanaan alur print foto (langsung 1 lembar tanpa stepper counter).
  - Standardisasi terminologi operasional (*"Print"*, *"Download"*, *"Hapus"*).
- Pembaruan daftar sesi di dasbor admin untuk menampilkan ID sesi secara konsisten.

### Fixed
- Perbaikan tag macro Vue yang terpotong pada galeri sesi.

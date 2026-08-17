# Photobooth Web — Architecture & MVP Specification

## 1. Tujuan

Membangun aplikasi photobooth berbasis web yang dapat berjalan lintas platform, dengan fokus awal pada **1 photobooth**. Aplikasi harus mampu mengendalikan kamera dan printer secara langsung, tetap dapat digunakan ketika internet tidak tersedia, dan mempunyai fondasi yang dapat dikembangkan menjadi platform multi-booth di tahap berikutnya.

Target platform:

- Windows
- macOS
- Linux
- Android/iPad untuk mode webcam/browser

Prinsip utama:

> **Web App menjadi core aplikasi. Hardware profesional diakses melalui Local Hardware Bridge.**

---

## 2. Prinsip Arsitektur

### 2.1 Web-first

UI, workflow, session, template, preview, gallery, dan sebagian besar business logic dibuat dengan teknologi web.

### 2.2 Local-first

Photobooth tidak boleh bergantung pada koneksi internet untuk menjalankan sesi foto dan mencetak hasil.

### 2.3 Hardware abstraction

Frontend tidak boleh mengetahui detail vendor kamera/printer. Semua perangkat diakses melalui service dan adapter.

### 2.4 Progressive capability

Aplikasi mendeteksi kemampuan perangkat. Webcam sederhana dapat berjalan tanpa bridge, sedangkan DSLR/mirrorless dan printer profesional menggunakan Local Hardware Bridge.

### 2.5 Single-booth first

Versi awal hanya mengelola satu booth. Struktur internal tetap dibuat agar nantinya dapat dikembangkan menjadi multi-device dan cloud management.

---

## 3. Arsitektur Sistem

```text
                         PHOTOBOOTH WEB APP
                    ┌─────────────────────────┐
                    │                         │
                    │ Nuxt / Vue / Tailwind  │
                    │                         │
                    │ Capture UI              │
                    │ Session                 │
                    │ Template                │
                    │ Preview                 │
                    │ Settings                │
                    │ Gallery                 │
                    │                         │
                    └────────────┬────────────┘
                                 │
                      WebSocket / localhost API
                                 │
                    ┌────────────▼────────────┐
                    │    LOCAL HARDWARE      │
                    │        BRIDGE          │
                    │                         │
                    │ Camera Service          │
                    │ Printer Service         │
                    │ Storage Service         │
                    │ Device Status           │
                    └────────────┬────────────┘
                                 │
                     ┌───────────┴───────────┐
                     │                       │
                  Camera                  Printer
```

### Mode 1 — Web-only

```text
Browser
   ↓
Web Media API
   ↓
Webcam
```

Digunakan ketika hanya diperlukan kamera yang dapat diakses langsung oleh browser.

### Mode 2 — Professional

```text
Browser
   ↓
WebSocket / localhost API
   ↓
Local Hardware Bridge
   ↓
Camera / Printer
```

Digunakan untuk DSLR, mirrorless, dan printer profesional yang memerlukan akses native.

---

## 4. Komponen Utama

```text
photobooth/
│
├── web/
│   ├── pages/
│   ├── components/
│   ├── composables/
│   ├── stores/
│   ├── services/
│   └── modules/
│
├── bridge/
│   ├── camera/
│   ├── printer/
│   ├── storage/
│   ├── websocket/
│   └── device/
│
├── docs/
│
└── README.md
```

---

## 5. Web Application

### Teknologi

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia
- IndexedDB

### Tanggung jawab

- UI photobooth
- workflow session
- countdown
- camera preview untuk webcam
- template editor
- image composition
- preview hasil
- print job creation
- session history
- settings UI
- komunikasi dengan Local Hardware Bridge
- local data persistence

---

## 6. Local Hardware Bridge

Local Hardware Bridge adalah service lokal yang berjalan pada komputer booth dan menjadi perantara antara Web App dengan perangkat hardware.

### Teknologi

Direkomendasikan:

- Rust
- WebSocket
- HTTP localhost API bila diperlukan

### Tanggung jawab

- mendeteksi hardware
- membuka koneksi perangkat
- menjalankan perintah kamera
- mengambil status kamera
- mengambil gambar dari kamera
- mengirim status printer
- menjalankan print job
- mengelola recovery hardware
- menyediakan event real-time ke Web App

### Contoh alamat

```text
HTTP  http://127.0.0.1:8765
WS    ws://127.0.0.1:8765/ws
```

Port dapat dibuat configurable.

---

## 7. Camera Architecture

Gunakan abstraction layer agar Web App tidak bergantung pada vendor tertentu.

```text
Camera Service
│
├── Browser Camera Adapter
├── Canon Adapter
├── Nikon Adapter
└── Sony Adapter
```

### Interface minimum

```text
connect()
disconnect()
getStatus()
getCapabilities()
startPreview()
stopPreview()
capture()
downloadPhoto()
getSettings()
setSettings()
recover()
```

### Camera capabilities

UI harus membaca capability perangkat terlebih dahulu.

Contoh:

```text
ISO               supported
Shutter Speed     supported
Aperture          supported
White Balance     supported
Focus Mode        supported
Live View         supported
Flash             supported
```

Fitur yang tidak didukung perangkat tidak boleh ditampilkan sebagai kontrol aktif.

### Target kontrol kamera

- connection
- live view
- capture
- ISO
- shutter speed
- aperture
- white balance
- focus mode
- image quality
- image format
- drive mode
- flash bila tersedia
- reconnect/recovery

### Catatan implementasi

Untuk kamera DSLR/mirrorless, implementasi adapter dapat menggunakan SDK/API resmi vendor atau backend seperti `libgphoto2` pada perangkat yang kompatibel. Dukungan fitur berbeda antar-model sehingga kompatibilitas harus diuji per kamera.

---

## 8. Printer Architecture

Printer juga menggunakan abstraction layer.

```text
Printer Service
│
├── Browser/System Print Adapter
├── Windows Printer Adapter
├── macOS Printer Adapter
└── Professional Printer Adapter
```

### Interface minimum

```text
detect()
connect()
disconnect()
getStatus()
getCapabilities()
print()
cancel()
recover()
```

### Printer information

- connected/disconnected
- ready/busy/error
- media/paper status bila dapat dibaca
- queue count
- printer name
- selected paper/profile

### Print workflow

```text
Output Image
    ↓
Create Print Job
    ↓
Queue
    ↓
Printer Service
    ↓
Hardware Bridge
    ↓
Printer
    ↓
Success / Failed
```

---

## 9. Print Queue

Printing harus asynchronous dan tidak boleh memblokir UI utama.

Status job:

```text
QUEUED
PRINTING
COMPLETED
FAILED
RETRYING
CANCELLED
```

Setiap job minimal menyimpan:

- id
- session_id
- file_path
- printer_id
- copies
- status
- created_at
- started_at
- completed_at
- error_message
- retry_count

---

## 10. Session Engine

Session adalah unit utama dari setiap aktivitas photobooth.

### State machine

```text
IDLE
 ↓
READY
 ↓
COUNTDOWN
 ↓
CAPTURE
 ↓
PROCESSING
 ↓
PREVIEW
 ↓
PRINT
 ↓
DONE
 ↓
READY
```

### Multiple photo session

Contoh tiga foto:

```text
READY
 ↓
COUNTDOWN
 ↓
PHOTO 01
 ↓
COUNTDOWN
 ↓
PHOTO 02
 ↓
COUNTDOWN
 ↓
PHOTO 03
 ↓
COMPOSE
 ↓
PREVIEW
 ↓
PRINT
```

Session harus dapat dipulihkan jika aplikasi mengalami crash atau perangkat restart.

---

## 11. Session Data

Contoh struktur:

```text
sessions/
└── YYYY-MM-DD/
    └── SESSION-ID/
        ├── original/
        │   ├── 01.jpg
        │   ├── 02.jpg
        │   └── 03.jpg
        │
        ├── processed/
        │
        ├── output/
        │   ├── print.jpg
        │   └── digital.jpg
        │
        └── session.json
```

Original image tidak boleh ditimpa oleh hasil processing.

---

## 12. Template Engine

Template awal menggunakan canvas berbasis JSON.

Contoh:

```json
{
  "canvas": {
    "width": 1800,
    "height": 1200
  },
  "elements": [
    {
      "type": "photo",
      "slot": 1,
      "x": 50,
      "y": 50,
      "width": 850,
      "height": 500
    },
    {
      "type": "text",
      "text": "Happy Wedding",
      "x": 100,
      "y": 1000
    },
    {
      "type": "image",
      "asset": "logo.png",
      "x": 1500,
      "y": 1050,
      "width": 200,
      "height": 100
    }
  ]
}
```

### Element minimum

- photo
- text
- image
- shape

### Template editor

Editor harus mendukung minimal:

- drag
- resize
- position
- alignment
- text editing
- image asset
- layer ordering
- duplication
- delete

Tidak perlu menjadi clone Canva pada MVP.

---

## 13. Image Processing

Processing dilakukan secara lokal sebanyak mungkin.

```text
Camera
 ↓
Original
 ↓
Crop / Resize
 ↓
Template Composition
 ↓
Output
```

Output minimum:

- print.jpg
- digital.jpg
- preview.jpg

Original tetap dipertahankan.

---

## 14. UI Photobooth

UI publik harus sederhana dan touch-friendly.

### Welcome

```text
┌──────────────────────────────────────┐
│              LOGO                    │
│                                      │
│          Capture Your Moment         │
│                                      │
│           [ MULAI FOTO ]             │
│                                      │
└──────────────────────────────────────┘
```

### Capture

```text
┌──────────────────────────────────────┐
│                                      │
│            CAMERA PREVIEW            │
│                                      │
│                  3                   │
│                                      │
├──────────────────────────────────────┤
│ ISO 400 | 1/125 | F4 | AWB          │
└──────────────────────────────────────┘
```

### Result

```text
┌──────────────────────────────────────┐
│                                      │
│              PHOTO READY             │
│                                      │
│           [ PREVIEW ]                │
│                                      │
│           [ PRINT ]                  │
│                                      │
└──────────────────────────────────────┘
```

---

## 15. Admin/Operator Mode

UI publik harus dipisahkan dari UI operator.

Akses dapat menggunakan hidden gesture + PIN.

Contoh:

```text
Tap 5x pojok kiri atas
        ↓
Admin PIN
        ↓
Operator Panel
```

### Operator panel

```text
BOOTH CONTROL

Camera      CONNECTED
Printer     READY
Storage     82 GB FREE
Template    Classic 2x6
Sessions    27
```

Tindakan:

- test camera
- test printer
- reprint
- session history
- settings
- logs
- restart/reconnect device

---

## 16. Local Database

Gunakan IndexedDB pada Web App.

Entity minimum:

```text
settings
cameras
printers
templates
sessions
session_photos
print_jobs
system_logs
```

IndexedDB menjadi storage utama untuk mode lokal.

---

## 17. Communication Protocol

Web App dan Bridge berkomunikasi melalui WebSocket untuk event real-time.

### Command example

```json
{
  "id": "cmd-001",
  "type": "camera.capture",
  "payload": {}
}
```

### Response example

```json
{
  "id": "cmd-001",
  "success": true,
  "data": {
    "file": "/local/session/000124/original/01.jpg"
  }
}
```

### Event example

```json
{
  "event": "printer.status",
  "data": {
    "status": "ready"
  }
}
```

Event harus mendukung minimal:

```text
camera.connected
camera.disconnected
camera.status
camera.preview
camera.capture.started
camera.capture.completed
camera.error
printer.connected
printer.disconnected
printer.status
printer.job.started
printer.job.completed
printer.error
bridge.error
```

---

## 18. Offline Requirement

Internet bukan requirement untuk:

- membuka aplikasi
- mengambil foto
- mengolah foto
- menyimpan session
- mencetak
- melihat session history
- melakukan reprint

Internet hanya menjadi kebutuhan opsional untuk fitur cloud di masa depan.

---

## 19. Security

Local Bridge harus menerima koneksi secara terbatas.

Minimum:

- bind ke `127.0.0.1` secara default
- origin validation
- token/session authentication antara browser dan bridge
- hanya expose command yang diperlukan
- jangan expose bridge ke jaringan publik secara default
- validasi seluruh command dan payload
- logging untuk command hardware

Contoh:

```text
Browser
   ↓
Origin Check
   ↓
Bridge Token
   ↓
Command Validation
   ↓
Hardware
```

---

## 20. Reliability

Photobooth harus dirancang untuk operasi panjang dan kondisi event.

### Camera recovery

Jika kamera disconnect:

```text
DISCONNECTED
 ↓
RECONNECTING
 ↓
CONNECTED
```

Jika gagal:

```text
RECONNECTING
 ↓
FAILED
 ↓
Operator Alert
```

### Printer recovery

```text
PRINTING
 ↓
ERROR
 ↓
RETRY
 ↓
PRINTING
```

Job yang gagal tidak boleh hilang.

---

## 21. Logging

Setiap operasi penting dicatat.

Contoh:

```text
2026-08-16 00:15:02 camera.connected
2026-08-16 00:15:11 session.started
2026-08-16 00:15:15 camera.capture.completed
2026-08-16 00:15:20 template.render.completed
2026-08-16 00:15:22 print.started
2026-08-16 00:15:28 print.completed
```

Log harus menyimpan:

- timestamp
- level
- module
- event
- message
- metadata

---

## 22. MVP Scope

### Wajib

#### Web App

- [ ] Nuxt 4 + Vue 3 + TypeScript
- [ ] Tailwind CSS
- [ ] fullscreen mode
- [ ] touch-friendly UI
- [ ] session state machine
- [ ] IndexedDB

#### Camera

- [ ] webcam support
- [ ] professional camera adapter architecture
- [ ] detection
- [ ] connection
- [ ] live view
- [ ] capture
- [ ] settings
- [ ] image download
- [ ] reconnect

#### Photo

- [ ] countdown
- [ ] multiple shots
- [ ] preview
- [ ] retake
- [ ] local storage

#### Template

- [ ] photo slot
- [ ] text
- [ ] image
- [ ] shape
- [ ] composition
- [ ] export

#### Printer

- [ ] detection
- [ ] status
- [ ] print
- [ ] queue
- [ ] retry
- [ ] reprint

#### Operator

- [ ] admin PIN
- [ ] camera test
- [ ] printer test
- [ ] session history
- [ ] logs

### Belum termasuk

- cloud dashboard
- login/account
- multi-booth
- QRIS
- WhatsApp
- AI
- subscription
- template marketplace
- analytics online

---

## 23. Development Order

### Phase 1 — Web Core

1. Nuxt project
2. Tailwind
3. Application shell
4. fullscreen/kiosk UI
5. IndexedDB
6. session state machine

### Phase 2 — Webcam

1. camera permission
2. preview
3. capture
4. countdown
5. multiple shots
6. image processing

### Phase 3 — Template

1. canvas model
2. photo slot
3. text
4. image
5. editor
6. render output

### Phase 4 — Hardware Bridge

1. Rust bridge
2. WebSocket server
3. browser authentication
4. device discovery
5. camera adapter
6. printer adapter

### Phase 5 — Professional Camera

1. connect/disconnect
2. status
3. live view
4. camera settings
5. capture
6. image transfer
7. recovery

### Phase 6 — Printer

1. detect
2. status
3. queue
4. print
5. retry
6. reprint
7. error recovery

### Phase 7 — Production Hardening

1. auto-start
2. crash recovery
3. device reconnect
4. persistent logs
5. performance testing
6. long-running event testing

---

## 24. Future Extension

Arsitektur harus tetap memungkinkan penambahan:

```text
Cloud API
   ↓
Organization
   ↓
Multiple Booths
   ↓
Remote Monitoring
   ↓
Gallery
   ↓
QRIS
   ↓
WhatsApp
   ↓
AI Portrait
   ↓
Analytics
```

Namun seluruh fitur tersebut tidak menjadi dependency untuk MVP single-booth.

---

## 25. Keputusan Arsitektur Final

Untuk versi awal:

```text
Frontend       : Nuxt 4 + Vue 3 + TypeScript
Styling        : Tailwind CSS
Local Storage  : IndexedDB
Hardware       : Local Hardware Bridge
Bridge         : Rust
Protocol       : WebSocket + localhost API
Camera         : Web Media API + Camera Adapter
Printer        : Printer Adapter
Cloud          : Tidak diperlukan pada MVP
Mode           : Offline-first
Target         : 1 Photobooth
```

### Prinsip utama

> **Satu Web App, satu Local Hardware Bridge, satu booth.**
>
> **Browser menangani experience. Bridge menangani hardware.**

Arsitektur ini mempertahankan pendekatan web-first dan multiplatform tanpa mengorbankan kebutuhan akses kamera dan printer profesional.

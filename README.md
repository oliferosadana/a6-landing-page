# Amanda Brownies Kalimantan - Landing Page & CMS Admin

Aplikasi web modern, ultra-cepat, dan terpadu untuk ekosistem **Landing Page Publik** dan **Panel CMS Pengelolaan Cabang Outlet**.

---

## 🌟 Fitur Utama & Struktur Halaman

| Halaman | File | Deskripsi & Hak Akses |
| :--- | :--- | :--- |
| **Landing Page Publik** | [`index.html`](./index.html) | Katalog menu realtime 2-kolom mobile, flyer promo 4:5 dengan lightbox zoom, floating WhatsApp speed dial (Kerjasama, Reseller, Komplain), dan outlet locator. |
| **Panel CMS Cabang** | [`admin.html`](./admin.html) | Panel khusus admin untuk mengelola katalog menu, stok outlet, flyer promo 4:5, price list, kategori wilayah, running promo ticker, dan sinkronisasi Supabase. |
| **Login Portal** | [`login.html`](./login.html) | Otentikasi aman terintegrasi Supabase Auth & Session Guard untuk akses ke panel CMS. |

---

## 🚀 Panduan Menjalankan Secara Lokal

1. **Jalankan web server lokal:**
   ```bash
   npm start
   # atau menggunakan serve:
   # npx serve . -l 3000
   ```
2. **Buka di browser:**
   - Website Publik: `http://localhost:3000/`
   - Login CMS: `http://localhost:3000/login.html`
   - Panel CMS Admin: `http://localhost:3000/admin.html`

---

## 📁 Struktur Direktori Proyek

```text
amanda-brownies-landing/
├── assets/                  # Aset gambar, logo, flyer promo 4:5, foto menu & outlet
├── css/                     # Seluruh file stylesheet modular
│   ├── style.css            # Desain landing page & floating WhatsApp speed dial
│   ├── admin.css            # Desain panel CMS Cabang
│   └── login.css            # Desain antarmuka login CMS
├── js/                      # Seluruh file logika JavaScript modular
│   ├── app.js               # Interaksi landing page, katalog menu, speed dial WhatsApp
│   ├── admin.js             # Logika CMS (CRUD promo, produk, outlet, ticker, categories)
│   ├── auth.js              # Otentikasi berlapis, session guard & logout
│   ├── data.js              # Dataset master & sinkronisasi state
│   └── supabase.js          # Integrasi backend realtime Supabase
├── sql/                     # Skrip database & schema PostgreSQL
│   └── supabase_schema.sql  # Schema tabel, RLS policy & realtime publication
├── index.html               # Halaman utama landing page publik
├── admin.html               # Halaman CMS Outlet Balikpapan
└── login.html               # Halaman login CMS
```

---

## 🎨 Palet Warna & Desain (Color Hunt Luxury)
- **Primary Cream**: `#F5EFE3`
- **Dark Olive**: `#4F5B2A` & `#222910`
- **Accent Gold**: `#B8892D`
- **Soft Sand**: `#D8C9A8`
- **Text Main**: `#231B14`

# Amanda Brownies Platform - WaaS & Multi-Tenant CMS

Aplikasi web modern, ultra-cepat, dan terpadu untuk ekosistem **Landing Page Publik**, **Panel CMS Pengelolaan Cabang Outlet**, **Portal Sewa Sistem (WaaS)**, dan **Dashboard Superadmin Platform**.

---

## 🌟 Fitur Utama & Struktur Halaman

| Halaman | File | Deskripsi & Hak Akses |
| :--- | :--- | :--- |
| **Landing Page Publik** | [`index.html`](./index.html) | Katalog menu realtime, flyer promo 4:5 dengan lightbox zoom, locator 6 cabang & booth Balikpapan, dan WhatsApp checkout. |
| **Panel CMS Cabang** | [`admin.html`](./admin.html) | Panel khusus admin cabang/tenant untuk mengelola menu, flyer 4:5, price list, stok 6 outlet, marquee ticker, dan memantau masa sewa cabang. |
| **Portal Sewa & Checkout** | [`billing.html`](./billing.html) | Portal pemesanan sewa sistem dengan pilihan siklus **Bulanan & Tahunan**, formulir identitas penyewa, dan metode pembayaran QRIS/Bank. |
| **Lembar Invoice Digital** | [`invoice.html`](./invoice.html) | Tampilan invoice minimalis, informatif, dan print-ready (Cetak/PDF A4) dengan 1-klik salin rekening/nominal & tombol verifikasi lunas. |
| **Superadmin Platform** | [`superadmin.html`](./superadmin.html) | Dashboard pusat pemilik platform untuk mengontrol seluruh penyewa (multi-tenant), metrik keuangan (MRR & omzet), 1-klik persetujuan invoice, dan master tarif. |

---

## 🚀 Panduan Menjalankan Secara Lokal

1. **Jalankan web server lokal:**
   ```bash
   npm start
   # atau menggunakan python:
   # python -m http.server 3000
   ```
2. **Buka di browser:**
   - Website Utama: `http://localhost:3000/`
   - Superadmin Platform: `http://localhost:3000/superadmin.html`
   - Panel CMS Cabang: `http://localhost:3000/admin.html`
   - Portal Sewa Sistem: `http://localhost:3000/billing.html`

---

## 🌐 Panduan Deployment ke Produksi

### Opsi 1: Vercel (Rekomendasi - 1 Klik Deploy)
1. Hubungkan repository GitHub ke [Vercel](https://vercel.com).
2. Konfigurasi otomatis terdeteksi via file [`vercel.json`](./vercel.json).
3. Klik **Deploy**.

### Opsi 2: Netlify
1. Drag & drop folder project atau hubungkan Git ke [Netlify](https://netlify.com).
2. Konfigurasi otomatis terdeteksi via file [`netlify.toml`](./netlify.toml).

### Opsi 3: VPS Linux / Ubuntu (Nginx)
1. Copy seluruh isi folder project ke directory `/var/www/amanda-brownies-landing`.
2. Gunakan konfigurasi Nginx yang telah disediakan di file [`nginx.conf`](./nginx.conf).
3. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### Opsi 4: cPanel / Shared Hosting
1. Kompres seluruh file menjadi `.zip`.
2. Unggah dan ekstrak ke folder `public_html` di cPanel File Manager.

---

## 🎨 Palet Warna & Desain (Color Hunt Luxury)
- **Primary Cream**: `#F5EFE3`
- **Dark Olive**: `#4F5B2A` & `#222910`
- **Accent Gold**: `#B8892D`
- **Soft Sand**: `#D8C9A8`
- **Text Main**: `#231B14`

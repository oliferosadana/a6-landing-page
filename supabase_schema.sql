-- ===================================================================
-- AMANDA BROWNIES WAAS & CMS - SUPABASE DATABASE SCHEMA
-- Jalankan query ini di SQL Editor dashboard project Supabase Anda.
-- ===================================================================

-- 1. TABEL PENYEWA PLATFORM (TENANTS)
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    domain TEXT NOT NULL,
    plan_id TEXT NOT NULL DEFAULT 'plan-6m',
    plan_name TEXT NOT NULL DEFAULT 'Paket Bisnis (6 Bulan)',
    cycle TEXT NOT NULL DEFAULT 'monthly',
    status TEXT NOT NULL DEFAULT 'active', -- active, pending, expired, suspended
    start_date DATE DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL,
    total_paid NUMERIC(12, 2) DEFAULT 0,
    outlets_count INT DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL KATALOG MENU PRODUK (PRODUCTS)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- kukus, bakar, marble
    price NUMERIC(12, 2) NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    badge TEXT,
    best_seller BOOLEAN DEFAULT FALSE,
    stocks JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL FLYER PROMO 4:5 (PROMOS)
CREATE TABLE IF NOT EXISTS public.promos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    badge TEXT,
    badge_color TEXT DEFAULT 'gold',
    image TEXT NOT NULL,
    period TEXT,
    description TEXT,
    wa_msg TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL CABANG OUTLET & BOOTH (OUTLETS)
CREATE TABLE IF NOT EXISTS public.outlets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT DEFAULT 'Kota Balikpapan',
    image TEXT,
    address TEXT NOT NULL,
    phone TEXT,
    wa TEXT NOT NULL,
    hours TEXT NOT NULL,
    maps_url TEXT,
    distance TEXT,
    booths JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4B. TABEL KATEGORI / WILAYAH OUTLET (OUTLET_CATEGORIES)
CREATE TABLE IF NOT EXISTS public.outlet_categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    region TEXT DEFAULT 'Kota Balikpapan',
    icon TEXT DEFAULT 'fa-solid fa-location-dot',
    badge_color TEXT DEFAULT 'olive',
    description TEXT,
    status TEXT DEFAULT 'active',
    sort_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL RUNNING TICKER PENGUMUMAN (TICKER)
CREATE TABLE IF NOT EXISTS public.ticker (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    icon TEXT DEFAULT 'fa-solid fa-bullhorn',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL INVOICE TRANSAKSI GLOBAL (INVOICES)
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    tenant_name TEXT NOT NULL,
    tenant_phone TEXT,
    tenant_email TEXT,
    tenant_domain TEXT,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    duration_months INT DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL,
    unique_code INT DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method_id TEXT,
    payment_method_name TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, EXPIRED, CANCELLED
    paid_at TIMESTAMPTZ
);

-- 7. TABEL PENGATURAN PLATFORM (SETTINGS)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Aktifkan RLS dengan akses publik anon untuk prototype/production
-- ===================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlet_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Izinkan SELECT / INSERT / UPDATE / DELETE untuk Anon Key (Frontend Web)
CREATE POLICY "Public full access to tenants" ON public.tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to promos" ON public.promos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to outlets" ON public.outlets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to outlet_categories" ON public.outlet_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to ticker" ON public.ticker FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to settings" ON public.platform_settings FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outlets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outlet_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticker;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;

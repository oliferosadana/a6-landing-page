/**
 * AMANDA BROWNIES - SUPABASE DATABASE CLIENT & CLOUD DATA ENGINE
 * Direct PostgreSQL cloud synchronization with Realtime Postgres changes.
 */

const SUPABASE_CONFIG_STORAGE_KEY = 'amanda_supabase_config';

// Active Supabase Cloud Project Configuration
const DEFAULT_SUPABASE_URL = 'https://ffzzlertrzfrpuhbspws.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_64yf0NZHiOLEylWhspci4A_EaOWuVyB';

let supabaseConfig = {
  url: DEFAULT_SUPABASE_URL,
  key: DEFAULT_SUPABASE_KEY,
  enabled: true
};

let supabaseClient = null;
let isInitialSupabaseSyncDone = false;

// Initialize Supabase immediately
(function initSupabaseModule() {
  loadSupabaseConfig();
  if (supabaseConfig.url && supabaseConfig.key && supabaseConfig.enabled) {
    createSupabaseClient();
  }
})();

/**
 * Load Supabase configuration
 */
function loadSupabaseConfig() {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (raw) {
      supabaseConfig = JSON.parse(raw);
      if (!supabaseConfig.url) supabaseConfig.url = DEFAULT_SUPABASE_URL;
      if (!supabaseConfig.key) supabaseConfig.key = DEFAULT_SUPABASE_KEY;
    } else {
      supabaseConfig = {
        url: DEFAULT_SUPABASE_URL,
        key: DEFAULT_SUPABASE_KEY,
        enabled: true
      };
    }
  } catch (e) {
    console.warn('Error reading Supabase config:', e);
  }
}

/**
 * Save Supabase configuration
 */
function saveSupabaseConfig(url, key, enabled = true) {
  supabaseConfig = {
    url: url.trim(),
    key: key.trim(),
    enabled: enabled
  };
  localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(supabaseConfig));
  if (enabled && supabaseConfig.url && supabaseConfig.key) {
    createSupabaseClient();
    pullAllDataFromSupabase();
  } else {
    supabaseClient = null;
  }
  updateSupabaseStatusIndicator();
}

/**
 * Create official Supabase client instance
 */
function createSupabaseClient() {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    try {
      supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      console.log('⚡ Connected directly to Supabase Cloud Database:', supabaseConfig.url);
      initSupabaseRealtime();
      pullAllDataFromSupabase();
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      supabaseClient = null;
    }
  } else {
    // Wait for Supabase CDN script to load
    window.addEventListener('load', () => {
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        try {
          supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.key, {
            auth: {
              persistSession: true,
              autoRefreshToken: true
            }
          });
          console.log('⚡ Supabase client initialized on window load');
          initSupabaseRealtime();
          pullAllDataFromSupabase();
          updateSupabaseStatusIndicator();
        } catch (e) {
          console.error('Failed to init Supabase:', e);
        }
      }
    });
  }
}

/**
 * Check if Supabase client is active and configured
 */
function isSupabaseActive() {
  return !!(supabaseClient && supabaseConfig.enabled && supabaseConfig.url && supabaseConfig.key);
}

/**
 * Test Supabase Connection Health
 */
async function testSupabaseConnection(url, key) {
  if (!url || !key) return { success: false, message: 'URL dan Anon Key harus diisi.' };

  if (typeof supabase === 'undefined' || !supabase.createClient) {
    return { success: false, message: 'Supabase JS Library belum termuat.' };
  }

  try {
    const testClient = supabase.createClient(url.trim(), key.trim());
    const { data, error } = await testClient.from('outlets').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message || 'Gagal terhubung ke Supabase.' };
    }
    return { success: true, message: 'Berhasil terhubung langsung ke Supabase PostgreSQL!' };
  } catch (err) {
    return { success: false, message: err.message || 'Koneksi error.' };
  }
}

let isCurrentlyPulling = false;

/**
 * PULL ALL DATA DIRECTLY FROM SUPABASE POSTGRESQL
 */
async function pullAllDataFromSupabase() {
  if (!isSupabaseActive() || isCurrentlyPulling) return false;

  try {
    isCurrentlyPulling = true;
    console.log('📥 Mengambil data langsung dari Supabase Cloud Database...');

    // 1. Fetch Outlets & Booths
    const { data: dbOutlets, error: errOut } = await supabaseClient
      .from('outlets')
      .select('*')
      .order('id', { ascending: true });

    if (!errOut && dbOutlets) {
      if (dbOutlets.length > 0) {
        AMANDA_OUTLETS = dbOutlets.map(o => ({
          id: o.id,
          name: o.name,
          city: o.city,
          region: o.region || 'Kota Balikpapan',
          image: o.image,
          address: o.address,
          phone: o.phone,
          wa: o.wa,
          hours: o.hours,
          mapsUrl: o.maps_url || o.mapsUrl || '',
          distance: o.distance || '1.0 km',
          booths: Array.isArray(o.booths) ? o.booths : (typeof o.booths === 'string' ? JSON.parse(o.booths) : [])
        }));
        saveStoredData('amanda_outlets', AMANDA_OUTLETS, false);
      } else {
        // Table empty -> Seed initial outlets to Supabase
        console.log('🌱 Tabel outlets kosong di Supabase. Melakukan auto-seed...');
        await seedDefaultDataToSupabase('outlets');
      }
    }

    // 1B. Fetch Outlet Categories / Wilayah
    const { data: dbOutletCats, error: errOutletCat } = await supabaseClient
      .from('outlet_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!errOutletCat && dbOutletCats) {
      if (dbOutletCats.length > 0) {
        AMANDA_OUTLET_CATEGORIES = dbOutletCats.map(c => ({
          id: c.id,
          slug: c.slug || c.id,
          name: c.name,
          region: c.region || 'Kota Balikpapan',
          icon: c.icon || 'fa-solid fa-location-dot',
          badgeColor: c.badge_color || c.badgeColor || 'olive',
          description: c.description || '',
          status: c.status || 'active',
          sortOrder: Number(c.sort_order) || 1
        }));
        saveStoredData('amanda_outlet_categories', AMANDA_OUTLET_CATEGORIES, false);
      } else {
        await seedDefaultDataToSupabase('outlet_categories');
      }
    }

    // 2. Fetch Products & Stocks
    const { data: dbProducts, error: errProd } = await supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (!errProd && dbProducts) {
      if (dbProducts.length > 0) {
        AMANDA_PRODUCTS = dbProducts.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          categoryLabel: p.category_label || (p.category === 'kukus' ? 'Brownies Kukus' : (p.category === 'bakar' ? 'Brownies Bakar' : 'Premium & Marble')),
          price: Number(p.price) || 0,
          description: p.description || '',
          image: p.image,
          badge: p.badge || '',
          badgeColor: p.badge_color || (p.category === 'bakar' ? 'bakar' : (p.category === 'marble' ? 'coffee' : 'gold')),
          weight: p.weight || '700 gram',
          shelfLife: p.shelf_life || p.shelfLife || '4 Hari (Suhu Ruang)',
          outlets: Array.isArray(p.stocks) ? p.stocks : (Array.isArray(p.outlets) ? p.outlets : [])
        }));
        saveStoredData('amanda_products', AMANDA_PRODUCTS, false);
      } else {
        console.log('🌱 Tabel products kosong di Supabase. Melakukan auto-seed...');
        await seedDefaultDataToSupabase('products');
      }
    }

    // 3. Fetch Promos
    const { data: dbPromos, error: errPromo } = await supabaseClient
      .from('promos')
      .select('*')
      .order('id', { ascending: true });

    if (!errPromo && dbPromos) {
      if (dbPromos.length > 0) {
        AMANDA_PROMOS = dbPromos.map(pr => ({
          id: pr.id,
          title: pr.title,
          badge: pr.badge,
          badgeColor: pr.badge_color || pr.badgeColor || 'gold',
          image: pr.image,
          period: pr.period,
          description: pr.description,
          waMessage: pr.wa_msg || pr.waMessage || '',
          aspectRatio: "4/5",
          active: true
        }));
        saveStoredData('amanda_promos', AMANDA_PROMOS, false);
      } else {
        await seedDefaultDataToSupabase('promos');
      }
    }

    // 4. Fetch Ticker
    const { data: dbTicker, error: errTick } = await supabaseClient
      .from('ticker')
      .select('*')
      .order('id', { ascending: true });

    if (!errTick && dbTicker) {
      if (dbTicker.length > 0) {
        AMANDA_TICKER = dbTicker.map(t => ({
          id: t.id,
          title: t.title,
          text: t.text,
          icon: t.icon || 'fa-solid fa-bullhorn'
        }));
        saveStoredData('amanda_ticker', AMANDA_TICKER, false);
      } else {
        await seedDefaultDataToSupabase('ticker');
      }
    }

    // 5. Fetch Tenants
    const { data: dbTenants, error: errTen } = await supabaseClient
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (!errTen && dbTenants) {
      if (dbTenants.length > 0) {
        const tenants = dbTenants.map(tn => ({
          id: tn.id,
          name: tn.name,
          city: tn.city,
          phone: tn.phone,
          email: tn.email,
          domain: tn.domain,
          planId: tn.plan_id || tn.planId || 'plan-6m',
          planName: tn.plan_name || tn.planName || 'Paket Bisnis (6 Bulan)',
          cycle: tn.cycle || 'monthly',
          status: tn.status || 'active',
          startDate: tn.start_date || tn.startDate,
          expiresAt: tn.expires_at || tn.expiresAt,
          totalPaid: Number(tn.total_paid) || Number(tn.totalPaid) || 0,
          outletsCount: tn.outlets_count || tn.outletsCount || 1,
          notes: tn.notes || ''
        }));
        saveTenants(tenants, false);
      } else {
        await seedDefaultDataToSupabase('tenants');
      }
    }

    // 6. Fetch Invoices
    const { data: dbInvoices, error: errInv } = await supabaseClient
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (!errInv && dbInvoices && dbInvoices.length > 0) {
      const invoices = dbInvoices.map(inv => ({
        id: inv.id,
        date: inv.created_at ? inv.created_at.substring(0, 10) : '2026-09-01',
        dueDate: inv.due_date ? inv.due_date.substring(0, 10) : '2026-09-04',
        tenantName: inv.tenant_name,
        tenantPhone: inv.tenant_phone,
        tenantEmail: inv.tenant_email,
        tenantDomain: inv.tenant_domain,
        planId: inv.plan_id,
        planName: inv.plan_name,
        durationMonths: inv.duration_months || 1,
        subtotal: Number(inv.subtotal) || 0,
        uniqueCode: inv.unique_code || 0,
        totalAmount: Number(inv.total_amount) || 0,
        paymentMethodId: inv.payment_method_id,
        paymentMethodName: inv.payment_method_name,
        status: inv.status || 'PENDING',
        paidAt: inv.paid_at || null
      }));
      saveInvoiceHistory(invoices, false);
    }

    isInitialSupabaseSyncDone = true;
    notifyAmandaDataChanged();
    console.log('✅ Data berhasil dimuat langsung dari Supabase PostgreSQL!');
    return true;
  } catch (err) {
    console.error('Error fetching data from Supabase:', err);
    return false;
  } finally {
    isCurrentlyPulling = false;
  }
}

/**
 * PUSH DATA DIRECTLY TO SUPABASE POSTGRESQL
 */
async function pushToSupabase(tableName, payload, operation = 'upsert') {
  if (!isSupabaseActive()) return null;

  try {
    if (operation === 'delete') {
      const deleteId = typeof payload === 'object' ? payload.id : payload;
      if (!deleteId) return null;
      const { data, error } = await supabaseClient.from(tableName).delete().eq('id', deleteId);
      if (error) {
        console.warn(`Supabase delete [${tableName}] error:`, error.message);
      } else {
        console.log(`🗑️ Supabase item [${deleteId}] berhasil dihapus dari tabel [${tableName}]`);
      }
      return data;
    }

    let dbPayload = payload;

    // Transform Javascript models to PostgreSQL columns
    if (tableName === 'outlets') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map(o => ({
        id: o.id,
        name: o.name,
        city: o.city,
        region: o.region || 'Kota Balikpapan',
        image: o.image,
        address: o.address,
        phone: o.phone || '',
        wa: o.wa,
        hours: o.hours,
        maps_url: o.mapsUrl || o.maps_url || '',
        distance: o.distance || '1.0 km',
        booths: o.booths || []
      }));
    } else if (tableName === 'products') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price) || 0,
        description: p.description || '',
        image: p.image,
        badge: p.badge || '',
        stocks: p.outlets || p.stocks || []
      }));
    } else if (tableName === 'promos') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map(pr => ({
        id: pr.id,
        title: pr.title,
        badge: pr.badge,
        badge_color: pr.badgeColor || pr.badge_color || 'gold',
        image: pr.image,
        period: pr.period,
        description: pr.description || '',
        wa_msg: pr.waMessage || pr.wa_msg || ''
      }));
    } else if (tableName === 'outlet_categories') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map((c, idx) => ({
        id: c.id || ('cat-' + Date.now() + '-' + idx),
        slug: c.slug || c.id || ('cat-' + idx),
        name: c.name,
        region: c.region || 'Kota Balikpapan',
        icon: c.icon || 'fa-solid fa-location-dot',
        badge_color: c.badgeColor || c.badge_color || 'olive',
        description: c.description || '',
        status: c.status || 'active',
        sort_order: Number(c.sortOrder || c.sort_order) || (idx + 1)
      }));
    } else if (tableName === 'ticker') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map((t, idx) => ({
        id: t.id || ('tick-' + (idx + 1)),
        title: t.title,
        text: t.text,
        icon: t.icon || 'fa-solid fa-bullhorn'
      }));
    } else if (tableName === 'tenants') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map(tn => ({
        id: tn.id,
        name: tn.name,
        city: tn.city,
        phone: tn.phone,
        email: tn.email,
        domain: tn.domain,
        plan_id: tn.planId || tn.plan_id,
        plan_name: tn.planName || tn.plan_name,
        cycle: tn.cycle || 'monthly',
        status: tn.status || 'active',
        start_date: tn.startDate || tn.start_date || '2026-09-01',
        expires_at: tn.expiresAt || tn.expires_at || '2027-03-01',
        total_paid: Number(tn.totalPaid) || Number(tn.total_paid) || 0,
        outlets_count: tn.outletsCount || tn.outlets_count || 1,
        notes: tn.notes || ''
      }));
    } else if (tableName === 'invoices') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map(inv => ({
        id: inv.id,
        tenant_name: inv.tenantName || inv.tenant_name,
        tenant_phone: inv.tenantPhone || inv.tenant_phone,
        tenant_email: inv.tenantEmail || inv.tenant_email,
        tenant_domain: inv.tenantDomain || inv.tenant_domain,
        plan_id: inv.planId || inv.plan_id,
        plan_name: inv.planName || inv.plan_name,
        duration_months: inv.durationMonths || inv.duration_months || 1,
        subtotal: Number(inv.subtotal) || 0,
        unique_code: inv.uniqueCode || inv.unique_code || 0,
        total_amount: Number(inv.totalAmount) || Number(inv.total_amount) || 0,
        payment_method_id: inv.paymentMethodId || inv.payment_method_id,
        payment_method_name: inv.paymentMethodName || inv.payment_method_name,
        status: inv.status || 'PENDING',
        paid_at: inv.paidAt || inv.paid_at || null
      }));
    }

    const { data, error } = await supabaseClient.from(tableName).upsert(dbPayload);
    if (error) {
      console.warn(`Supabase upsert [${tableName}] warning:`, error.message);
    } else {
      console.log(`☁️ Supabase [${tableName}] berhasil di-update secara realtime!`);
    }
    return data;
  } catch (e) {
    console.warn(`Supabase sync failed for ${tableName}:`, e);
  }
  return null;
}

/**
 * Initial Auto-Seed default data to Supabase if tables are fresh
 */
async function seedDefaultDataToSupabase(specificTable = null) {
  if (!isSupabaseActive()) return;

  try {
    if (!specificTable || specificTable === 'outlets') {
      if (typeof DEFAULT_OUTLETS !== 'undefined' && DEFAULT_OUTLETS.length > 0) {
        await pushToSupabase('outlets', DEFAULT_OUTLETS);
      }
    }
    if (!specificTable || specificTable === 'outlet_categories') {
      if (typeof DEFAULT_OUTLET_CATEGORIES !== 'undefined' && DEFAULT_OUTLET_CATEGORIES.length > 0) {
        await pushToSupabase('outlet_categories', DEFAULT_OUTLET_CATEGORIES);
      }
    }
    if (!specificTable || specificTable === 'products') {
      if (typeof DEFAULT_PRODUCTS !== 'undefined' && DEFAULT_PRODUCTS.length > 0) {
        await pushToSupabase('products', DEFAULT_PRODUCTS);
      }
    }
    if (!specificTable || specificTable === 'promos') {
      if (typeof DEFAULT_PROMOS !== 'undefined' && DEFAULT_PROMOS.length > 0) {
        await pushToSupabase('promos', DEFAULT_PROMOS);
      }
    }
    if (!specificTable || specificTable === 'ticker') {
      if (typeof DEFAULT_TICKER !== 'undefined' && DEFAULT_TICKER.length > 0) {
        await pushToSupabase('ticker', DEFAULT_TICKER);
      }
    }
    if (!specificTable || specificTable === 'tenants') {
      if (typeof DEFAULT_TENANTS !== 'undefined' && DEFAULT_TENANTS.length > 0) {
        await pushToSupabase('tenants', DEFAULT_TENANTS);
      }
    }
    if (!specificTable || specificTable === 'invoices') {
      if (typeof DEFAULT_INVOICE_HISTORY !== 'undefined' && DEFAULT_INVOICE_HISTORY.length > 0) {
        await pushToSupabase('invoices', DEFAULT_INVOICE_HISTORY);
      }
    }
    console.log('🌱 Data default berhasil di-seed langsung ke Supabase Cloud!');
  } catch (e) {
    console.error('Failed to seed default data to Supabase:', e);
  }
}

let realtimePullDebounceTimer = null;

/**
 * Realtime Subscription Listener (Postgres Realtime WebSocket)
 */
function initSupabaseRealtime() {
  if (!isSupabaseActive()) return;

  try {
    supabaseClient
      .channel('public-realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('⚡ Realtime Supabase event received:', payload.eventType, 'on table:', payload.table);
        // Debounce pull requests to prevent rapid cascade loops
        if (realtimePullDebounceTimer) clearTimeout(realtimePullDebounceTimer);
        realtimePullDebounceTimer = setTimeout(() => {
          pullAllDataFromSupabase();
        }, 800);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Terhubung ke Supabase Realtime Channel (Live Postgres Changes).');
        }
      });
  } catch (e) {
    console.warn('Supabase Realtime not subscribed:', e);
  }
}

/**
 * Update UI Status Indicators in Admin and Superadmin topbars
 */
function updateSupabaseStatusIndicator() {
  const pills = document.querySelectorAll('.supabase-status-pill, #topbar-db-pill');
  pills.forEach(pill => {
    if (isSupabaseActive()) {
      pill.className = 'supabase-status-pill connected';
      pill.innerHTML = '<span class="db-dot green"></span> <span>Supabase PostgreSQL (Live Cloud)</span>';
      pill.title = 'Terhubung langsung ke Database Cloud Supabase';
    } else {
      pill.className = 'supabase-status-pill local';
      pill.innerHTML = '<span class="db-dot orange"></span> <span>Lokal (Klik utk Supabase)</span>';
      pill.title = 'Mode lokal. Klik untuk menghubungkan ke Supabase.';
    }
  });
}

// Initial status check & immediate cloud pull
document.addEventListener('DOMContentLoaded', () => {
  updateSupabaseStatusIndicator();
  if (isSupabaseActive() && !isInitialSupabaseSyncDone) {
    pullAllDataFromSupabase();
  }
});

/**
 * AMANDA BROWNIES - SUPABASE DATABASE CLIENT & CLOUD DATA ENGINE
 * Direct PostgreSQL cloud synchronization with Realtime Postgres changes.
 */

const SUPABASE_CONFIG_STORAGE_KEY = 'amanda_supabase_config';
const SECURITY_VAULT_STORAGE_KEY = 'amanda_security_vault';

// Active Supabase Cloud Project Configuration (Managed via Admin Vault)
const DEFAULT_SUPABASE_URL = 'https://ffzzlertrzfrpuhbspws.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_64yf0NZHiOLEylWhspci4A_EaOWuVyB';

let supabaseConfig = {
  url: DEFAULT_SUPABASE_URL,
  key: DEFAULT_SUPABASE_KEY,
  enabled: true
};

let supabaseClient = null;
let isInitialSupabaseSyncDone = false;

/**
 * Get Security Vault Data
 */
function getSecurityVaultData() {
  try {
    const raw = localStorage.getItem(SECURITY_VAULT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-migrate if stored URL is from old/stale instance or key is invalid
      if (parsed.supabaseUrl && (parsed.supabaseUrl.includes('zomkdefqivvbtxqzavpz') || !parsed.supabaseAnonKey || !parsed.supabaseAnonKey.startsWith('sb_publishable'))) {
        parsed.supabaseUrl = DEFAULT_SUPABASE_URL;
        parsed.supabaseAnonKey = DEFAULT_SUPABASE_KEY;
        try { localStorage.setItem(SECURITY_VAULT_STORAGE_KEY, JSON.stringify(parsed)); } catch(e) {}
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading Security Vault:', e);
  }
  return {
    supabaseUrl: supabaseConfig.url || DEFAULT_SUPABASE_URL,
    supabaseAnonKey: supabaseConfig.key || DEFAULT_SUPABASE_KEY,
    supabaseSecretKey: '',
    cloudflareToken: '',
    webhookSecret: '',
    lastUpdated: null
  };
}

/**
 * Save Security Vault Data (Local & Cloud Sync)
 */
async function saveSecurityVaultData(vaultData, syncToCloud = true) {
  try {
    const cleanData = {
      supabaseUrl: (vaultData.supabaseUrl || '').trim(),
      supabaseAnonKey: (vaultData.supabaseAnonKey || '').trim(),
      supabaseSecretKey: (vaultData.supabaseSecretKey || '').trim(),
      cloudflareToken: (vaultData.cloudflareToken || '').trim(),
      webhookSecret: (vaultData.webhookSecret || '').trim(),
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(SECURITY_VAULT_STORAGE_KEY, JSON.stringify(cleanData));

    // Update active runtime configuration
    if (cleanData.supabaseUrl && cleanData.supabaseAnonKey) {
      saveSupabaseConfig(cleanData.supabaseUrl, cleanData.supabaseAnonKey, true);
    }

    // Security: Do not sync secret credentials or vault metadata to cloud tables.
    // Vault credentials remain strictly inside local isolated storage.

    return { success: true, message: 'Vault Kunci API & Kredensial berhasil disimpan dengan aman.' };
  } catch (err) {
    console.error('Save vault error:', err);
    return { success: false, message: err.message || 'Gagal menyimpan vault keamanan.' };
  }
}

/**
 * Sync custom setting record to Supabase platform_settings table
 */
async function syncSettingsToSupabase(key, value) {
  if (!isSupabaseActive()) return false;
  try {
    const { error } = await supabaseClient
      .from('platform_settings')
      .upsert({
        key: key,
        value: typeof value === 'object' ? value : { value: value },
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

    if (error) {
      console.warn(`Gagal sync setting [${key}] ke Cloud:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn(`Exception sync setting [${key}]:`, e);
    return false;
  }
}

/**
 * Trigger UI updates across Landing Page & CMS when Supabase data is loaded
 */
function notifyAmandaDataChanged() {
  if (typeof reloadAmandaData === 'function') {
    reloadAmandaData();
  }
  window.dispatchEvent(new CustomEvent('amanda_data_updated'));
}

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
    const vault = getSecurityVaultData();
    if (vault && vault.supabaseUrl && vault.supabaseAnonKey) {
      supabaseConfig = {
        url: vault.supabaseUrl,
        key: vault.supabaseAnonKey,
        enabled: true
      };
      return;
    }

    const raw = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (raw) {
      supabaseConfig = JSON.parse(raw);
      if (!supabaseConfig.url || supabaseConfig.url.includes('zomkdefqivvbtxqzavpz') || !supabaseConfig.key || !supabaseConfig.key.startsWith('sb_publishable')) {
        supabaseConfig.url = DEFAULT_SUPABASE_URL;
        supabaseConfig.key = DEFAULT_SUPABASE_KEY;
        supabaseConfig.enabled = true;
        try { localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(supabaseConfig)); } catch(e) {}
      }
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
let hasSeededSupabase = false;

/**
 * PULL ALL DATA DIRECTLY FROM SUPABASE POSTGRESQL
 */
async function pullAllDataFromSupabase() {
  if (!isSupabaseActive() || isCurrentlyPulling) return false;

  const isAdminPage = typeof window !== 'undefined' && window.location && (
    window.location.pathname.includes('admin.html') || window.location.pathname.includes('login.html')
  );

  try {
    isCurrentlyPulling = true;
    console.log('📥 Mengambil data langsung dari Supabase Cloud Database (Parallel Mode)...');

    // 1. Fetch Pricelists (Daftar Harga Poster Resmi) - Prioritas Langsung Render
    const fetchPricelists = supabaseClient
      .from('pricelists')
      .select('*')
      .order('id', { ascending: true })
      .then(({ data: dbPrice, error: errPrice }) => {
        if (!errPrice && dbPrice && dbPrice.length > 0) {
          AMANDA_PRICELISTS = dbPrice.map(pr => ({
            id: pr.id,
            title: pr.title,
            badge: pr.badge || 'Price List',
            image: pr.image,
            caption: pr.caption || ''
          }));
          try { localStorage.setItem('amanda_pricelists', JSON.stringify(AMANDA_PRICELISTS)); } catch(e) {}
          if (typeof renderPriceListCards === 'function') renderPriceListCards();
          window.dispatchEvent(new CustomEvent('amanda_data_updated'));
        }
      });

    // 2. Fetch Promos (Flyer 4:5) - Prioritas Langsung Render
    const fetchPromos = supabaseClient
      .from('promos')
      .select('*')
      .order('id', { ascending: true })
      .then(({ data: dbPromos, error: errPromo }) => {
        if (!errPromo && dbPromos && dbPromos.length > 0) {
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
          try { localStorage.setItem('amanda_promos', JSON.stringify(AMANDA_PROMOS)); } catch(e) {}
          if (typeof renderPromoFlyers === 'function') renderPromoFlyers();
          window.dispatchEvent(new CustomEvent('amanda_data_updated'));
        }
      });

    // 3. Fetch Ticker
    const fetchTicker = supabaseClient
      .from('ticker')
      .select('*')
      .order('id', { ascending: true })
      .then(({ data: dbTicker, error: errTick }) => {
        if (!errTick && dbTicker && dbTicker.length > 0) {
          AMANDA_TICKER = dbTicker.map(t => ({
            id: t.id,
            title: t.title,
            text: t.text,
            icon: t.icon || 'fa-solid fa-bullhorn'
          }));
          try { localStorage.setItem('amanda_ticker', JSON.stringify(AMANDA_TICKER)); } catch(e) {}
          if (typeof renderPromoTicker === 'function') renderPromoTicker();
        }
      });

    // 4. Fetch Outlets & Booths
    const fetchOutlets = supabaseClient
      .from('outlets')
      .select('*')
      .order('id', { ascending: true })
      .then(({ data: dbOutlets, error: errOut }) => {
        if (!errOut && dbOutlets && dbOutlets.length > 0) {
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
          try { localStorage.setItem('amanda_outlets', JSON.stringify(AMANDA_OUTLETS)); } catch(e) {}
          if (typeof renderNavbarOutletDropdown === 'function') renderNavbarOutletDropdown();
          if (typeof renderOutletLocatorList === 'function') renderOutletLocatorList();
        }
      });

    // 5. Fetch Outlet Categories / Wilayah
    const fetchCategories = supabaseClient
      .from('outlet_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data: dbOutletCats, error: errOutletCat }) => {
        if (!errOutletCat && dbOutletCats && dbOutletCats.length > 0) {
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
          try { localStorage.setItem('amanda_outlet_categories', JSON.stringify(AMANDA_OUTLET_CATEGORIES)); } catch(e) {}
          if (typeof renderOutletCategoryFilterPills === 'function') renderOutletCategoryFilterPills();
        }
      });

    // 6. Fetch Products & Stocks
    const fetchProducts = supabaseClient
      .from('products')
      .select('*')
      .order('id', { ascending: true })
      .then(({ data: dbProducts, error: errProd }) => {
        if (!errProd && dbProducts && dbProducts.length > 0) {
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
          try { localStorage.setItem('amanda_products', JSON.stringify(AMANDA_PRODUCTS)); } catch(e) {}
          if (typeof renderProductGrid === 'function') renderProductGrid();
          window.dispatchEvent(new CustomEvent('amanda_data_updated'));
        }
      });

    const tasks = [
      fetchPricelists,
      fetchPromos,
      fetchTicker,
      fetchOutlets,
      fetchCategories,
      fetchProducts
    ];

    // Hanya ambil data internal CMS jika membuka halaman admin
    if (isAdminPage) {
      const fetchTenants = supabaseClient
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data: dbTenants, error: errTen }) => {
          if (!errTen && dbTenants && dbTenants.length > 0) {
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
          }
        });

      const fetchInvoices = supabaseClient
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data: dbInvoices, error: errInv }) => {
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
        });

      const fetchCs = supabaseClient
        .from('cs_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data: dbCs, error: errCs }) => {
          if (!errCs && dbCs && dbCs.length > 0) {
            AMANDA_CS_INQUIRIES = dbCs.map(cs => {
              let parsedImages = [];
              if (Array.isArray(cs.receipt_images) && cs.receipt_images.length > 0) {
                parsedImages = cs.receipt_images;
              } else if (typeof cs.receipt_images === 'string' && cs.receipt_images.startsWith('[')) {
                try { parsedImages = JSON.parse(cs.receipt_images); } catch(e) {}
              }
              if (parsedImages.length === 0 && cs.receipt_image) {
                parsedImages = [cs.receipt_image];
              }

              return {
                id: cs.id,
                name: cs.name,
                phone: cs.phone,
                outlet_id: cs.outlet_id,
                outlet_name: cs.outlet_name,
                category: cs.category,
                receipt_number: cs.receipt_number || '',
                receipt_image: cs.receipt_image || (parsedImages[0] || null),
                receipt_images: parsedImages,
                message: cs.message,
                rating: Number(cs.rating) || 5,
                status: cs.status || 'NEW',
                admin_notes: cs.admin_notes || null,
                created_at: cs.created_at
              };
            });
            if (typeof saveCsInquiries === 'function') {
              saveCsInquiries(AMANDA_CS_INQUIRIES, false);
            }
            if (typeof renderCsManager === 'function') renderCsManager();
          }
        });

      // Fetch platform_settings dari Supabase
      const fetchSettings = supabaseClient
        .from('platform_settings')
        .select('*')
        .then(({ data: dbSettings, error: errSettings }) => {
          if (!errSettings && dbSettings && Array.isArray(dbSettings)) {
            // General settings cache handler if needed
          }
        });

      tasks.push(fetchTenants, fetchInvoices, fetchCs, fetchSettings);
    }

    await Promise.all(tasks);

    isInitialSupabaseSyncDone = true;
    notifyAmandaDataChanged();

    // Perbarui cookie masa berlaku cache (30 menit) & versi
    if (typeof setAmandaCookie === 'function') {
      const ttl = typeof AMANDA_CACHE_TTL_SECONDS !== 'undefined' ? AMANDA_CACHE_TTL_SECONDS : 1800;
      const ver = typeof AMANDA_SYSTEM_VERSION !== 'undefined' ? AMANDA_SYSTEM_VERSION : '4.2.0';
      setAmandaCookie('amanda_cache_active', Date.now().toString(), ttl);
      setAmandaCookie('amanda_version', ver, 86400 * 30);
    }

    console.log('⚡ Semua data Supabase berhasil dimuat secara paralel!');
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
        id: o.id || ('out-bpn-' + Date.now()),
        name: o.name || 'Cabang Amanda',
        city: o.city || 'Balikpapan',
        region: o.region || 'Kota Balikpapan',
        image: o.image || 'assets/outlet_mt_haryono.jpg',
        address: o.address || 'Kota Balikpapan',
        phone: o.phone || '',
        wa: (o.wa ? String(o.wa).replace(/[^0-9]/g, '') : '6281241075981'),
        hours: o.hours || '07.00 - 22.00 WITA',
        maps_url: o.mapsUrl || o.maps_url || '',
        distance: o.distance || '1.0 km',
        booths: Array.isArray(o.booths) ? o.booths : []
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
    } else if (tableName === 'cs_inquiries') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map(cs => ({
        id: cs.id,
        name: cs.name,
        phone: cs.phone,
        outlet_id: cs.outlet_id || cs.outletId,
        outlet_name: cs.outlet_name || cs.outletName,
        category: cs.category,
        receipt_number: cs.receipt_number || cs.receiptNumber || '',
        receipt_image: cs.receipt_image || (Array.isArray(cs.receipt_images) && cs.receipt_images[0]) || cs.receiptImage || null,
        receipt_images: Array.isArray(cs.receipt_images) ? cs.receipt_images : (cs.receipt_image ? [cs.receipt_image] : []),
        message: cs.message,
        rating: Number(cs.rating) || 5,
        status: cs.status || 'NEW',
        admin_notes: cs.admin_notes || (cs.booth_name ? `Titik Booth: ${cs.booth_name}` : null),
        created_at: cs.created_at || new Date().toISOString()
      }));
    } else if (tableName === 'pricelists') {
      const list = Array.isArray(payload) ? payload : [payload];
      dbPayload = list.map(pr => ({
        id: pr.id,
        title: pr.title,
        badge: pr.badge || 'Price List',
        image: pr.image,
        caption: pr.caption || '',
        created_at: pr.created_at || new Date().toISOString()
      }));
    }
    let data, error;
    const hasAdminSession = typeof getAuthSession === 'function' && !!getAuthSession();
    if (operation === 'insert' || (tableName === 'cs_inquiries' && !hasAdminSession)) {
      const res = await supabaseClient.from(tableName).insert(dbPayload);
      data = res.data;
      error = res.error;
    } else {
      const res = await supabaseClient.from(tableName).upsert(dbPayload, { onConflict: 'id' });
      data = res.data;
      error = res.error;
    }
    if (error) {
      console.error(`❌ Supabase upsert [${tableName}] FAILED:`, error.message, '| Code:', error.code, '| Details:', error.details, '| Hint:', error.hint);
      if (typeof showCmsToast === 'function') {
        showCmsToast('Gagal sinkron ke Cloud: ' + (error.message || 'Izin ditolak (RLS)'), 'error');
      } else if (typeof showSaToast === 'function') {
        showSaToast('Gagal sinkron ke Cloud: ' + (error.message || 'Izin ditolak (RLS)'), 'error');
      }
    } else {
      console.log(`☁️ Supabase [${tableName}] berhasil di-update secara realtime! Data count:`, Array.isArray(dbPayload) ? dbPayload.length : 1);
    }
    return data;
  } catch (e) {
    console.error(`❌ Supabase sync exception for [${tableName}]:`, e);
  }
  return null;
}

const seededTables = new Set();

/**
 * Initial Auto-Seed default data to Supabase if tables are fresh
 */
async function seedDefaultDataToSupabase(specificTable = null) {
  if (!isSupabaseActive()) return;
  if (specificTable && seededTables.has(specificTable)) return;
  if (!specificTable && hasSeededSupabase) return;
  hasSeededSupabase = true;
  if (specificTable) seededTables.add(specificTable);

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
 * Realtime Subscription Listener (Postgres Realtime WebSocket & Heartbeat Fallback)
 */
function initSupabaseRealtime() {
  if (!isSupabaseActive()) return;

  try {
    // 1. General listener untuk produk, promo, outlet, ticker
    supabaseClient
      .channel('public-realtime-general')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        // Lewatkan cs_inquiries di sini agar tidak double pull
        if (payload.table === 'cs_inquiries') return;
        console.log('⚡ Realtime Supabase event received:', payload.eventType, 'on table:', payload.table);
        if (realtimePullDebounceTimer) clearTimeout(realtimePullDebounceTimer);
        realtimePullDebounceTimer = setTimeout(() => {
          pullAllDataFromSupabase();
        }, 1200);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Terhubung ke Supabase Realtime Channel (General Changes).');
        }
      });

    // 2. Dedicated Live Feed Channel khusus Pengaduan CS (Realtime Instant)
    initCsInquiriesRealtime();

    // 3. Heartbeat Polling Fallback (menjamin data selalu sinkron meski websocket sempat terputus)
    startCsRealtimeHeartbeat();
  } catch (e) {
    console.warn('Supabase Realtime not subscribed:', e);
  }
}

/**
 * Dedicated Realtime Channel Listener for CS Inquiries
 */
function initCsInquiriesRealtime() {
  if (!isSupabaseActive()) return;

  try {
    supabaseClient
      .channel('cs-inquiries-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cs_inquiries' }, (payload) => {
        console.log('🔔 [Realtime CS] Event diterima:', payload.eventType, payload);
        handleRealtimeCsChange(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 [Realtime CS] Live WebSocket terhubung aktif.');
          updateCsLiveBadgeStatus(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('⚠️ [Realtime CS] Status channel:', status);
          updateCsLiveBadgeStatus(false);
        }
      });
  } catch (e) {
    console.warn('Error initCsInquiriesRealtime:', e);
  }
}

/**
 * Tangani perubahan data pengaduan secara instan dari WebSocket Realtime
 */
function handleRealtimeCsChange(payload) {
  if (!payload || !payload.eventType) return;

  if (payload.eventType === 'INSERT') {
    const row = payload.new;
    if (!row || !row.id) return;

    const newInquiry = {
      id: row.id,
      name: row.name,
      phone: row.phone,
      outlet_id: row.outlet_id,
      outlet_name: row.outlet_name,
      category: row.category,
      receipt_number: row.receipt_number || '',
      receipt_image: row.receipt_image || (Array.isArray(row.receipt_images) && row.receipt_images[0]) || null,
      receipt_images: Array.isArray(row.receipt_images) ? row.receipt_images : (row.receipt_image ? [row.receipt_image] : []),
      message: row.message,
      rating: Number(row.rating) || 5,
      status: row.status || 'NEW',
      admin_notes: row.admin_notes || null,
      created_at: row.created_at || new Date().toISOString()
    };

    // Tambahkan ke urutan paling atas jika belum ada
    const exists = AMANDA_CS_INQUIRIES.some(i => i.id === newInquiry.id);
    if (!exists) {
      AMANDA_CS_INQUIRIES.unshift(newInquiry);
      if (typeof saveCsInquiries === 'function') {
        saveCsInquiries(AMANDA_CS_INQUIRIES, false);
      }
      notifyAmandaDataChanged();

      // Update UI langsung jika ada di admin panel
      if (typeof renderCsManager === 'function') renderCsManager();
      if (typeof renderDashboard === 'function') renderDashboard();

      // Mainkan suara notifikasi lonceng & tampilkan toast
      playCsNotificationSound();
      if (typeof showCmsToast === 'function') {
        showCmsToast(`📩 Ada Pengaduan Baru: ${newInquiry.name} (${newInquiry.outlet_name || 'Outlet'})`, 'success');
      }
    }
  } else if (payload.eventType === 'UPDATE') {
    const row = payload.new;
    if (!row || !row.id) return;

    const idx = AMANDA_CS_INQUIRIES.findIndex(i => i.id === row.id);
    if (idx >= 0) {
      AMANDA_CS_INQUIRIES[idx] = {
        ...AMANDA_CS_INQUIRIES[idx],
        ...row,
        rating: Number(row.rating) || AMANDA_CS_INQUIRIES[idx].rating || 5,
        receipt_images: Array.isArray(row.receipt_images) ? row.receipt_images : (row.receipt_image ? [row.receipt_image] : AMANDA_CS_INQUIRIES[idx].receipt_images)
      };
      if (typeof saveCsInquiries === 'function') {
        saveCsInquiries(AMANDA_CS_INQUIRIES, false);
      }
      notifyAmandaDataChanged();
      if (typeof renderCsManager === 'function') renderCsManager();
      if (typeof renderDashboard === 'function') renderDashboard();
    }
  } else if (payload.eventType === 'DELETE') {
    const oldId = payload.old?.id;
    if (oldId) {
      AMANDA_CS_INQUIRIES = AMANDA_CS_INQUIRIES.filter(i => i.id !== oldId);
      if (typeof saveCsInquiries === 'function') {
        saveCsInquiries(AMANDA_CS_INQUIRIES, false);
      }
      notifyAmandaDataChanged();
      if (typeof renderCsManager === 'function') renderCsManager();
      if (typeof renderDashboard === 'function') renderDashboard();
    }
  }
}

let csHeartbeatTimer = null;
let isHeartbeatRunning = false;

/**
 * Background Heartbeat Polling: Cek data pengaduan baru setiap 5 detik
 * Menjamin 100% data realtime tetap masuk meski koneksi WebSocket sempat terputus
 */
function startCsRealtimeHeartbeat() {
  if (csHeartbeatTimer) return;

  csHeartbeatTimer = setInterval(async () => {
    if (!isSupabaseActive() || isHeartbeatRunning) return;

    try {
      isHeartbeatRunning = true;
      const { data: dbCs, error } = await supabaseClient
        .from('cs_inquiries')
        .select('id, name, phone, outlet_id, outlet_name, category, receipt_number, receipt_image, receipt_images, message, rating, status, admin_notes, created_at')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && Array.isArray(dbCs) && dbCs.length > 0) {
        const mappedList = dbCs.map(cs => {
          let parsedImages = [];
          if (Array.isArray(cs.receipt_images) && cs.receipt_images.length > 0) {
            parsedImages = cs.receipt_images;
          } else if (typeof cs.receipt_images === 'string' && cs.receipt_images.startsWith('[')) {
            try { parsedImages = JSON.parse(cs.receipt_images); } catch(e) {}
          }
          if (parsedImages.length === 0 && cs.receipt_image) {
            parsedImages = [cs.receipt_image];
          }

          return {
            id: cs.id,
            name: cs.name,
            phone: cs.phone,
            outlet_id: cs.outlet_id,
            outlet_name: cs.outlet_name,
            category: cs.category,
            receipt_number: cs.receipt_number || '',
            receipt_image: cs.receipt_image || (parsedImages[0] || null),
            receipt_images: parsedImages,
            message: cs.message,
            rating: Number(cs.rating) || 5,
            status: cs.status || 'NEW',
            admin_notes: cs.admin_notes || null,
            created_at: cs.created_at
          };
        });

        const currentIds = new Set(AMANDA_CS_INQUIRIES.map(i => i.id));
        const hasNew = mappedList.some(i => !currentIds.has(i.id));

        // Cek apakah ada tiket di memori yang kehilangan foto lampiran
        const needsPhotoRestore = AMANDA_CS_INQUIRIES.some(item => {
          const cloudItem = mappedList.find(m => m.id === item.id);
          return cloudItem && (cloudItem.receipt_image || cloudItem.receipt_images.length > 0) &&
            (!item.receipt_image && (!item.receipt_images || item.receipt_images.length === 0));
        });

        if (hasNew || needsPhotoRestore || mappedList.length !== AMANDA_CS_INQUIRIES.length) {
          console.log(`🔄 [Heartbeat Sync] Memperbarui ${mappedList.length} pengaduan dari Supabase Cloud (memulihkan foto bukti).`);
          const prevCount = AMANDA_CS_INQUIRIES.length;
          AMANDA_CS_INQUIRIES = mappedList;
          if (typeof saveCsInquiries === 'function') {
            saveCsInquiries(AMANDA_CS_INQUIRIES, false);
          }
          notifyAmandaDataChanged();

          if (typeof renderCsManager === 'function') renderCsManager();
          if (typeof renderDashboard === 'function') renderDashboard();

          if (hasNew) {
            playCsNotificationSound();
            if (typeof showCmsToast === 'function') {
              showCmsToast(`📩 Ada ${mappedList.length - prevCount} Pengaduan Pelanggan Baru Masuk!`, 'success');
            }
          }
        }
      }
    } catch (e) {
      // silent background heartbeat
    } finally {
      isHeartbeatRunning = false;
    }
  }, 5000);
}

/**
 * Suara Lonceng Notifikasi Web Audio API (Double Chime)
 */
function playCsNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Nada 1: 880 Hz (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Nada 2: 1174.66 Hz (D6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.16, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (e) {
    // Autoplay restrictions or headless browser
  }
}

/**
 * Tombol Refresh Manual Cepat untuk CS
 */
async function syncCsInquiriesNow(btnElement) {
  if (btnElement) {
    btnElement.disabled = true;
    btnElement.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Menyinkronkan...';
  }

  if (!isSupabaseActive()) {
    if (typeof showCmsToast === 'function') showCmsToast('Koneksi Supabase tidak aktif.', 'error');
    if (btnElement) {
      btnElement.disabled = false;
      btnElement.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Refresh Data';
    }
    return;
  }

  try {
    const { data: dbCs, error } = await supabaseClient
      .from('cs_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(dbCs)) {
      AMANDA_CS_INQUIRIES = dbCs.map(cs => {
        let parsedImages = [];
        if (Array.isArray(cs.receipt_images) && cs.receipt_images.length > 0) {
          parsedImages = cs.receipt_images;
        } else if (typeof cs.receipt_images === 'string' && cs.receipt_images.startsWith('[')) {
          try { parsedImages = JSON.parse(cs.receipt_images); } catch(e) {}
        }
        if (parsedImages.length === 0 && cs.receipt_image) {
          parsedImages = [cs.receipt_image];
        }

        return {
          id: cs.id,
          name: cs.name,
          phone: cs.phone,
          outlet_id: cs.outlet_id,
          outlet_name: cs.outlet_name,
          category: cs.category,
          receipt_number: cs.receipt_number || '',
          receipt_image: cs.receipt_image || (parsedImages[0] || null),
          receipt_images: parsedImages,
          message: cs.message,
          rating: Number(cs.rating) || 5,
          status: cs.status || 'NEW',
          admin_notes: cs.admin_notes || null,
          created_at: cs.created_at
        };
      });

      if (typeof saveCsInquiries === 'function') {
        saveCsInquiries(AMANDA_CS_INQUIRIES, false);
      }
      notifyAmandaDataChanged();
      if (typeof renderCsManager === 'function') renderCsManager();
      if (typeof renderDashboard === 'function') renderDashboard();

      if (typeof showCmsToast === 'function') {
        showCmsToast(`✅ Berhasil menyinkronkan ${AMANDA_CS_INQUIRIES.length} pengaduan dari Supabase Cloud.`, 'success');
      }
    } else if (error) {
      if (typeof showCmsToast === 'function') showCmsToast('Gagal sinkron: ' + error.message, 'error');
    }
  } catch (err) {
    if (typeof showCmsToast === 'function') showCmsToast('Terjadi kesalahan sinkronisasi.', 'error');
  } finally {
    if (btnElement) {
      btnElement.disabled = false;
      btnElement.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Refresh Data';
    }
  }
}

function updateCsLiveBadgeStatus(isLive = true) {
  const badge = document.getElementById('cs-live-badge');
  if (badge) {
    if (isLive) {
      badge.style.background = '#dcfce7';
      badge.style.color = '#15803d';
      badge.style.borderColor = '#86efac';
      badge.innerHTML = '<span class="live-dot" style="background: #22c55e;"></span> Live Realtime Aktif';
    } else {
      badge.style.background = '#fef3c7';
      badge.style.color = '#b45309';
      badge.style.borderColor = '#fde68a';
      badge.innerHTML = '<span class="live-dot" style="background: #f59e0b;"></span> Polling Realtime (5s)';
    }
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
  updateCsLiveBadgeStatus(isSupabaseActive());
}

// Initial status check & immediate cloud pull
document.addEventListener('DOMContentLoaded', () => {
  updateSupabaseStatusIndicator();
  if (isSupabaseActive() && !isInitialSupabaseSyncDone) {
    pullAllDataFromSupabase();
  }
});

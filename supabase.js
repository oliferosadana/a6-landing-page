/**
 * AMANDA BROWNIES - SUPABASE DATABASE CLIENT & SYNC LAYER
 * Provides seamless PostgreSQL cloud synchronization with fallback to LocalStorage.
 */

const SUPABASE_CONFIG_STORAGE_KEY = 'amanda_supabase_config';

// Active Supabase Configuration (Configured from User Credentials)
const DEFAULT_SUPABASE_URL = 'https://ffzzlertrzfrpuhbspws.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_64yf0NZHiOLEylWhspci4A_EaOWuVyB';

let supabaseConfig = {
  url: DEFAULT_SUPABASE_URL,
  key: DEFAULT_SUPABASE_KEY,
  enabled: true
};

let supabaseClient = null;

// Initialize Supabase on load
(function initSupabaseModule() {
  loadSupabaseConfig();
  if (supabaseConfig.url && supabaseConfig.key && supabaseConfig.enabled) {
    createSupabaseClient();
  }
})();

/**
 * Load Supabase configuration from localStorage with fallback to default
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
      supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.key);
      console.log('✅ Supabase client connected to:', supabaseConfig.url);
      initSupabaseRealtime();
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      supabaseClient = null;
    }
  } else {
    // Wait for Supabase CDN script to load
    window.addEventListener('load', () => {
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        try {
          supabaseClient = supabase.createClient(supabaseConfig.url, supabaseConfig.key);
          console.log('✅ Supabase client initialized on window load');
          initSupabaseRealtime();
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
    const { data, error } = await testClient.from('products').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      // If table does not exist yet or auth issue
      return { success: false, message: error.message || 'Gagal terhubung ke Supabase.' };
    }
    return { success: true, message: 'Berhasil terhubung ke Supabase Cloud Database!' };
  } catch (err) {
    return { success: false, message: err.message || 'Koneksi error.' };
  }
}

/**
 * Pull all data from Supabase to local memory & localStorage
 */
async function pullAllDataFromSupabase() {
  if (!isSupabaseActive()) return false;

  try {
    console.log('🔄 Syncing all data from Supabase Cloud...');

    // 1. Products
    const { data: prods, error: errProd } = await supabaseClient.from('products').select('*');
    if (!errProd && prods && prods.length > 0) {
      AMANDA_PRODUCTS = prods;
      saveStoredData('amanda_products', AMANDA_PRODUCTS);
    }

    // 2. Promos
    const { data: promos, error: errPromo } = await supabaseClient.from('promos').select('*');
    if (!errPromo && promos && promos.length > 0) {
      AMANDA_PROMOS = promos;
      saveStoredData('amanda_promos', AMANDA_PROMOS);
    }

    // 3. Outlets
    const { data: outlets, error: errOut } = await supabaseClient.from('outlets').select('*');
    if (!errOut && outlets && outlets.length > 0) {
      AMANDA_OUTLETS = outlets;
      saveStoredData('amanda_outlets', AMANDA_OUTLETS);
    }

    // 4. Ticker
    const { data: ticker, error: errTick } = await supabaseClient.from('ticker').select('*');
    if (!errTick && ticker && ticker.length > 0) {
      AMANDA_TICKER = ticker;
      saveStoredData('amanda_ticker', AMANDA_TICKER);
    }

    // 5. Invoices
    const { data: invoices, error: errInv } = await supabaseClient.from('invoices').select('*').order('created_at', { ascending: false });
    if (!errInv && invoices && invoices.length > 0) {
      saveInvoiceHistory(invoices);
    }

    // 6. Tenants
    const { data: tenants, error: errTen } = await supabaseClient.from('tenants').select('*').order('created_at', { ascending: false });
    if (!errTen && tenants && tenants.length > 0) {
      saveTenants(tenants);
    }

    // Dispatch event to trigger re-renders
    notifyAmandaDataChanged();
    console.log('✅ Supabase sync complete.');
    return true;
  } catch (err) {
    console.error('Error pulling from Supabase:', err);
    return false;
  }
}

/**
 * Push an individual record or table update to Supabase
 */
async function pushToSupabase(tableName, payload, operation = 'upsert') {
  if (!isSupabaseActive()) return null;

  try {
    if (operation === 'upsert') {
      const { data, error } = await supabaseClient.from(tableName).upsert(payload);
      if (error) console.warn(`Supabase upsert [${tableName}] error:`, error);
      return data;
    } else if (operation === 'delete') {
      const { data, error } = await supabaseClient.from(tableName).delete().match(payload);
      if (error) console.warn(`Supabase delete [${tableName}] error:`, error);
      return data;
    }
  } catch (e) {
    console.warn(`Supabase sync failed for ${tableName}:`, e);
  }
  return null;
}

/**
 * Initial Setup: Seed initial default data to Supabase
 */
async function seedDefaultDataToSupabase() {
  if (!isSupabaseActive()) return;

  try {
    // Seed Products
    if (AMANDA_PRODUCTS && AMANDA_PRODUCTS.length > 0) {
      await supabaseClient.from('products').upsert(AMANDA_PRODUCTS);
    }
    // Seed Promos
    if (AMANDA_PROMOS && AMANDA_PROMOS.length > 0) {
      await supabaseClient.from('promos').upsert(AMANDA_PROMOS);
    }
    // Seed Outlets
    if (AMANDA_OUTLETS && AMANDA_OUTLETS.length > 0) {
      await supabaseClient.from('outlets').upsert(AMANDA_OUTLETS);
    }
    // Seed Ticker
    if (AMANDA_TICKER && AMANDA_TICKER.length > 0) {
      await supabaseClient.from('ticker').upsert(AMANDA_TICKER);
    }
    // Seed Tenants
    const tenants = getTenants();
    if (tenants && tenants.length > 0) {
      await supabaseClient.from('tenants').upsert(tenants);
    }
    console.log('🌱 Default data successfully seeded to Supabase!');
  } catch (e) {
    console.error('Failed to seed default data to Supabase:', e);
  }
}

/**
 * Realtime Subscription Listener
 */
function initSupabaseRealtime() {
  if (!isSupabaseActive()) return;

  try {
    supabaseClient
      .channel('public-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('⚡ Realtime Supabase event received:', payload.eventType, payload.table);
        pullAllDataFromSupabase();
      })
      .subscribe();
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
      pill.innerHTML = '<span class="db-dot green"></span> <span>Supabase PostgreSQL (Cloud)</span>';
      pill.title = 'Terhubung ke Database Cloud Supabase';
    } else {
      pill.className = 'supabase-status-pill local';
      pill.innerHTML = '<span class="db-dot orange"></span> <span>Lokal (Klik utk Supabase)</span>';
      pill.title = 'Berjalan di mode database lokal. Klik untuk menghubungkan ke Supabase.';
    }
  });
}

// Initial status check
document.addEventListener('DOMContentLoaded', () => {
  updateSupabaseStatusIndicator();
  if (isSupabaseActive()) {
    pullAllDataFromSupabase();
  }
});

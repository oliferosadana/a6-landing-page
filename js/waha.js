/**
 * ===================================================================
 * AMANDA BROWNIES BALIKPAPAN - WAHA (WHATSAPP HTTP API) GATEWAY ENGINE
 * Manajemen Sesi WhatsApp, Pairing QR Code, Pengiriman Pesan & Notifikasi Otomatis
 * ===================================================================
 */

const WAHA_CONFIG_STORAGE_KEY = 'amanda_waha_config';
const WAHA_LOGS_STORAGE_KEY = 'amanda_waha_logs';

const DEFAULT_WAHA_CONFIG = {
  enabled: false,
  apiUrl: 'http://localhost:3000',
  apiKey: '',
  session: 'default',
  adminPhone: '6281322119988',
  notifyAdminOnTicket: true,
  notifyCustomerOnTicket: true,
  notifyCustomerOnStatus: true,
  autoRefreshQr: true
};

/**
 * Membaca Konfigurasi WAHA dari LocalStorage / Default
 */
function getWahaConfig() {
  try {
    const raw = localStorage.getItem(WAHA_CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled ?? DEFAULT_WAHA_CONFIG.enabled,
        apiUrl: (parsed.apiUrl || '').trim() || DEFAULT_WAHA_CONFIG.apiUrl,
        apiKey: (parsed.apiKey || '').trim(),
        session: (parsed.session || '').trim() || DEFAULT_WAHA_CONFIG.session,
        adminPhone: (parsed.adminPhone || '').trim() || DEFAULT_WAHA_CONFIG.adminPhone,
        notifyAdminOnTicket: parsed.notifyAdminOnTicket ?? true,
        notifyCustomerOnTicket: parsed.notifyCustomerOnTicket ?? true,
        notifyCustomerOnStatus: parsed.notifyCustomerOnStatus ?? true,
        autoRefreshQr: parsed.autoRefreshQr ?? true
      };
    }
  } catch (e) {
    console.warn('Gagal membaca amanda_waha_config:', e);
  }
  return { ...DEFAULT_WAHA_CONFIG };
}

/**
 * Menyimpan Konfigurasi WAHA ke LocalStorage & Cloud Supabase
 */
async function saveWahaConfig(config, syncCloud = true) {
  try {
    const cleanConfig = {
      enabled: Boolean(config.enabled),
      apiUrl: (config.apiUrl || '').trim().replace(/\/+$/, ''),
      apiKey: (config.apiKey || '').trim(),
      session: (config.session || 'default').trim(),
      adminPhone: (config.adminPhone || '').trim().replace(/\D/g, ''),
      notifyAdminOnTicket: Boolean(config.notifyAdminOnTicket),
      notifyCustomerOnTicket: Boolean(config.notifyCustomerOnTicket),
      notifyCustomerOnStatus: Boolean(config.notifyCustomerOnStatus),
      autoRefreshQr: Boolean(config.autoRefreshQr)
    };

    localStorage.setItem(WAHA_CONFIG_STORAGE_KEY, JSON.stringify(cleanConfig));

    // Sinkronisasi ke Supabase platform_settings jika tersedia
    if (syncCloud && typeof syncSettingsToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
      try {
        await syncSettingsToSupabase('waha_gateway_config', cleanConfig);
      } catch (errSync) {
        console.warn('Gagal sinkron config WAHA ke Supabase:', errSync);
      }
    }

    window.dispatchEvent(new CustomEvent('amanda_waha_config_updated', { detail: cleanConfig }));
    return { success: true, message: 'Konfigurasi WAHA Gateway berhasil disimpan.' };
  } catch (err) {
    console.error('Save WAHA config error:', err);
    return { success: false, message: err.message || 'Gagal menyimpan konfigurasi WAHA.' };
  }
}

/**
 * Helper Request HTTP ke Server WAHA dengan Timeout & Auth Headers
 */
async function wahaRequest(endpoint, method = 'GET', body = null, timeoutMs = 9000) {
  const config = getWahaConfig();
  if (!config.apiUrl) {
    throw new Error('URL Server WAHA belum dikonfigurasi.');
  }

  const cleanBase = config.apiUrl.replace(/\/+$/, '');
  const url = `${cleanBase}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const headers = {
    'Accept': 'application/json, image/*, */*'
  };

  if (body && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
  }

  if (config.apiKey) {
    headers['X-Api-Key'] = config.apiKey;
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const options = {
      method,
      headers,
      signal: controller.signal
    };

    if (body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    clearTimeout(timer);

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `WAHA HTTP Error ${response.status}`);
      }
      return data;
    } else if (contentType.includes('image/')) {
      const blob = await response.blob();
      return blob;
    } else {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || `WAHA HTTP Error ${response.status}`);
      }
      return text;
    }
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Koneksi ke WAHA Gateway timed out setelah ${timeoutMs / 1000} detik. Periksa apakah server WAHA sedang aktif.`);
    }
    throw err;
  }
}

/**
 * Format Nomor Telepon ke Format ChatID WhatsApp (misal: 6281234567890@c.us)
 */
function formatWahaChatId(phone) {
  if (!phone) return null;
  let digits = phone.toString().replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.substring(1);
  } else if (!digits.startsWith('62') && digits.length >= 9) {
    digits = '62' + digits;
  }
  return digits.endsWith('@c.us') ? digits : `${digits}@c.us`;
}

/**
 * Tes Koneksi ke Server WAHA (Ping / Version Check)
 */
async function testWahaServer() {
  try {
    // Coba endpoint /api/server/version atau /api/sessions
    try {
      const versionData = await wahaRequest('/api/server/version', 'GET');
      return { success: true, message: 'Terhubung ke WAHA Gateway!', data: versionData };
    } catch (e1) {
      const sessions = await wahaRequest('/api/sessions', 'GET');
      return { success: true, message: 'Terhubung ke WAHA Gateway!', data: sessions };
    }
  } catch (err) {
    return { success: false, message: `Gagal terhubung: ${err.message}` };
  }
}

/**
 * Mengambil Daftar Semua Sesi dari WAHA
 */
async function fetchWahaSessions() {
  try {
    const res = await wahaRequest('/api/sessions?all=true', 'GET');
    return Array.isArray(res) ? res : (res ? [res] : []);
  } catch (err) {
    // Fallback jika query param all=true tidak didukung
    try {
      const fallback = await wahaRequest('/api/sessions', 'GET');
      return Array.isArray(fallback) ? fallback : (fallback ? [fallback] : []);
    } catch (err2) {
      console.warn('Gagal fetch sesi WAHA:', err2);
      throw err2;
    }
  }
}

/**
 * Mengambil Status Sesi Spesifik
 */
async function getWahaSessionStatus(sessionName = null) {
  const config = getWahaConfig();
  const name = sessionName || config.session || 'default';
  try {
    const sessions = await fetchWahaSessions();
    const found = sessions.find(s => s && (s.name === name || s.session === name));
    if (found) {
      return {
        name: found.name || name,
        status: found.status || 'UNKNOWN',
        me: found.me || null,
        engine: found.engine || 'WEBJS',
        config: found.config || {}
      };
    }
    // Jika tidak ada di daftar sesi, coba endpoint single
    try {
      const single = await wahaRequest(`/api/sessions/${name}`, 'GET');
      if (single) {
        return {
          name: single.name || name,
          status: single.status || 'UNKNOWN',
          me: single.me || null,
          engine: single.engine || 'WEBJS',
          config: single.config || {}
        };
      }
    } catch (e) {}

    return { name, status: 'STOPPED', me: null, engine: 'WEBJS' };
  } catch (err) {
    return { name, status: 'DISCONNECTED', error: err.message };
  }
}

/**
 * Memulai Sesi WhatsApp (Start Session)
 */
async function startWahaSession(sessionName = null) {
  const config = getWahaConfig();
  const name = sessionName || config.session || 'default';
  try {
    const res = await wahaRequest('/api/sessions/start', 'POST', { name });
    addWahaLog({
      type: 'SESSION_ACTION',
      action: 'START',
      session: name,
      status: 'SUCCESS',
      details: 'Memulai sesi WAHA'
    });
    return { success: true, message: `Sesi "${name}" berhasil dimulai.`, data: res };
  } catch (err) {
    // Coba create jika belum dibuat
    try {
      const createRes = await wahaRequest('/api/sessions', 'POST', { name });
      return { success: true, message: `Sesi "${name}" dibuat dan dimulai.`, data: createRes };
    } catch (createErr) {
      addWahaLog({
        type: 'SESSION_ACTION',
        action: 'START_FAILED',
        session: name,
        status: 'FAILED',
        details: err.message
      });
      return { success: false, message: `Gagal memulai sesi: ${err.message}` };
    }
  }
}

/**
 * Menghentikan Sesi WhatsApp (Stop Session)
 */
async function stopWahaSession(sessionName = null) {
  const config = getWahaConfig();
  const name = sessionName || config.session || 'default';
  try {
    const res = await wahaRequest('/api/sessions/stop', 'POST', { name });
    addWahaLog({
      type: 'SESSION_ACTION',
      action: 'STOP',
      session: name,
      status: 'SUCCESS',
      details: 'Menghentikan sesi WAHA'
    });
    return { success: true, message: `Sesi "${name}" berhasil dihentikan.`, data: res };
  } catch (err) {
    return { success: false, message: `Gagal menghentikan sesi: ${err.message}` };
  }
}

/**
 * Restart Sesi WhatsApp
 */
async function restartWahaSession(sessionName = null) {
  const config = getWahaConfig();
  const name = sessionName || config.session || 'default';
  try {
    try {
      const res = await wahaRequest('/api/sessions/restart', 'POST', { name });
      return { success: true, message: `Sesi "${name}" berhasil direstart.`, data: res };
    } catch (e) {
      await stopWahaSession(name);
      await new Promise(r => setTimeout(r, 1200));
      return await startWahaSession(name);
    }
  } catch (err) {
    return { success: false, message: `Gagal restart sesi: ${err.message}` };
  }
}

/**
 * Logout / Unlink Sesi WhatsApp
 */
async function logoutWahaSession(sessionName = null) {
  const config = getWahaConfig();
  const name = sessionName || config.session || 'default';
  try {
    const res = await wahaRequest('/api/sessions/logout', 'POST', { name });
    addWahaLog({
      type: 'SESSION_ACTION',
      action: 'LOGOUT',
      session: name,
      status: 'SUCCESS',
      details: 'Sesi WhatsApp diputuskan / logout'
    });
    return { success: true, message: `Perangkat pada sesi "${name}" berhasil diputuskan.`, data: res };
  } catch (err) {
    return { success: false, message: `Gagal logout sesi: ${err.message}` };
  }
}

/**
 * Mengambil QR Code untuk Pairing WhatsApp
 * Mendukung respon format Image Binary, Base64 Data URL, atau JSON Raw
 */
async function fetchWahaQrCode(sessionName = null) {
  const config = getWahaConfig();
  const name = sessionName || config.session || 'default';

  // 1. Coba endpoint gambar langsung /api/{session}/auth/qr
  try {
    const blob = await wahaRequest(`/api/${encodeURIComponent(name)}/auth/qr`, 'GET', null, 8000);
    if (blob instanceof Blob) {
      return {
        success: true,
        type: 'image',
        dataUrl: URL.createObjectURL(blob),
        raw: blob
      };
    } else if (typeof blob === 'object' && blob.qr) {
      return {
        success: true,
        type: 'raw',
        qrString: blob.qr
      };
    }
  } catch (err1) {
    // 2. Coba endpoint screenshot /api/screenshot?session={session}
    try {
      const shotBlob = await wahaRequest(`/api/screenshot?session=${encodeURIComponent(name)}`, 'GET', null, 8000);
      if (shotBlob instanceof Blob) {
        return {
          success: true,
          type: 'image',
          dataUrl: URL.createObjectURL(shotBlob),
          raw: shotBlob
        };
      }
    } catch (err2) {
      return {
        success: false,
        message: err1.message || err2.message || 'QR Code belum tersedia atau sesi sudah terhubung.'
      };
    }
  }

  return { success: false, message: 'Tidak dapat memperoleh QR Code.' };
}

/**
 * Mengirim Pesan Teks via WAHA Gateway
 */
async function sendWahaText(recipientPhone, text, sessionName = null) {
  const config = getWahaConfig();
  const session = sessionName || config.session || 'default';
  const chatId = formatWahaChatId(recipientPhone);

  if (!chatId) {
    return { success: false, message: 'Nomor telepon tujuan tidak valid.' };
  }
  if (!text || !text.trim()) {
    return { success: false, message: 'Isi pesan teks tidak boleh kosong.' };
  }

  const payload = {
    session,
    chatId,
    text: text.trim()
  };

  try {
    const res = await wahaRequest('/api/sendText', 'POST', payload, 15000);
    addWahaLog({
      type: 'OUTGOING_MESSAGE',
      recipient: recipientPhone,
      chatId,
      session,
      status: 'SENT',
      snippet: text.substring(0, 80),
      timestamp: new Date().toISOString()
    });
    return { success: true, message: 'Pesan WhatsApp berhasil dikirim!', data: res };
  } catch (err) {
    addWahaLog({
      type: 'OUTGOING_MESSAGE',
      recipient: recipientPhone,
      chatId,
      session,
      status: 'FAILED',
      snippet: text.substring(0, 80),
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return { success: false, message: `Gagal mengirim pesan: ${err.message}` };
  }
}

/**
 * Mengirim Pesan Media (Gambar Flyer / Poster) via WAHA Gateway
 */
async function sendWahaMedia(recipientPhone, fileUrl, caption = '', sessionName = null) {
  const config = getWahaConfig();
  const session = sessionName || config.session || 'default';
  const chatId = formatWahaChatId(recipientPhone);

  if (!chatId) {
    return { success: false, message: 'Nomor telepon tujuan tidak valid.' };
  }
  if (!fileUrl) {
    return { success: false, message: 'URL/Data gambar tidak boleh kosong.' };
  }

  const payload = {
    session,
    chatId,
    file: {
      url: fileUrl
    },
    caption: caption || ''
  };

  try {
    const res = await wahaRequest('/api/sendImage', 'POST', payload, 20000);
    addWahaLog({
      type: 'OUTGOING_MEDIA',
      recipient: recipientPhone,
      chatId,
      session,
      status: 'SENT',
      snippet: `[Gambar] ${caption.substring(0, 60)}`,
      timestamp: new Date().toISOString()
    });
    return { success: true, message: 'Media WhatsApp berhasil dikirim!', data: res };
  } catch (err) {
    addWahaLog({
      type: 'OUTGOING_MEDIA',
      recipient: recipientPhone,
      chatId,
      session,
      status: 'FAILED',
      snippet: `[Gambar] ${caption.substring(0, 60)}`,
      error: err.message,
      timestamp: new Date().toISOString()
    });
    return { success: false, message: `Gagal mengirim media: ${err.message}` };
  }
}

/**
 * Automasi 1: Notifikasi WhatsApp ke Admin saat ada Tiket CS Baru Masuk
 */
async function notifyAdminNewCsTicket(ticket) {
  const config = getWahaConfig();
  if (!config.enabled || !config.notifyAdminOnTicket || !config.adminPhone) {
    return false;
  }

  const ratingStars = '⭐'.repeat(ticket.rating || 5);
  const locationText = ticket.outlet_name || 'Outlet Amanda Balikpapan';
  const categoryLabel = (ticket.category || 'PENGADUAN').toUpperCase();

  const message = `🔔 *NOTIFIKASI TIKET CS BARU*\n` +
    `*Amanda Brownies Kota Balikpapan*\n` +
    `──────────────────────────\n` +
    `🔖 *ID Tiket:* #${ticket.id}\n` +
    `👤 *Nama:* ${ticket.name}\n` +
    `📱 *WhatsApp:* ${ticket.phone}\n` +
    `📍 *Lokasi:* ${locationText}\n` +
    `📂 *Kategori:* ${categoryLabel}\n` +
    `🧾 *No. Struk:* ${ticket.receipt_number || '-'}\n` +
    `⭐ *Kepuasan:* ${ratingStars} (${ticket.rating || 5}/5)\n` +
    `──────────────────────────\n` +
    `💬 *Isi Pesan/Keluhan:*\n"${ticket.message}"\n` +
    `──────────────────────────\n` +
    `⏰ *Waktu:* ${new Date(ticket.created_at || Date.now()).toLocaleString('id-ID')}\n` +
    `🔗 Buka Dashboard Admin untuk merespons: ${window.location.origin}/admin.html`;

  try {
    console.log('📤 Mengirim notifikasi tiket CS ke WhatsApp Admin...');
    return await sendWahaText(config.adminPhone, message, config.session);
  } catch (err) {
    console.warn('Gagal kirim notif tiket CS ke WhatsApp Admin:', err);
    return false;
  }
}

/**
 * Automasi 2: Notifikasi Konfirmasi WhatsApp ke Pelanggan saat Tiket CS Terkirim
 */
async function notifyCustomerNewCsTicket(ticket) {
  const config = getWahaConfig();
  if (!config.enabled || !config.notifyCustomerOnTicket || !ticket.phone) {
    return false;
  }

  const message = `Halo Kak *${ticket.name}*,\n\n` +
    `Terima kasih telah menghubungi *Layanan Pelanggan Resmi Amanda Brownies Balikpapan*.\n\n` +
    `Laporan/pengaduan Kakak telah berhasil kami terima dengan rincian:\n` +
    `🔖 *Nomor Tiket:* #${ticket.id}\n` +
    `📍 *Outlet/Booth:* ${ticket.outlet_name || 'Balikpapan'}\n` +
    `📅 *Tanggal:* ${new Date(ticket.created_at || Date.now()).toLocaleDateString('id-ID')}\n` +
    `📊 *Status:* Sedang Ditinjau Tim Layanan\n\n` +
    `Tim Customer Service Amanda Brownies Balikpapan akan segera menindaklanjuti keluhan/pesanan ini. Mohon simpan nomor tiket ini untuk pengecekan berkala.\n\n` +
    `Salam hangat,\n*Amanda Brownies Balikpapan* 🤎`;

  try {
    return await sendWahaText(ticket.phone, message, config.session);
  } catch (err) {
    console.warn('Gagal kirim konfirmasi ke pelanggan:', err);
    return false;
  }
}

/**
 * Automasi 3: Notifikasi WhatsApp ke Pelanggan saat Status Tiket Diubah
 */
async function notifyCustomerCsStatus(ticket, newStatus) {
  const config = getWahaConfig();
  if (!config.enabled || !config.notifyCustomerOnStatus || !ticket.phone) {
    return false;
  }

  let statusText = 'Sedang Diproses';
  let statusNote = 'Tim kami sedang menindaklanjuti pengaduan/pesanan Kakak di outlet terkait.';

  if (newStatus === 'RESOLVED') {
    statusText = 'Telah Diselesaikan (Resolved)';
    statusNote = 'Terima kasih atas kesabaran Kakak. Masukan Kakak sangat berharga untuk meningkatkan kualitas pelayanan Amanda Brownies Balikpapan.';
  } else if (newStatus === 'IN_PROGRESS') {
    statusText = 'Sedang Ditangani';
    statusNote = 'Tim operasional cabang saat ini sedang melakukan pengecekan langsung di titik outlet.';
  }

  const message = `Halo Kak *${ticket.name}*,\n\n` +
    `Pemberitahuan pembaruan status pengaduan Anda di *Amanda Brownies Balikpapan*:\n\n` +
    `🔖 *ID Tiket:* #${ticket.id}\n` +
    `📊 *Status Baru:* *${statusText}*\n` +
    `📝 *Keterangan:* ${statusNote}\n\n` +
    `Jika ada pertanyaan lebih lanjut, silakan balas pesan WhatsApp ini.\n\n` +
    `Salam manis,\n*Amanda Brownies Balikpapan* 🤎`;

  try {
    return await sendWahaText(ticket.phone, message, config.session);
  } catch (err) {
    console.warn('Gagal kirim status update ke pelanggan:', err);
    return false;
  }
}

/**
 * Sistem Penyimpanan Riwayat Pengiriman WAHA (Logs)
 */
function getWahaLogs() {
  try {
    const raw = localStorage.getItem(WAHA_LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addWahaLog(entry) {
  try {
    const logs = getWahaLogs();
    const newEntry = {
      id: 'LOG-' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      ...entry
    };
    logs.unshift(newEntry);
    // Simpan maksimal 60 log terbaru
    if (logs.length > 60) logs.pop();
    localStorage.setItem(WAHA_LOGS_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('amanda_waha_logs_updated', { detail: logs }));
  } catch (e) {}
}

function clearWahaLogs() {
  try {
    localStorage.removeItem(WAHA_LOGS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('amanda_waha_logs_updated', { detail: [] }));
    return true;
  } catch (e) {
    return false;
  }
}

// Inisialisasi awal saat script dimuat
(function initWahaGateway() {
  if (typeof window !== 'undefined') {
    window.getWahaConfig = getWahaConfig;
    window.saveWahaConfig = saveWahaConfig;
    window.testWahaServer = testWahaServer;
    window.fetchWahaSessions = fetchWahaSessions;
    window.getWahaSessionStatus = getWahaSessionStatus;
    window.startWahaSession = startWahaSession;
    window.stopWahaSession = stopWahaSession;
    window.restartWahaSession = restartWahaSession;
    window.logoutWahaSession = logoutWahaSession;
    window.fetchWahaQrCode = fetchWahaQrCode;
    window.sendWahaText = sendWahaText;
    window.sendWahaMedia = sendWahaMedia;
    window.notifyAdminNewCsTicket = notifyAdminNewCsTicket;
    window.notifyCustomerNewCsTicket = notifyCustomerNewCsTicket;
    window.notifyCustomerCsStatus = notifyCustomerCsStatus;
    window.getWahaLogs = getWahaLogs;
    window.clearWahaLogs = clearWahaLogs;
    window.formatWahaChatId = formatWahaChatId;
  }
})();

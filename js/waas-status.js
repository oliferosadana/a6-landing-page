/**
 * BORNEOLINK WAAS - TENANT SUSPENSION CHECKER & REALTIME STATUS ENFORCER
 * Ensures the website respects the WAAS platform Active/Suspended status in real-time.
 */

(function initWaasStatusEnforcer() {
  const DEFAULT_WAAS_SUPABASE_URL = 'https://zomkdefqivvbtxqzavpz.supabase.co';
  const DEFAULT_WAAS_SUPABASE_KEY = 'sb_publishable_xG2a15CPnDELITqWHdodiQ__PnNZX8-';

  const vault = typeof getSecurityVaultData === 'function' ? getSecurityVaultData() : null;
  const WAAS_SUPABASE_URL = (vault && vault.supabaseUrl && !vault.supabaseUrl.includes('ffzzlertrzfrpuhbspws'))
    ? vault.supabaseUrl
    : (typeof DEFAULT_SUPABASE_URL !== 'undefined' && !DEFAULT_SUPABASE_URL.includes('ffzzlertrzfrpuhbspws')
      ? DEFAULT_SUPABASE_URL
      : DEFAULT_WAAS_SUPABASE_URL);

  const WAAS_SUPABASE_KEY = (vault && vault.supabaseAnonKey && !vault.supabaseAnonKey.includes('64yf0NZHiOLEylWhspci4A'))
    ? vault.supabaseAnonKey
    : (typeof DEFAULT_SUPABASE_KEY !== 'undefined' && !DEFAULT_SUPABASE_KEY.includes('64yf0NZHiOLEylWhspci4A')
      ? DEFAULT_SUPABASE_KEY
      : DEFAULT_WAAS_SUPABASE_KEY);

  const TENANT_ID = 'tenant_amanda';
  const WEBSITE_SUBDOMAIN = 'amanda';

  let waasClient = null;
  let isCurrentlySuspended = false;

  function createSuspensionOverlay(reason) {
    let overlay = document.getElementById('waas-suspended-overlay');
    if (overlay) return overlay;

    isCurrentlySuspended = true;
    overlay = document.createElement('div');
    overlay.id = 'waas-suspended-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999999;
      background: radial-gradient(circle at center, #0f172a, #020617);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(20px);
      animation: fadeIn 0.3s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        max-width: 520px;
        width: 100%;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(244, 63, 94, 0.35);
        box-shadow: 0 25px 50px -12px rgba(244, 63, 94, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
        border-radius: 28px;
        padding: 40px 32px;
        text-align: center;
      ">
        <div style="
          width: 72px;
          height: 72px;
          margin: 0 auto 20px auto;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f43f5e;
          font-size: 32px;
        ">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <div style="
          display: inline-block;
          padding: 4px 14px;
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.4);
          border-radius: 100px;
          color: #fda4af;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        ">
          503 Service Suspended
        </div>

        <h2 style="
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px 0;
          letter-spacing: -0.02em;
        ">
          Layanan Website Ditangguhkan
        </h2>

        <p style="
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.6;
          margin: 0 0 24px 0;
        ">
          ${reason || 'Website ini sedang dinonaktifkan sementara oleh Super Admin atau masa aktif paket langganan telah berakhir.'}
        </p>

        <div style="
          padding: 16px;
          background: rgba(2, 6, 23, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          text-align: left;
          font-size: 12px;
          color: #cbd5e1;
          margin-bottom: 24px;
        ">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Domain:</span>
            <strong style="color: #ffffff;">${window.location.hostname}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Status Jaringan:</span>
            <span style="color: #f43f5e; font-family: monospace; font-weight: 700;">SUSPENDED (INACTIVE)</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            border-radius: 100px;
            text-decoration: none;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
            transition: all 0.2s;
          ">
            <i class="fa-solid fa-credit-card"></i> Panel Billing & Perpanjangan
          </a>
          <button onclick="window.location.reload()" style="
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #e2e8f0;
            font-size: 12px;
            font-weight: 600;
            border-radius: 100px;
            cursor: pointer;
          ">
            <i class="fa-solid fa-rotate-right"></i> Cek Ulang
          </button>
        </div>

        <div style="
          margin-top: 24px;
          font-size: 11px;
          color: #64748b;
          font-family: monospace;
        ">
          BorneoLink Cloud Network &bull; HTTP 503 Service Unavailable
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function removeSuspensionOverlay() {
    isCurrentlySuspended = false;
    const overlay = document.getElementById('waas-suspended-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  async function checkWaasStatus() {
    if (typeof supabase === 'undefined' || !supabase.createClient) return;

    if (!waasClient) {
      try {
        waasClient = supabase.createClient(WAAS_SUPABASE_URL, WAAS_SUPABASE_KEY);
      } catch (e) {
        console.warn('WAAS client init error:', e);
        return;
      }
    }

    try {
      // 1. Fetch live status from WAAS Supabase database
      const [
        { data: tenantData },
        { data: websiteDataList },
        { data: subData }
      ] = await Promise.all([
        waasClient.from('tenants').select('status').eq('id', TENANT_ID).maybeSingle(),
        waasClient.from('websites').select('status, subdomain').or(`subdomain.eq.${WEBSITE_SUBDOMAIN},tenant_id.eq.${TENANT_ID}`),
        waasClient.from('subscriptions').select('status, current_period_end').eq('tenant_id', TENANT_ID).maybeSingle()
      ]);

      const isTenantSuspended = tenantData && tenantData.status === 'SUSPENDED';
      const isWebsiteSuspended = websiteDataList && websiteDataList.some(w => w.status === 'SUSPENDED');
      const isSubscriptionSuspended = subData && (subData.status === 'SUSPENDED' || subData.status === 'CANCELLED');
      const isSubscriptionExpired = subData && subData.current_period_end && (new Date(subData.current_period_end).getTime() < Date.now()) && subData.status !== 'ACTIVE';

      if (isTenantSuspended || isWebsiteSuspended || isSubscriptionSuspended || isSubscriptionExpired) {
        let reason = 'Website ini sedang dinonaktifkan sementara oleh Super Admin atau masa aktif paket langganan telah berakhir.';
        if (isTenantSuspended) {
          reason = 'Tenant organisasi dinonaktifkan oleh administrator platform BorneoLink WAAS.';
        } else if (isWebsiteSuspended) {
          reason = 'Website engine dinonaktifkan oleh administrator platform BorneoLink WAAS.';
        } else if (isSubscriptionSuspended || isSubscriptionExpired) {
          reason = 'Masa sewa langganan telah habis atau ditangguhkan. Silakan perpanjang sewa melalui dashboard customer.';
        }
        createSuspensionOverlay(reason);
      } else {
        removeSuspensionOverlay();
      }

      // 2. Setup Realtime subscription if not already subscribed
      if (!waasClient._hasStatusChannel) {
        waasClient._hasStatusChannel = true;
        waasClient
          .channel('waas-live-status-enforcer')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'websites' }, () => checkWaasStatus())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tenants' }, () => checkWaasStatus())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => checkWaasStatus())
          .subscribe();
      }

    } catch (err) {
      console.warn('WAAS status check error:', err);
    }
  }

  // Fallback Polling every 10 seconds to catch state changes immediately
  setInterval(checkWaasStatus, 10000);

  // Run check on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkWaasStatus);
  } else {
    checkWaasStatus();
  }
})();

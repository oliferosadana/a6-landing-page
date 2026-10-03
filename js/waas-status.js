/**
 * BORNEOLINK WAAS - TENANT SUSPENSION CHECKER & REALTIME STATUS ENFORCER
 * Ensures the website respects the WAAS platform Active/Suspended status in real-time.
 */

(function initWaasStatusEnforcer() {
  const WAAS_SUPABASE_URL = 'https://zomkdefqivvbtxqzavpz.supabase.co';
  const WAAS_SUPABASE_KEY = 'sb_publishable_xG2a15CPnDELITqWHdodiQ__PnNZX8-';
  const TENANT_ID = 'tenant_amanda';
  const WEBSITE_SUBDOMAIN = 'amanda';

  let waasClient = null;

  function createSuspensionOverlay() {
    let overlay = document.getElementById('waas-suspended-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'waas-suspended-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: radial-gradient(circle at center, #0f172a, #020617);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(16px);
      animation: fadeIn 0.3s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        max-width: 520px;
        width: 100%;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(244, 63, 94, 0.3);
        box-shadow: 0 25px 50px -12px rgba(244, 63, 94, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05);
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
          Website ini sedang dinonaktifkan sementara oleh Super Admin atau masa aktif paket langganan telah berakhir.
        </p>

        <div style="
          padding: 16px;
          background: rgba(2, 6, 23, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          margin-bottom: 24px;
          text-align: left;
          font-size: 12px;
          color: #cbd5e1;
        ">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="color: #64748b;">Tenant:</span>
            <strong style="color: #ffffff;">Amanda Brownies Kalimantan</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Platform:</span>
            <span style="color: #38bdf8; font-family: monospace;">BorneoLink WAAS</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <a href="http://localhost:5173" target="_blank" style="
            padding: 12px 24px;
            background: #2563eb;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            border-radius: 100px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            transition: transform 0.15s;
          ">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Buka Portal Admin WAAS
          </a>
          <button onclick="window.location.reload()" style="
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #e2e8f0;
            font-size: 12px;
            font-weight: 700;
            border-radius: 100px;
            cursor: pointer;
          ">
            <i class="fa-solid fa-rotate-right"></i> Refresh
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function removeSuspensionOverlay() {
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
        { data: websiteData }
      ] = await Promise.all([
        waasClient.from('tenants').select('status').eq('id', TENANT_ID).maybeSingle(),
        waasClient.from('websites').select('status').eq('subdomain', WEBSITE_SUBDOMAIN).maybeSingle()
      ]);

      const isTenantSuspended = tenantData && tenantData.status === 'SUSPENDED';
      const isWebsiteSuspended = websiteData && websiteData.status === 'SUSPENDED';

      if (isTenantSuspended || isWebsiteSuspended) {
        console.warn('⚠️ WAAS Notice: Website is currently SUSPENDED by Super Admin.');
        createSuspensionOverlay();
      } else {
        removeSuspensionOverlay();
      }

      // 2. Listen to Realtime changes so it immediately reflects when Super Admin toggles
      waasClient
        .channel('waas-live-status-enforcer')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'websites' }, (payload) => {
          if (payload.new && payload.new.subdomain === WEBSITE_SUBDOMAIN) {
            if (payload.new.status === 'SUSPENDED') {
              createSuspensionOverlay();
            } else {
              removeSuspensionOverlay();
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tenants' }, (payload) => {
          if (payload.new && payload.new.id === TENANT_ID) {
            if (payload.new.status === 'SUSPENDED') {
              createSuspensionOverlay();
            } else {
              removeSuspensionOverlay();
            }
          }
        })
        .subscribe();

    } catch (err) {
      console.warn('WAAS status check error:', err);
    }
  }

  // Run check on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkWaasStatus);
  } else {
    checkWaasStatus();
  }
})();

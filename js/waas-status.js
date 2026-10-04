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
      background: rgba(15, 23, 42, 0.5);
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      animation: fadeIn 0.25s ease-out;
    `;

    overlay.innerHTML = `
      <div style="
        max-width: 460px;
        width: 100%;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
        border-radius: 20px;
        padding: 32px 28px;
        text-align: center;
      ">
        <div style="
          width: 52px;
          height: 52px;
          margin: 0 auto 16px auto;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.25);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f43f5e;
          font-size: 22px;
        ">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <div style="
          display: inline-block;
          padding: 3px 12px;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: 100px;
          color: #fda4af;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
        ">
          503 Service Suspended
        </div>

        <h2 style="
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 8px 0;
          letter-spacing: -0.02em;
        ">
          Layanan Website Ditangguhkan
        </h2>

        <p style="
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.55;
          margin: 0 0 20px 0;
        ">
          ${reason || 'Website ini sedang dinonaktifkan sementara oleh administrator atau masa aktif paket langganan telah berakhir.'}
        </p>

        <div style="
          padding: 12px 16px;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          text-align: left;
          font-size: 12px;
          color: #cbd5e1;
        ">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: #64748b;">Domain</span>
            <strong style="color: #ffffff; font-weight: 600;">${window.location.hostname}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748b;">Status Jaringan</span>
            <span style="color: #f43f5e; font-weight: 700;">SUSPENDED</span>
          </div>
        </div>

        <div style="
          margin-top: 20px;
          font-size: 11px;
          color: #64748b;
        ">
          BorneoLink Cloud Network
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

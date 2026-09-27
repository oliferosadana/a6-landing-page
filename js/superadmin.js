/**
 * AMANDA BROWNIES KALIMANTAN - SUPERADMIN PLATFORM CONTROLLER
 * Full management for Tenants, Global Invoices, Master Pricing, and Financial Metrics.
 */

let activeTenantFilter = 'all';
let activeInvoiceFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderSaOverview();
  renderSaTenantsTable();
  renderSaInvoicesTable();
  renderSaPlansGrid();
  renderSaGatewayGrid();

  // Listen for storage events from other tabs
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith('amanda_')) {
      renderSaOverview();
      renderSaTenantsTable();
      renderSaInvoicesTable();
    }
  });
});

// ===================================================================
// TAB & SIDEBAR NAVIGATION
// ===================================================================
function switchSaTab(tabName, btnElem) {
  document.querySelectorAll('.sa-nav-item').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');

  document.querySelectorAll('.sa-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(`sa-sec-${tabName}`);
  if (target) target.classList.add('active');

  const headingMap = {
    'overview': 'Ringkasan Platform WaaS',
    'tenants': 'Manajemen Penyewa Sistem (Tenants)',
    'invoices': 'Pusat Verifikasi Invoice & Tagihan',
    'plans': 'Master Paket Sewa & Tarif Sistem',
    'gateway': 'Pengaturan Rekening & QRIS Platform'
  };
  const heading = document.getElementById('sa-page-heading');
  if (heading) heading.textContent = headingMap[tabName] || 'Superadmin Platform';

  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sa-sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  // Refresh tab data
  if (tabName === 'overview') renderSaOverview();
  if (tabName === 'tenants') renderSaTenantsTable();
  if (tabName === 'invoices') renderSaInvoicesTable();
  if (tabName === 'plans') renderSaPlansGrid();
  if (tabName === 'gateway') renderSaGatewayGrid();
}

function toggleSaSidebar() {
  const sidebar = document.getElementById('sa-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ===================================================================
// 1. OVERVIEW & FINANCIAL METRICS
// ===================================================================
function renderSaOverview() {
  const tenants = getTenants();
  const invoices = getInvoiceHistory();

  // 1. Calculate Total Revenue from PAID invoices
  const paidInvoices = invoices.filter(i => i.status === 'PAID');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.totalAmount || i.subtotal || 0), 0);

  // 2. Active Tenants Count
  const activeTenants = tenants.filter(t => {
    const days = calculateRemainingDays(t.expiresAt);
    return t.status === 'active' && days > 0;
  });

  // 3. Pending Invoices Count
  const pendingInvoices = invoices.filter(i => i.status === 'PENDING');

  // 4. Calculate Estimated MRR (Monthly Recurring Revenue)
  let mrr = 0;
  activeTenants.forEach(t => {
    if (t.cycle === 'yearly') {
      mrr += (t.totalPaid || 899000) / 12;
    } else {
      mrr += (t.totalPaid || 99000);
    }
  });

  // DOM bindings
  document.getElementById('sa-stat-revenue').textContent = formatSaRupiah(totalRevenue);
  document.getElementById('sa-stat-active-tenants').textContent = activeTenants.length;
  document.getElementById('sa-stat-total-tenants-desc').textContent = `Dari ${tenants.length} cabang terdaftar`;
  document.getElementById('sa-stat-pending-invoices').textContent = pendingInvoices.length;
  document.getElementById('sa-stat-mrr').textContent = formatSaRupiah(Math.round(mrr));

  // Badges in sidebar
  document.getElementById('badge-tenants-count').textContent = tenants.length;
  document.getElementById('badge-pending-invoices').textContent = pendingInvoices.length;

  // 5. Render Expiring Tenants Warning Card
  renderExpiringTenantsList(tenants);

  // 6. Render Recent Invoices List
  renderRecentInvoicesOverview(invoices);
}

function renderExpiringTenantsList(tenants) {
  const container = document.getElementById('sa-overview-expiring-list');
  if (!container) return;

  const urgentTenants = tenants.map(t => {
    return { ...t, daysLeft: calculateRemainingDays(t.expiresAt) };
  }).sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);

  if (urgentTenants.length === 0) {
    container.innerHTML = '<p style="font-size: 13px; color: var(--text-dim);">Belum ada penyewa yang terdaftar.</p>';
    return;
  }

  container.innerHTML = urgentTenants.map(t => {
    const isExpired = t.daysLeft <= 0 || t.status === 'expired';
    const isWarning = t.daysLeft > 0 && t.daysLeft <= 14;

    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(216,201,168,0.3);">
        <div>
          <strong style="font-size: 13.5px; color: var(--text-main); display: block;">${t.name}</strong>
          <span style="font-size: 11.5px; color: var(--text-dim);">${t.domain} • ${t.planName || 'Paket Usaha'}</span>
        </div>
        <div style="text-align: right;">
          <span class="sa-status-pill ${isExpired ? 'expired' : (isWarning ? 'pending' : 'active')}">
            ${isExpired ? 'Kadaluarsa' : `${t.daysLeft} Hari Lagi`}
          </span>
          <button class="btn-sm" style="margin-left: 8px;" onclick="openExtendModal('${t.id}')">
            <i class="fa-solid fa-plus"></i> Perpanjang
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderRecentInvoicesOverview(invoices) {
  const container = document.getElementById('sa-overview-recent-invoices');
  if (!container) return;

  const recent = invoices.slice(0, 4);

  if (recent.length === 0) {
    container.innerHTML = '<p style="font-size: 13px; color: var(--text-dim);">Belum ada transaksi invoice.</p>';
    return;
  }

  container.innerHTML = recent.map(inv => {
    const isPaid = inv.status === 'PAID';
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(216,201,168,0.3);">
        <div>
          <strong style="font-size: 13px; font-family: monospace; color: var(--ch-olive);">${inv.id}</strong>
          <span style="font-size: 11.5px; color: var(--text-muted); display: block;">${inv.tenantName} (${formatSaRupiah(inv.totalAmount)})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="sa-status-pill ${isPaid ? 'active' : 'pending'}">
            ${isPaid ? 'LUNAS' : 'PENDING'}
          </span>
          ${!isPaid ? `
            <button class="btn-sa-act approve" onclick="approveInvoicePayment('${inv.id}')" title="Verifikasi Lunas">
              <i class="fa-solid fa-check"></i>
            </button>
          ` : `
            <a href="invoice.html?id=${inv.id}" target="_blank" class="btn-sa-act" title="Buka Invoice">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// ===================================================================
// 2. TENANTS MANAGEMENT
// ===================================================================
function renderSaTenantsTable() {
  const tbody = document.getElementById('sa-tenants-tbody');
  if (!tbody) return;

  const tenants = getTenants();

  // Update counts
  const countAll = tenants.length;
  const countActive = tenants.filter(t => t.status === 'active' && calculateRemainingDays(t.expiresAt) > 0).length;
  const countExpired = tenants.filter(t => t.status === 'expired' || calculateRemainingDays(t.expiresAt) <= 0).length;

  document.getElementById('count-tenant-all').textContent = countAll;
  document.getElementById('count-tenant-active').textContent = countActive;
  document.getElementById('count-tenant-expired').textContent = countExpired;

  // Filter
  const query = (document.getElementById('tenant-search-input')?.value || '').toLowerCase();
  const filtered = tenants.filter(t => {
    const days = calculateRemainingDays(t.expiresAt);
    const matchesFilter = activeTenantFilter === 'all'
      || (activeTenantFilter === 'active' && t.status === 'active' && days > 0)
      || (activeTenantFilter === 'expired' && (t.status === 'expired' || days <= 0));

    const matchesQuery = t.name.toLowerCase().includes(query)
      || (t.city && t.city.toLowerCase().includes(query))
      || (t.domain && t.domain.toLowerCase().includes(query))
      || (t.phone && t.phone.includes(query));

    return matchesFilter && matchesQuery;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-dim);">
          Tidak ada data penyewa yang sesuai dengan filter.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(t => {
    const days = calculateRemainingDays(t.expiresAt);
    const isExpired = t.status === 'expired' || days <= 0;

    return `
      <tr>
        <td>
          <strong style="font-size: 13.5px;">${t.name}</strong>
          <div style="font-size: 11px; color: var(--text-dim);">
            <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> ${t.phone} • ${t.email || '-'}
          </div>
        </td>
        <td style="font-size: 12.5px; color: var(--text-muted);">
          ${t.city || '-'}
        </td>
        <td>
          <strong style="font-size: 12.5px;">${t.planName || 'Paket Usaha'}</strong>
          <div style="font-size: 11px; color: var(--ch-gold-dark);">
            ${t.cycle === 'yearly' ? '⭐ Siklus Tahunan' : '🗓️ Siklus Bulanan'}
          </div>
        </td>
        <td>
          <div style="font-weight: 700; color: ${isExpired ? '#c0392b' : (days <= 14 ? '#d97706' : '#15803d')};">
            ${isExpired ? '0 Hari (Berakhir)' : `${days} Hari Lagi`}
          </div>
          <div style="font-size: 11px; color: var(--text-dim);">
            Exp: ${formatSaDate(t.expiresAt)}
          </div>
        </td>
        <td>
          <a href="index.html" target="_blank" style="color: var(--ch-olive); font-weight: 600; text-decoration: none; font-size: 12px;">
            ${t.domain} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px;"></i>
          </a>
        </td>
        <td>
          <span class="sa-status-pill ${isExpired ? 'expired' : (t.status === 'suspended' ? 'suspended' : 'active')}">
            ${isExpired ? 'EXPIRED' : (t.status === 'suspended' ? 'SUSPENDED' : 'AKTIF')}
          </span>
        </td>
        <td>
          <div class="sa-table-actions">
            <button class="btn-sa-act" onclick="openExtendModal('${t.id}')" title="Perpanjang Masa Sewa">
              <i class="fa-solid fa-clock-rotate-left"></i> +Durasi
            </button>
            <button class="btn-sa-act" onclick="editTenantModal('${t.id}')" title="Edit Data Penyewa">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-sa-act danger" onclick="deleteTenant('${t.id}')" title="Hapus Penyewa">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setTenantFilter(filter, btn) {
  activeTenantFilter = filter;
  document.querySelectorAll('.filter-tabs .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSaTenantsTable();
}

function filterTenantsTable() {
  renderSaTenantsTable();
}

// Modal Tenant Add/Edit
function openTenantModal() {
  document.getElementById('sa-tenant-form').reset();
  document.getElementById('tenant-form-id').value = '';
  document.getElementById('sa-tenant-modal-title').textContent = 'Tambah Cabang / Penyewa Baru';
  document.getElementById('sa-tenant-modal').classList.add('active');
}

function editTenantModal(tenantId) {
  const tenants = getTenants();
  const t = tenants.find(item => item.id === tenantId);
  if (!t) return;

  document.getElementById('tenant-form-id').value = t.id;
  document.getElementById('tenant-form-name').value = t.name || '';
  document.getElementById('tenant-form-city').value = t.city || '';
  document.getElementById('tenant-form-domain').value = t.domain || '';
  document.getElementById('tenant-form-phone').value = t.phone || '';
  document.getElementById('tenant-form-email').value = t.email || '';
  document.getElementById('tenant-form-plan').value = t.planId || 'plan-6m';
  document.getElementById('tenant-form-status').value = t.status || 'active';
  document.getElementById('tenant-form-notes').value = t.notes || '';

  document.getElementById('sa-tenant-modal-title').textContent = 'Edit Data Cabang Penyewa';
  document.getElementById('sa-tenant-modal').classList.add('active');
}

function saveTenantForm(e) {
  e.preventDefault();
  const id = document.getElementById('tenant-form-id').value;
  const name = document.getElementById('tenant-form-name').value.trim();
  const city = document.getElementById('tenant-form-city').value.trim();
  const domain = document.getElementById('tenant-form-domain').value.trim();
  const phone = document.getElementById('tenant-form-phone').value.trim();
  const email = document.getElementById('tenant-form-email').value.trim();
  const planId = document.getElementById('tenant-form-plan').value;
  const status = document.getElementById('tenant-form-status').value;
  const notes = document.getElementById('tenant-form-notes').value.trim();

  const plans = getRentalPlans();
  const selectedPlan = plans.find(p => p.id === planId) || { name: 'Paket Usaha', cycle: 'monthly', durationMonths: 6 };

  const tenants = getTenants();

  if (id) {
    // Edit existing
    const idx = tenants.findIndex(t => t.id === id);
    if (idx !== -1) {
      tenants[idx] = {
        ...tenants[idx],
        name, city, domain, phone, email, planId,
        planName: selectedPlan.name,
        cycle: selectedPlan.cycle || 'monthly',
        status, notes
      };
    }
  } else {
    // Create new
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + (selectedPlan.durationMonths || 1));

    const newTenant = {
      id: 'tenant-' + Date.now().toString(36),
      name, city, domain, phone, email, planId,
      planName: selectedPlan.name,
      cycle: selectedPlan.cycle || 'monthly',
      status, notes,
      startDate: now.toISOString().split('T')[0],
      expiresAt: expiry.toISOString().split('T')[0],
      totalPaid: selectedPlan.price || 0,
      outletsCount: 1
    };
    tenants.unshift(newTenant);
  }

  saveTenants(tenants);
  closeSaModal('sa-tenant-modal');
  renderSaOverview();
  renderSaTenantsTable();
  showSaToast('Data penyewa berhasil disimpan!');
}

function deleteTenant(tenantId) {
  if (confirm('Yakin ingin menghapus data cabang penyewa ini dari platform?')) {
    let tenants = getTenants();
    tenants = tenants.filter(t => t.id !== tenantId);
    saveTenants(tenants);
    renderSaOverview();
    renderSaTenantsTable();
    showSaToast('Penyewa berhasil dihapus.');
  }
}

// Quick Extend Subscription Modal
function openExtendModal(tenantId) {
  const tenants = getTenants();
  const t = tenants.find(item => item.id === tenantId);
  if (!t) return;

  document.getElementById('extend-tenant-id').value = t.id;
  document.getElementById('extend-tenant-name').textContent = t.name;
  document.getElementById('sa-extend-modal').classList.add('active');
}

function applyManualExtension(monthsToAdd) {
  const tenantId = document.getElementById('extend-tenant-id').value;
  const tenants = getTenants();
  const idx = tenants.findIndex(t => t.id === tenantId);
  if (idx === -1) return;

  let baseDate = new Date();
  if (tenants[idx].expiresAt) {
    const curExp = new Date(tenants[idx].expiresAt);
    if (curExp > baseDate) baseDate = curExp;
  }

  const newExp = new Date(baseDate);
  newExp.setMonth(newExp.getMonth() + monthsToAdd);

  tenants[idx].expiresAt = newExp.toISOString().split('T')[0];
  tenants[idx].status = 'active';

  saveTenants(tenants);
  closeSaModal('sa-extend-modal');
  renderSaOverview();
  renderSaTenantsTable();
  showSaToast(`Masa sewa ${tenants[idx].name} berhasil diperpanjang +${monthsToAdd} bulan!`);
}

// ===================================================================
// 3. INVOICES & VERIFICATION
// ===================================================================
function renderSaInvoicesTable() {
  const tbody = document.getElementById('sa-invoices-tbody');
  if (!tbody) return;

  const invoices = getInvoiceHistory();

  // Update counts
  const countAll = invoices.length;
  const countPending = invoices.filter(i => i.status === 'PENDING').length;
  const countPaid = invoices.filter(i => i.status === 'PAID').length;

  document.getElementById('count-inv-all').textContent = countAll;
  document.getElementById('count-inv-pending').textContent = countPending;
  document.getElementById('count-inv-paid').textContent = countPaid;

  const query = (document.getElementById('invoice-search-input')?.value || '').toLowerCase();
  const filtered = invoices.filter(inv => {
    const matchesFilter = activeInvoiceFilter === 'all' || inv.status === activeInvoiceFilter;
    const matchesQuery = inv.id.toLowerCase().includes(query)
      || (inv.tenantName && inv.tenantName.toLowerCase().includes(query))
      || (inv.planName && inv.planName.toLowerCase().includes(query));

    return matchesFilter && matchesQuery;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 32px; color: var(--text-dim);">
          Tidak ada data invoice yang sesuai.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(inv => {
    const isPaid = inv.status === 'PAID';

    return `
      <tr>
        <td>
          <span style="font-family: monospace; font-weight: 700; color: var(--ch-olive-dark); background: rgba(79,91,42,0.1); padding: 3px 8px; border-radius: 4px;">
            ${inv.id}
          </span>
        </td>
        <td style="font-size: 12px; color: var(--text-muted);">
          ${formatSaDate(inv.createdAt || inv.date)}
        </td>
        <td>
          <strong style="font-size: 13px;">${inv.tenantName || 'Mitra Cabang'}</strong>
          <div style="font-size: 11px; color: var(--text-dim);">${inv.tenantPhone || '-'}</div>
        </td>
        <td>
          <strong style="font-size: 12.5px;">${inv.planName || 'Paket Sewa'}</strong>
          <div style="font-size: 11px; color: var(--text-dim);">+${inv.durationMonths || 1} Bulan</div>
        </td>
        <td>
          <strong style="font-size: 13.5px; color: var(--text-main);">${formatSaRupiah(inv.totalAmount || inv.subtotal)}</strong>
        </td>
        <td style="font-size: 12px; color: var(--text-muted);">
          ${(inv.paymentMethodName || 'Transfer').split('(')[0].trim()}
        </td>
        <td>
          <span class="sa-status-pill ${isPaid ? 'active' : 'pending'}">
            ${isPaid ? 'LUNAS' : 'PENDING'}
          </span>
        </td>
        <td>
          <div class="sa-table-actions">
            ${!isPaid ? `
              <button class="btn-sa-act approve" onclick="approveInvoicePayment('${inv.id}')" title="Verifikasi Lunas & Aktifkan Sewa">
                <i class="fa-solid fa-circle-check"></i> Verifikasi Lunas
              </button>
            ` : `
              <span style="font-size: 11px; color: #15803d; font-weight: 700;"><i class="fa-solid fa-check-double"></i> Terverifikasi</span>
            `}
            <a href="invoice.html?id=${inv.id}" target="_blank" class="btn-sa-act" title="Buka / Cetak Invoice">
              <i class="fa-solid fa-receipt"></i>
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setInvoiceFilter(filter, btn) {
  activeInvoiceFilter = filter;
  document.querySelectorAll('.filter-tabs .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderSaInvoicesTable();
}

function filterInvoicesTable() {
  renderSaInvoicesTable();
}

/**
 * 1-Click Approve Invoice Payment
 */
function approveInvoicePayment(invoiceId) {
  const invoices = getInvoiceHistory();
  const inv = invoices.find(i => i.id === invoiceId);
  if (!inv) return;

  if (confirm(`Verifikasi pembayaran LUNAS untuk Invoice #${inv.id} sebesar ${formatSaRupiah(inv.totalAmount)}?`)) {
    inv.status = 'PAID';
    inv.paidAt = new Date().toISOString();
    saveInvoiceHistory(invoices);

    // Auto extend tenant subscription
    const tenants = getTenants();
    const duration = inv.durationMonths || 1;
    let targetTenant = tenants.find(t => t.name === inv.tenantName || t.phone === inv.tenantPhone);

    if (targetTenant) {
      let baseDate = new Date();
      if (targetTenant.expiresAt && new Date(targetTenant.expiresAt) > baseDate) {
        baseDate = new Date(targetTenant.expiresAt);
      }
      const newExp = new Date(baseDate);
      newExp.setMonth(newExp.getMonth() + duration);
      targetTenant.expiresAt = newExp.toISOString().split('T')[0];
      targetTenant.status = 'active';
      targetTenant.totalPaid = (targetTenant.totalPaid || 0) + (inv.totalAmount || 0);
      saveTenants(tenants);
    }

    renderSaOverview();
    renderSaInvoicesTable();
    renderSaTenantsTable();
    showSaToast(`Invoice #${inv.id} berhasil diverifikasi LUNAS!`);
  }
}

// ===================================================================
// 4. MASTER PRICING PLANS
// ===================================================================
function renderSaPlansGrid() {
  const container = document.getElementById('sa-plans-grid');
  if (!container) return;

  const plans = getRentalPlans();

  container.innerHTML = plans.map(p => {
    return `
      <div class="plan-admin-card">
        <div>
          <div class="plan-admin-head">
            <span class="plan-admin-cycle">${p.cycle === 'yearly' ? '⭐ Paket Tahunan' : '🗓️ Paket Bulanan'}</span>
            <h3 class="plan-admin-title">${p.name}</h3>
            <div class="plan-admin-price">${formatSaRupiah(p.price)} <small style="font-size: 12px; color: var(--text-dim);">/ ${p.durationMonths} bln</small></div>
            ${p.discountLabel ? `<span style="font-size: 11px; color: #15803d; font-weight: 700; background: rgba(37,211,102,0.15); padding: 2px 6px; border-radius: 4px;">${p.discountLabel}</span>` : ''}
          </div>
          <ul class="plan-admin-features">
            ${p.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
          </ul>
        </div>
        <div style="border-top: 1px solid rgba(216,201,168,0.3); padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11.5px; color: var(--text-dim);">ID: <code>${p.id}</code></span>
          <span style="font-size: 12px; font-weight: 700; color: var(--ch-olive);"><i class="fa-solid fa-circle-check"></i> Aktif di Portal</span>
        </div>
      </div>
    `;
  }).join('');
}

// ===================================================================
// 5. GATEWAY & BANK ACCOUNTS
// ===================================================================
function renderSaGatewayGrid() {
  const container = document.getElementById('sa-gateway-grid');
  if (!container) return;

  const payments = getPaymentMethods();

  container.innerHTML = payments.map(pm => {
    return `
      <div class="gw-card">
        <div class="gw-head">
          <div class="gw-icon"><i class="${pm.icon}"></i></div>
          <div>
            <h4>${pm.name}</h4>
            <span style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">${pm.type} Gateway</span>
          </div>
        </div>
        <div style="background: var(--bg-elevated); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--ch-sand-border); margin-bottom: 12px;">
          <div style="font-size: 11.5px; color: var(--text-dim);">Nomor Rekening / QRIS:</div>
          <strong style="font-family: monospace; font-size: 15px; color: var(--text-main);">${pm.accountNumber}</strong>
          <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">A/N: <strong>${pm.accountHolder}</strong></div>
        </div>
        <p style="font-size: 12px; color: var(--text-muted);">${pm.instructions}</p>
      </div>
    `;
  }).join('');
}

// ===================================================================
// HELPERS
// ===================================================================
function formatSaRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function formatSaDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

function closeSaModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function closeModalOnOverlay(e, modalId) {
  if (e.target.id === modalId) {
    closeSaModal(modalId);
  }
}

function showSaToast(msg, title = 'Sukses') {
  const toast = document.getElementById('sa-toast');
  const titleElem = document.getElementById('sa-toast-title');
  const msgElem = document.getElementById('sa-toast-msg');

  if (toast && msgElem) {
    msgElem.textContent = msg;
    if (titleElem) titleElem.textContent = title;

    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');

    if (window.saToastTimeout) clearTimeout(window.saToastTimeout);
    window.saToastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}

// ===================================================================
// SUPABASE MODAL HANDLERS
// ===================================================================
function openSupabaseModal() {
  const modal = document.getElementById('sa-supabase-modal');
  if (!modal) return;

  if (typeof supabaseConfig !== 'undefined') {
    document.getElementById('sb-form-url').value = supabaseConfig.url || '';
    document.getElementById('sb-form-key').value = supabaseConfig.key || '';
  }
  modal.classList.add('active');
}

async function testSupabaseFromForm() {
  const url = document.getElementById('sb-form-url').value.trim();
  const key = document.getElementById('sb-form-key').value.trim();

  if (!url || !key) {
    alert('Harap masukkan Supabase URL dan Anon Key terlebih dahulu.');
    return;
  }

  showSaToast('Menguji koneksi ke Supabase...', 'Info');
  const res = await testSupabaseConnection(url, key);
  if (res.success) {
    alert('🎉 ' + res.message);
  } else {
    alert('❌ ' + res.message);
  }
}

async function saveSupabaseSettingsFromForm(e) {
  e.preventDefault();
  const url = document.getElementById('sb-form-url').value.trim();
  const key = document.getElementById('sb-form-key').value.trim();

  saveSupabaseConfig(url, key, true);
  closeSaModal('sa-supabase-modal');

  showSaToast('Menghubungkan & menyinkronkan data dengan Supabase Cloud...');

  if (typeof pullAllDataFromSupabase === 'function') {
    await seedDefaultDataToSupabase();
    await pullAllDataFromSupabase();
  }

  renderSaOverview();
  renderSaTenantsTable();
  renderSaInvoicesTable();
  showSaToast('Database Supabase berhasil terhubung & tersinkronisasi!');
}


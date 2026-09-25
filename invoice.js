/**
 * AMANDA BROWNIES KALIMANTAN - MINIMALIST INVOICE CONTROLLER
 * Handles streamlined invoice rendering, WhatsApp confirmation, and instant payment verification.
 */

let currentInvoice = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadInvoiceData();
});

/**
 * Format currency to Indonesian Rupiah
 */
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date string to Indonesian readable format
 */
function formatDateIndo(dateStr) {
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

/**
 * Load invoice from URL parameter or fallback to most recent invoice
 */
function loadInvoiceData() {
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');

  const history = getInvoiceHistory();

  if (invoiceId) {
    currentInvoice = getInvoiceById(invoiceId);
  }

  // If not found by query param, get the latest invoice in history
  if (!currentInvoice && history && history.length > 0) {
    currentInvoice = history[0];
  }

  // If still no invoice exists, create a default sample invoice
  if (!currentInvoice) {
    currentInvoice = {
      id: 'INV-202609-001',
      createdAt: '2026-09-01T10:00:00.000Z',
      dueDate: '2026-09-02T10:00:00.000Z',
      planId: 'plan-6m',
      planName: 'Paket Usaha (6 Bulan)',
      durationMonths: 6,
      subtotal: 499000,
      uniqueCode: 124,
      totalAmount: 499124,
      paymentMethodId: 'qris',
      paymentMethodName: 'QRIS Realtime (Semua Bank & E-Wallet)',
      tenantName: 'Amanda Brownies Kalimantan',
      tenantEmail: 'admin@amandaborneo.id',
      tenantPhone: '0812-3456-7890',
      tenantDomain: 'amandaborneo.id',
      status: 'PENDING'
    };
  }

  renderInvoice(currentInvoice);
}

/**
 * Render all invoice details into DOM
 */
function renderInvoice(inv) {
  if (!inv) return;

  // Header meta
  document.getElementById('inv-display-id').textContent = inv.id;
  document.title = `Invoice #${inv.id} | Amanda Platform`;

  // Status Tag & Stamp
  const statusPill = document.getElementById('inv-display-status');
  const statusText = document.getElementById('inv-status-text');
  const stampBadge = document.getElementById('inv-stamp-badge');
  const stampDateText = document.getElementById('stamp-date-text');
  const btnSimulatePay = document.getElementById('btn-simulate-pay');

  const isPaid = inv.status === 'PAID';

  statusPill.className = 'inv-status-tag ' + (isPaid ? 'status-paid' : 'status-pending');
  statusText.textContent = isPaid ? 'Lunas' : 'Menunggu Bayar';

  if (isPaid) {
    stampBadge.classList.add('visible');
    if (stampDateText) {
      stampDateText.textContent = inv.paidAt ? `(${formatDateIndo(inv.paidAt)})` : `(${formatDateIndo(inv.createdAt)})`;
    }
    if (btnSimulatePay) {
      btnSimulatePay.innerHTML = '<i class="fa-solid fa-check-double"></i> <span>Sudah Lunas</span>';
      btnSimulatePay.classList.add('btn-disabled');
      btnSimulatePay.disabled = true;
    }
  } else {
    stampBadge.classList.remove('visible');
    if (btnSimulatePay) {
      btnSimulatePay.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Verifikasi Lunas</span>';
      btnSimulatePay.classList.remove('btn-disabled');
      btnSimulatePay.disabled = false;
    }
  }

  // Meta Grid Info
  document.getElementById('inv-client-name').textContent = inv.tenantName || 'Mitra Amanda';
  document.getElementById('inv-client-phone').textContent = inv.tenantPhone || '-';
  document.getElementById('inv-client-domain').textContent = inv.tenantDomain || 'amandaborneo.id';
  document.getElementById('inv-client-email').textContent = inv.tenantEmail || '-';

  // Dates & Payment Method
  document.getElementById('inv-date-issued').textContent = formatDateIndo(inv.createdAt);
  document.getElementById('inv-date-due').textContent = formatDateIndo(inv.dueDate);
  document.getElementById('inv-payment-method').textContent = (inv.paymentMethodName || 'Transfer').split('(')[0].trim();

  // Item Breakdown
  document.getElementById('inv-item-plan-name').textContent = `Sewa Sistem Website & CMS (${inv.planName || 'Paket Sewa'})`;
  document.getElementById('inv-item-duration').textContent = `+${inv.durationMonths || 1} Bulan`;
  document.getElementById('inv-item-subtotal').textContent = formatRupiah(inv.subtotal || 0);
  document.getElementById('inv-item-unique-code').textContent = `+Rp ${inv.uniqueCode || 0}`;

  // Grand Total
  document.getElementById('inv-sum-grand-total').textContent = formatRupiah(inv.totalAmount || (inv.subtotal + (inv.uniqueCode || 0)));

  // Render Payment Instructions
  renderPaymentInstructions(inv);
}

/**
 * Render dynamic payment instructions depending on method and status
 */
function renderPaymentInstructions(inv) {
  const container = document.getElementById('inv-pay-instructions-content');
  if (!container) return;

  if (inv.status === 'PAID') {
    container.innerHTML = `
      <div class="min-paid-banner">
        <i class="fa-solid fa-circle-check"></i>
        <div>
          <strong>Pembayaran Telah Diverifikasi Lunas</strong>
          <p>Masa aktif sewa sistem telah diperpanjang otomatis di sistem CMS. Terima kasih!</p>
        </div>
      </div>
    `;
    return;
  }

  const methodId = inv.paymentMethodId || 'qris';
  let methodHtml = '';

  if (methodId === 'qris') {
    methodHtml = `
      <div class="min-qris-wrap">
        <div class="min-qris-box">
          <svg viewBox="0 0 100 100" width="105" height="105" fill="#231B14">
            <!-- Corner Finder Patterns -->
            <rect x="5" y="5" width="28" height="28" fill="#231B14" rx="3"/>
            <rect x="9" y="9" width="20" height="20" fill="#FFFFFF" rx="2"/>
            <rect x="13" y="13" width="12" height="12" fill="#4F5B2A" rx="1"/>
            
            <rect x="67" y="5" width="28" height="28" fill="#231B14" rx="3"/>
            <rect x="71" y="9" width="20" height="20" fill="#FFFFFF" rx="2"/>
            <rect x="75" y="13" width="12" height="12" fill="#4F5B2A" rx="1"/>
            
            <rect x="5" y="67" width="28" height="28" fill="#231B14" rx="3"/>
            <rect x="9" y="71" width="20" height="20" fill="#FFFFFF" rx="2"/>
            <rect x="13" y="75" width="12" height="12" fill="#4F5B2A" rx="1"/>

            <!-- Simulated QR Elements -->
            <rect x="38" y="8" width="6" height="6" fill="#231B14"/>
            <rect x="48" y="8" width="6" height="6" fill="#231B14"/>
            <rect x="38" y="18" width="6" height="6" fill="#231B14"/>
            <rect x="56" y="18" width="6" height="6" fill="#231B14"/>
            
            <rect x="38" y="38" width="24" height="24" fill="#B8892D" rx="4"/>
            <path d="M 45 50 L 48 54 L 55 45" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>

            <rect x="8" y="38" width="6" height="6" fill="#231B14"/>
            <rect x="18" y="48" width="6" height="6" fill="#231B14"/>
            <rect x="68" y="38" width="6" height="6" fill="#231B14"/>
            <rect x="78" y="48" width="6" height="6" fill="#231B14"/>
            <rect x="88" y="38" width="6" height="6" fill="#231B14"/>

            <rect x="38" y="68" width="6" height="6" fill="#231B14"/>
            <rect x="48" y="78" width="6" height="6" fill="#231B14"/>
            <rect x="58" y="68" width="6" height="6" fill="#231B14"/>
            <rect x="68" y="78" width="6" height="6" fill="#231B14"/>
            <rect x="78" y="68" width="6" height="6" fill="#231B14"/>
            <rect x="88" y="88" width="6" height="6" fill="#231B14"/>
          </svg>
          <span class="qris-tag">NMID: ID1024883920</span>
        </div>
        <div class="min-qris-steps">
          <ol>
            <li>Buka aplikasi m-Banking atau E-Wallet (BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, Dana).</li>
            <li>Scan QRIS di samping dan pastikan nominal tepat <strong>${formatRupiah(inv.totalAmount)}</strong>.</li>
            <li>Setelah transfer sukses, klik tombol <strong>Verifikasi Lunas</strong> di atas.</li>
          </ol>
        </div>
      </div>
    `;
  } else if (methodId.startsWith('bank-')) {
    let bankName = 'BCA';
    let accNum = '8830-1928-401';
    let accName = 'PT AMANDA BROWNIES PLATFORM';

    if (methodId === 'bank-mandiri') {
      bankName = 'Mandiri';
      accNum = '137-00-9988210-4';
    } else if (methodId === 'bank-bri') {
      bankName = 'BRI';
      accNum = '0021-01-003921-53-8';
    }

    methodHtml = `
      <div class="min-bank-card">
        <div class="bank-meta">
          <span class="bank-badge">${bankName}</span>
          <div>
            <span class="bank-acc-num">${accNum}</span>
            <span class="bank-acc-holder">a.n ${accName}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-copy" onclick="copyText('${accNum}', 'Nomor rekening')">
            <i class="fa-regular fa-copy"></i> Salin Rekening
          </button>
          <button class="btn-copy" onclick="copyText('${inv.totalAmount}', 'Nominal transfer')">
            <i class="fa-solid fa-coins"></i> Salin Nominal (${formatRupiah(inv.totalAmount)})
          </button>
        </div>
      </div>
    `;
  } else {
    methodHtml = `
      <div class="min-bank-card">
        <div class="bank-meta">
          <span class="bank-badge">E-WALLET</span>
          <div>
            <span class="bank-acc-num">0812-8899-2311</span>
            <span class="bank-acc-holder">a.n AMANDA PLATFORM OFFICIAL</span>
          </div>
        </div>
        <button class="btn-copy" onclick="copyText('081288992311', 'Nomor e-wallet')">
          <i class="fa-regular fa-copy"></i> Salin Nomor
        </button>
      </div>
    `;
  }

  container.innerHTML = methodHtml;
}

/**
 * Copy text helper
 */
function copyText(val, label) {
  navigator.clipboard.writeText(val).then(() => {
    alert(`${label} berhasil disalin: ${val}`);
  }).catch(() => {
    alert(`${label}: ${val}`);
  });
}

/**
 * Send WhatsApp payment confirmation
 */
function sendWhatsAppConfirmation() {
  if (!currentInvoice) return;

  const adminPhone = '6281234567890'; // WhatsApp Helpdesk
  const message = `Halo Admin Amanda Platform,%0A%0ASaya ingin konfirmasi pembayaran sewa website:%0A• *No Invoice:* ${currentInvoice.id}%0A• *Mitra:* ${currentInvoice.tenantName}%0A• *Paket:* ${currentInvoice.planName}%0A• *Total:* ${formatRupiah(currentInvoice.totalAmount)}%0A• *Metode:* ${currentInvoice.paymentMethodName}%0A%0AMohon bantuan aktivasi/verifikasi. Terima kasih!`;

  const waUrl = `https://wa.me/${adminPhone}?text=${message}`;
  window.open(waUrl, '_blank');
}

/**
 * Simulate Payment Success (Mark invoice as PAID & extend active subscription)
 */
function simulatePaymentSuccess() {
  if (!currentInvoice) return;

  if (currentInvoice.status === 'PAID') {
    alert('Invoice ini sudah berstatus LUNAS.');
    return;
  }

  const confirmPay = confirm(`Konfirmasi verifikasi pembayaran LUNAS untuk Invoice #${currentInvoice.id} sebesar ${formatRupiah(currentInvoice.totalAmount)}?`);
  if (!confirmPay) return;

  // 1. Update Invoice in storage
  const nowIso = new Date().toISOString();
  currentInvoice.status = 'PAID';
  currentInvoice.paidAt = nowIso;

  const history = getInvoiceHistory();
  const index = history.findIndex(i => i.id === currentInvoice.id);
  if (index !== -1) {
    history[index] = currentInvoice;
  } else {
    history.unshift(currentInvoice);
  }
  saveInvoiceHistory(history);

  // 2. Extend/Update Active Subscription
  const currentSub = getRentalSubscription();
  const durationMonths = currentInvoice.durationMonths || 1;

  let baseDate = new Date();
  if (currentSub && currentSub.status === 'ACTIVE' && currentSub.expiresAt) {
    const existingExpiry = new Date(currentSub.expiresAt);
    if (existingExpiry > baseDate) {
      baseDate = existingExpiry;
    }
  }

  const newExpiry = new Date(baseDate);
  newExpiry.setMonth(newExpiry.getMonth() + durationMonths);

  const updatedSub = {
    ...currentSub,
    status: 'ACTIVE',
    planId: currentInvoice.planId,
    planName: currentInvoice.planName,
    tenantName: currentInvoice.tenantName || currentSub.tenantName,
    tenantEmail: currentInvoice.tenantEmail || currentSub.tenantEmail,
    tenantPhone: currentInvoice.tenantPhone || currentSub.tenantPhone,
    tenantDomain: currentInvoice.tenantDomain || currentSub.tenantDomain,
    lastPaymentDate: nowIso,
    lastInvoiceId: currentInvoice.id,
    expiresAt: newExpiry.toISOString()
  };

  saveRentalSubscription(updatedSub);

  // 3. Re-render UI
  renderInvoice(currentInvoice);

  // 4. Feedback
  alert(`🎉 PEMBAYARAN LUNAS!\n\nMasa aktif sewa sistem Anda diperpanjang hingga: ${formatDateIndo(newExpiry.toISOString())}.`);
}

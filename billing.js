// ===================================================================
// AMANDA WAAS - BILLING & SUBSCRIPTION CHECKOUT CONTROLLER
// ===================================================================

let currentBillingCycle = 'monthly'; // 'monthly' | 'yearly'
let currentSelectedPlan = DEFAULT_RENTAL_PLANS.find(p => p.id === 'plan-6m') || DEFAULT_RENTAL_PLANS[0];
let currentSelectedPayment = DEFAULT_PAYMENT_METHODS.find(p => p.id === 'qris') || DEFAULT_PAYMENT_METHODS[0];
const currentUniqueCode = Math.floor(100 + Math.random() * 899);

document.addEventListener('DOMContentLoaded', () => {
  renderSubscriptionStatusBanner();
  renderRentalPlans();
  renderPaymentMethods();
  renderPaymentDetailsBox();
  populateDefaultTenantForm();
  updateSummaryCard();
});

// Switch between Bulanan and Tahunan tabs
function switchBillingCycle(cycle) {
  currentBillingCycle = cycle;

  // Update switch tab UI
  const tabMonthly = document.getElementById('tab-cycle-monthly');
  const tabYearly = document.getElementById('tab-cycle-yearly');

  if (tabMonthly && tabYearly) {
    if (cycle === 'monthly') {
      tabMonthly.classList.add('active');
      tabYearly.classList.remove('active');
    } else {
      tabMonthly.classList.remove('active');
      tabYearly.classList.add('active');
    }
  }

  // Pick first plan of selected cycle if current selected is in another cycle
  const availablePlans = DEFAULT_RENTAL_PLANS.filter(p => p.cycle === cycle);
  if (availablePlans.length > 0 && (!currentSelectedPlan || currentSelectedPlan.cycle !== cycle)) {
    // Pick recommended/popular in that cycle or the first one
    const popular = availablePlans.find(p => p.badge && p.badge.includes('Populer')) || availablePlans[0];
    currentSelectedPlan = popular;
  }

  renderRentalPlans();
  updateSummaryCard();
}

// 1. Render Current Subscription Status Banner
function renderSubscriptionStatusBanner() {
  const banner = document.getElementById('current-status-banner');
  if (!banner) return;

  const sub = getRentalSubscription();
  const daysLeft = calculateRemainingDays(sub.expiresAt || sub.expiryDate);
  const isActive = sub.status === 'ACTIVE' || (sub.status === 'active' && daysLeft > 0);

  banner.innerHTML = `
    <div class="status-left">
      <span class="status-pill-badge ${isActive ? 'active' : 'expired'}">
        <i class="fa-solid ${isActive ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
        ${isActive ? 'Status Sewa: Aktif' : 'Status Sewa: Perlu Perpanjangan'}
      </span>
      <div style="font-size: 13px;">
        <strong>${sub.tenantName}</strong> • Paket: <em>${sub.planName}</em> (Berlaku s/d <strong>${formatDateIndo(sub.expiresAt || sub.expiryDate)}</strong>)
      </div>
    </div>
    <div>
      <span style="font-size: 12.5px; font-weight: 700; color: ${isActive ? 'var(--ch-olive)' : 'var(--accent-red)'};">
        ${isActive ? `<i class="fa-regular fa-clock"></i> Sisa Masa Aktif: ${daysLeft} Hari Lagi` : 'Masa aktif telah berakhir'}
      </span>
    </div>
  `;
}

// 2. Render Plans Grid
function renderRentalPlans() {
  const container = document.getElementById('plans-selection-grid');
  if (!container) return;

  const filteredPlans = DEFAULT_RENTAL_PLANS.filter(p => p.cycle === currentBillingCycle);

  container.innerHTML = filteredPlans.map(plan => {
    const isSelected = plan.id === currentSelectedPlan.id;
    return `
      <div class="plan-option-card ${isSelected ? 'selected' : ''}" onclick="selectRentalPlan('${plan.id}')">
        ${plan.badge ? `<span class="plan-badge-top">${plan.badge}</span>` : ''}
        <div class="plan-card-head">
          <h4>${plan.name}</h4>
          <div class="plan-price-wrap">
            <div class="plan-price-main">
              Rp ${plan.price.toLocaleString('id-ID')}
              <small>/ ${plan.durationMonths >= 12 ? (plan.durationMonths / 12) + ' thn' : plan.durationMonths + ' bln'}</small>
            </div>
            ${plan.perMonthEquivalent ? `<span class="plan-monthly-eq"><i class="fa-solid fa-tag"></i> Setara ${plan.perMonthEquivalent}</span>` : ''}
            ${plan.discountLabel ? `<span class="plan-discount-badge" style="margin-top: 4px; display: inline-block;">${plan.discountLabel}</span>` : ''}
          </div>
          <p style="font-size: 12px; color: var(--text-dim); margin-bottom: 10px;">${plan.description}</p>
        </div>

        <ul class="plan-features-list">
          ${plan.features.map(f => `
            <li><i class="fa-solid fa-check"></i> <span>${f}</span></li>
          `).join('')}
        </ul>
      </div>
    `;
  }).join('');
}

function selectRentalPlan(planId) {
  const found = DEFAULT_RENTAL_PLANS.find(p => p.id === planId);
  if (found) {
    currentSelectedPlan = found;
    if (found.cycle) currentBillingCycle = found.cycle;
    renderRentalPlans();
    updateSummaryCard();
  }
}

// 3. Render Payment Methods
function renderPaymentMethods() {
  const container = document.getElementById('payment-methods-list');
  if (!container) return;

  container.innerHTML = DEFAULT_PAYMENT_METHODS.map(pay => {
    const isSelected = pay.id === currentSelectedPayment.id;
    return `
      <div class="payment-method-item ${isSelected ? 'selected' : ''}" onclick="selectPaymentMethod('${pay.id}')">
        <div class="pay-radio-dot"></div>
        <div class="pay-info">
          <h5><i class="${pay.icon}" style="color: var(--ch-olive); margin-right: 4px;"></i> ${pay.name}</h5>
          <small>${pay.badge || pay.accountNumber}</small>
        </div>
      </div>
    `;
  }).join('');
}

function selectPaymentMethod(payId) {
  const found = DEFAULT_PAYMENT_METHODS.find(p => p.id === payId);
  if (found) {
    currentSelectedPayment = found;
    renderPaymentMethods();
    renderPaymentDetailsBox();
  }
}

function renderPaymentDetailsBox() {
  const box = document.getElementById('payment-details-box');
  if (!box) return;

  if (currentSelectedPayment.id === 'qris') {
    box.innerHTML = `
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021126570011ID.AMANDAPLATFORM.WWW01189360099881234567895204581253033605802ID5918AMANDA+BALIKPAPAN6011BALIKPAPAN6304C2D1" alt="QRIS Amanda" class="qris-code-img" />
      <div class="pay-instructions">
        <h5><i class="fa-solid fa-qrcode"></i> ${currentSelectedPayment.name}</h5>
        <div class="pay-account-badge">${currentSelectedPayment.accountNumber}</div>
        <p>${currentSelectedPayment.instructions}</p>
        <small style="color: var(--ch-olive); font-weight: 700; display: block; margin-top: 4px;">✓ Bebas biaya admin • Verifikasi instan</small>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div class="pay-instructions" style="width: 100%;">
        <h5><i class="${currentSelectedPayment.icon}"></i> ${currentSelectedPayment.name}</h5>
        <div class="pay-account-badge">${currentSelectedPayment.accountNumber}</div>
        <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">A/N: ${currentSelectedPayment.accountHolder}</div>
        <p>${currentSelectedPayment.instructions}</p>
      </div>
    `;
  }
}

// 4. Populate Default Form
function populateDefaultTenantForm() {
  const sub = getRentalSubscription();
  const nameInput = document.getElementById('tenant-name');
  const phoneInput = document.getElementById('tenant-phone');
  const emailInput = document.getElementById('tenant-email');
  const domainInput = document.getElementById('tenant-domain');

  if (nameInput) nameInput.value = sub.tenantName || 'Amanda Brownies Kota Balikpapan';
  if (phoneInput) phoneInput.value = sub.tenantPhone || '081322119988';
  if (emailInput) emailInput.value = sub.tenantEmail || 'admin.balikpapan@amandabrownies.id';
  if (domainInput) domainInput.value = sub.domain || 'balikpapan.amandabrownies.id';
}

// 5. Update Order Summary Card
function updateSummaryCard() {
  const planNameElem = document.getElementById('sum-plan-name');
  const planDurElem = document.getElementById('sum-plan-duration');
  const subtotalElem = document.getElementById('sum-plan-subtotal');
  const uniqueCodeElem = document.getElementById('sum-unique-code');
  const totalAmountElem = document.getElementById('sum-total-amount');

  const subtotal = currentSelectedPlan.price;
  const total = subtotal + currentUniqueCode;

  if (planNameElem) planNameElem.textContent = currentSelectedPlan.name;
  if (planDurElem) planDurElem.textContent = `+${currentSelectedPlan.durationMonths} Bulan (${currentSelectedPlan.durationMonths * 30} Hari)`;
  if (subtotalElem) subtotalElem.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
  if (uniqueCodeElem) uniqueCodeElem.textContent = `+Rp ${currentUniqueCode}`;
  if (totalAmountElem) totalAmountElem.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// 6. Process Order & Generate Invoice
function processBillingOrder() {
  const tenantName = document.getElementById('tenant-name').value.trim();
  const tenantPhone = document.getElementById('tenant-phone').value.trim();
  const tenantEmail = document.getElementById('tenant-email').value.trim();
  const tenantDomain = document.getElementById('tenant-domain').value.trim();
  const tenantNotes = document.getElementById('tenant-notes').value.trim();

  if (!tenantName || !tenantPhone || !tenantEmail) {
    alert('Mohon lengkapi Nama Bisnis, Nomor WhatsApp, dan Email Anda.');
    return;
  }

  // Generate unique invoice number
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const invoiceId = `INV-${yearMonth}-${randomSuffix}`;

  // Calculate Due Date (+3 days)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);

  const subtotal = currentSelectedPlan.price;
  const totalAmount = subtotal + currentUniqueCode;

  const newInvoice = {
    id: invoiceId,
    date: now.toISOString().slice(0, 10),
    dueDate: dueDate.toISOString().slice(0, 10),
    tenantName,
    tenantPhone,
    tenantEmail,
    tenantDomain: tenantDomain || 'amandabrownies.id',
    tenantNotes,
    planId: currentSelectedPlan.id,
    planName: currentSelectedPlan.name,
    durationMonths: currentSelectedPlan.durationMonths,
    subtotal: subtotal,
    uniqueCode: currentUniqueCode,
    totalAmount: totalAmount,
    paymentMethodId: currentSelectedPayment.id,
    paymentMethodName: currentSelectedPayment.name,
    accountNumber: currentSelectedPayment.accountNumber,
    accountHolder: currentSelectedPayment.accountHolder,
    status: 'PENDING', // PENDING -> PAID upon confirmation
    createdAt: now.toLocaleString('id-ID')
  };

  // Save to invoice history list in localStorage
  const history = getInvoiceHistory();
  history.unshift(newInvoice);
  saveInvoiceHistory(history);

  // Redirect to invoice page
  window.location.href = `invoice.html?id=${invoiceId}`;
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
}

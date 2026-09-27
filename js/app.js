// ===================================================================
// AMANDA BROWNIES - LANDING PAGE INTERACTION & DROPDOWN LOGIC
// ===================================================================

let currentCategory = 'all';
let searchQuery = '';
let selectedCityForOutlet = 'all';

function refreshAllLandingPageViews() {
  if (typeof reloadAmandaData === 'function') {
    reloadAmandaData();
  }
  renderPromoTicker();
  renderNavbarOutletDropdown();
  renderProductGrid();
  renderPromoFlyers();
  renderPriceListCards();
  renderOutletCategoryFilterPills();
  renderOutletLocatorList(selectedCityForOutlet || 'all');
}

document.addEventListener('DOMContentLoaded', () => {
  refreshAllLandingPageViews();
  setupEventListeners();
  initPromoFeatures();
  initFlyerZoomListeners();

  // Cross-Tab Live Synchronization with CMS
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith('amanda_')) {
      refreshAllLandingPageViews();
    }
  });

  // Same-Window / Custom Event Synchronization
  window.addEventListener('amanda_data_updated', () => {
    refreshAllLandingPageViews();
  });
});

// Render Navbar Outlet Dropdown List (With Sub-List of Booths)
function renderNavbarOutletDropdown() {
  const container = document.getElementById('nav-outlet-list');
  const drawerContainer = document.getElementById('drawer-outlet-list');
  if (typeof AMANDA_OUTLETS === 'undefined') return;

  const listHTML = AMANDA_OUTLETS.map(out => {
    const booths = out.booths || [];
    const subListHTML = booths.length > 0 ? `
      <ul class="dropdown-sub-booths">
        ${booths.map(b => `
          <li class="dropdown-sub-booth-item">
            <a href="#outlet" onclick="selectNavbarOutlet('${out.id}', '${out.city}')">
              <i class="fa-solid fa-circle-dot"></i> ${b.name}
            </a>
          </li>
        `).join('')}
      </ul>
    ` : '';

    return `
      <li class="dropdown-outlet-item">
        <a href="#outlet" class="dropdown-parent-link" onclick="selectNavbarOutlet('${out.id}', '${out.city}')">
          <i class="fa-solid fa-shop"></i> ${out.name}
        </a>
        ${subListHTML}
      </li>
    `;
  }).join('');

  if (container) {
    container.innerHTML = listHTML;
  }

  if (drawerContainer) {
    drawerContainer.innerHTML = AMANDA_OUTLETS.map(out => {
      const booths = out.booths || [];
      const subListHTML = booths.length > 0 ? `
        <ul class="drawer-sub-booths">
          ${booths.map(b => `
            <li class="drawer-sub-booth-item">
              <a href="#outlet" onclick="selectNavbarOutlet('${out.id}', '${out.city}'); closeMobileMenu();">
                <i class="fa-solid fa-circle-dot"></i> ${b.name}
              </a>
            </li>
          `).join('')}
        </ul>
      ` : '';

      return `
        <li class="drawer-outlet-subitem">
          <a href="#outlet" class="drawer-outlet-parent-link" onclick="selectNavbarOutlet('${out.id}', '${out.city}'); closeMobileMenu();">
            <i class="fa-solid fa-shop"></i> ${out.name}
          </a>
          ${subListHTML}
        </li>
      `;
    }).join('');
  }
}

function selectNavbarOutlet(outletId, city) {
  if (typeof filterLocatorCity === 'function') {
    const pill = document.querySelector(`.city-pill[onclick*="${city}"]`) || document.querySelector('.city-pill');
    if (pill) filterLocatorCity(city, pill);
  }
  const outletObj = AMANDA_OUTLETS.find(o => o.id === outletId);
  showToast(`Membuka info: ${outletObj ? outletObj.name : 'Outlet Balikpapan'}`);
}

// Mobile Menu Drawer Toggles
function toggleMobileMenu() {
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  if (!drawer || !backdrop) return;

  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  const drawer = document.getElementById('mobile-drawer');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleDrawerOutletDropdown() {
  const item = document.getElementById('drawer-outlet-item');
  if (item) {
    item.classList.toggle('open');
  }
}

// Render Dynamic Running Promo Ticker
function renderPromoTicker() {
  const track = document.querySelector('.promo-ticker-track');
  if (!track || typeof AMANDA_TICKER === 'undefined') return;

  const sequenceHTML = AMANDA_TICKER.map(item => `
    <span class="ticker-item">
      <i class="${item.icon || 'fa-solid fa-tag'}"></i>
      <strong>${item.title}</strong> ${item.text}
    </span>
    <span class="ticker-dot">•</span>
  `).join('');

  // Duplicate for seamless infinite loop
  track.innerHTML = sequenceHTML + sequenceHTML;
}

// Render Product Catalog (Only Image, Name, and Description)
function renderProductGrid() {
  const gridContainer = document.getElementById('products-grid');
  if (!gridContainer) return;

  const filtered = AMANDA_PRODUCTS.filter(prod => {
    const matchesCat = (currentCategory === 'all') || (prod.category === currentCategory);
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.categoryLabel && prod.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: rgba(39, 22, 16, 0.4); border-radius: 16px; border: 1px dashed var(--border-subtle);">
        <i class="fa-solid fa-cake-candles" style="font-size: 40px; color: var(--primary-gold); margin-bottom: 12px; display: block;"></i>
        <h3 style="font-size: 20px; margin-bottom: 8px;">Produk Tidak Ditemukan</h3>
        <p style="color: var(--text-muted); font-size: 14px;">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
      </div>
    `;
    return;
  }

  gridContainer.innerHTML = filtered.map(product => {
    return `
      <div class="product-card" id="card-${product.id}" data-id="${product.id}">
        <!-- Media Header: Image with Name Overlay -->
        <div class="card-header-media">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <div class="card-media-overlay">
            <h3 class="card-media-title font-serif">${product.name}</h3>
          </div>
        </div>

        <!-- Body Content: Description Only -->
        <div class="card-body">
          <p class="card-desc">${product.description}</p>
        </div>
      </div>
    `;
  }).join('');
}



// Global Category Filter
function setCategory(category, buttonElement) {
  currentCategory = category;
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  if (buttonElement) {
    buttonElement.classList.add('active');
  }
  renderProductGrid();
}

// Setup Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProductGrid();
    });
  }
}

// Render Outlet Locator Section with Side-by-Side (Image Left, Simple List Right)
function renderOutletLocatorList(filterCity = 'all') {
  const container = document.getElementById('locator-outlets-list');
  if (!container) return;

  let filteredOutlets = AMANDA_OUTLETS;
  if (filterCity !== 'all') {
    filteredOutlets = AMANDA_OUTLETS.filter(o => o.city === filterCity);
  }

  container.innerHTML = filteredOutlets.map(out => {
    const boothsList = out.booths || [];

    const boothsHTML = boothsList.length > 0 ? `
      <div class="outlet-booths-simple">
        <div class="booths-simple-title">
          <i class="fa-solid fa-store" style="color: var(--primary-gold);"></i> 
          <span>Booth Counter (${boothsList.length} Titik):</span>
        </div>
        <ul class="booths-simple-list">
          ${boothsList.map(bth => {
      const mapsQuery = encodeURIComponent(`${bth.name} ${out.city} Balikpapan`);
      const mapsUrl = bth.mapsUrl || `https://maps.google.com/?q=${mapsQuery}`;
      const waMsg = encodeURIComponent(`Halo ${bth.name}, saya ingin memesan brownies Amanda. Mohon info ketersediaan stok.`);
      return `
              <li class="booth-simple-item">
                <div class="booth-simple-text">
                  <span class="booth-simple-name"><i class="fa-solid fa-circle-dot" style="font-size: 7px; color: var(--primary-gold); margin-right: 4px;"></i>${bth.name}</span>
                  <span class="booth-simple-time"><i class="fa-regular fa-clock" style="font-size: 10px; margin-right: 3px;"></i>${bth.hours}</span>
                </div>
                <div class="booth-item-actions">
                  <a href="https://wa.me/${bth.wa || out.wa}?text=${waMsg}" target="_blank" class="btn-booth-simple-wa" title="WhatsApp ${bth.name}">
                    <i class="fa-brands fa-whatsapp"></i> Chat
                  </a>
                  <a href="${mapsUrl}" target="_blank" class="btn-booth-simple-maps" title="Petunjuk Arah Google Maps ${bth.name}">
                    <i class="fa-solid fa-map-location-dot"></i>
                  </a>
                </div>
              </li>
            `;
    }).join('')}
        </ul>
      </div>
    ` : '';

    return `
      <div class="outlet-network-card">
        <!-- Left Side: Image -->
        <div class="outlet-network-media">
          <img src="${out.image}" alt="${out.name}" loading="lazy" class="outlet-store-img" />
          <span class="outlet-area-pill"><i class="fa-solid fa-map-pin"></i> ${out.city}</span>
          <div class="outlet-live-badge">
            <span class="live-dot"></span> Buka • ${out.hours}
          </div>
        </div>

        <!-- Right Side: Simple List & Information -->
        <div class="outlet-network-body">
          <div class="outlet-info-top">
            <h3 class="outlet-network-title font-serif">${out.name}</h3>

            <div class="outlet-meta-row">
              <span class="outlet-meta-item"><i class="fa-regular fa-clock"></i> ${out.hours}</span>
              <span class="outlet-meta-dot">•</span>
              <span class="outlet-meta-item"><i class="fa-solid fa-phone"></i> ${out.phone || '-'}</span>
            </div>
          </div>

          <!-- Booths Simple List -->
          ${boothsHTML}

          <!-- Actions -->
          <div class="outlet-network-actions">
            <a href="https://wa.me/${out.wa}?text=${encodeURIComponent('Halo ' + out.name + ', saya ingin pesan brownies Amanda. Mohon info varian yang ready saat ini.')}" target="_blank" class="btn-network-wa">
              <i class="fa-brands fa-whatsapp"></i> Hubungi Outlet
            </a>
            <a href="${out.mapsUrl}" target="_blank" class="btn-network-maps" title="Buka Rute Google Maps">
              <i class="fa-solid fa-diamond-turn-right"></i> Rute Maps
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderOutletCategoryFilterPills() {
  const pillList = document.querySelector('.city-pill-list');
  if (!pillList || typeof AMANDA_OUTLETS === 'undefined') return;

  const totalOutlets = AMANDA_OUTLETS.length;
  const categories = (typeof AMANDA_OUTLET_CATEGORIES !== 'undefined' && AMANDA_OUTLET_CATEGORIES.length > 0)
    ? AMANDA_OUTLET_CATEGORIES.filter(c => c.status !== 'inactive')
    : [
      { name: "Balikpapan Selatan", icon: "fa-solid fa-map-pin" },
      { name: "Balikpapan Kota", icon: "fa-solid fa-map-pin" },
      { name: "Balikpapan Utara", icon: "fa-solid fa-map-pin" }
    ];

  let pillsHTML = `
    <button class="city-pill ${selectedCityForOutlet === 'all' ? 'active' : ''}" onclick="filterLocatorCity('all', this)">
      <i class="fa-solid fa-city"></i> Semua Cabang (${totalOutlets})
    </button>
  `;

  pillsHTML += categories.map(cat => {
    const count = AMANDA_OUTLETS.filter(o => o.city === cat.name).length;
    const isActive = selectedCityForOutlet === cat.name;
    return `
      <button class="city-pill ${isActive ? 'active' : ''}" onclick="filterLocatorCity('${cat.name}', this)">
        <i class="${cat.icon || 'fa-solid fa-map-pin'}"></i> ${cat.name} (${count})
      </button>
    `;
  }).join('');

  pillList.innerHTML = pillsHTML;
}

function filterLocatorCity(city, btn) {
  selectedCityForOutlet = city;
  document.querySelectorAll('.city-pill').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderOutletLocatorList(city);
}

// Direct Order helper
function selectOutletForOrder(outletName, productName) {
  const msg = `Pesanan untuk ${productName} di ${outletName} telah disiapkan. Menghubungi outlet...`;
  showToast(msg);
  setTimeout(() => {
    const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(`Halo ${outletName}, saya ingin order *${productName}*. Mohon konfirmasi ketersediaan.`)}`;
    window.open(waUrl, '_blank');
  }, 1000);
}

// Toast Notification System
function showToast(message, icon = 'fa-solid fa-circle-check', headline = 'Info Amanda Balikpapan') {
  const toast = document.getElementById('promo-toast');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');
  const toastHeadline = document.querySelector('.toast-headline');

  if (toast && toastMsg) {
    toastMsg.textContent = message;
    if (toastHeadline) toastHeadline.textContent = headline;
    if (toastIcon) toastIcon.className = icon;

    toast.classList.remove('show');
    void toast.offsetWidth; // Force CSS reflow for smooth re-trigger animation
    toast.classList.add('show');

    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
      hideToast();
    }, 3500);
  }
}

function hideToast() {
  const toast = document.getElementById('promo-toast');
  if (toast) {
    toast.classList.remove('show');
  }
}

// ===================================================================
// HERO RUNNING PROMO CAROUSEL & COUNTDOWN LOGIC
// ===================================================================
let currentPromoIndex = 0;
let promoAutoSlideTimer = null;
const totalPromoSlides = 3;

function initPromoFeatures() {
  startPromoCountdown();
  const slides = document.querySelectorAll('.promo-slide');
  if (slides.length > 0) {
    startPromoAutoSlide();
  }

  const carouselBox = document.getElementById('hero-promo-carousel');
  if (carouselBox) {
    carouselBox.addEventListener('mouseenter', pausePromoAutoSlide);
    carouselBox.addEventListener('mouseleave', startPromoAutoSlide);
  }
}

function goToPromoSlide(index) {
  currentPromoIndex = (index + totalPromoSlides) % totalPromoSlides;

  const slides = document.querySelectorAll('.promo-slide');
  const dots = document.querySelectorAll('.promo-dot');

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === currentPromoIndex);
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentPromoIndex);
  });
}

function nextPromoSlide() {
  goToPromoSlide(currentPromoIndex + 1);
}

function prevPromoSlide() {
  goToPromoSlide(currentPromoIndex - 1);
}

function startPromoAutoSlide() {
  if (promoAutoSlideTimer) clearInterval(promoAutoSlideTimer);
  promoAutoSlideTimer = setInterval(() => {
    nextPromoSlide();
  }, 4500);
}

function pausePromoAutoSlide() {
  if (promoAutoSlideTimer) clearInterval(promoAutoSlideTimer);
}

// Flash Sale Countdown Timer (Calculates time until 23:59:59 today)
function startPromoCountdown() {
  const timerElement = document.getElementById('countdown-timer');
  if (!timerElement) return;

  function updateTimer() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const diff = endOfDay - now;
    if (diff <= 0) {
      timerElement.textContent = "00:00:00";
      return;
    }

    const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
    const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

    timerElement.textContent = `${hours}:${minutes}:${seconds}`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Copy Voucher Code to Clipboard
function copyPromoCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showToast(`Kode promo "${code}" berhasil disalin ke clipboard!`, 'fa-solid fa-ticket', 'Voucher Tersalin');
  }).catch(() => {
    // Fallback if clipboard API is restricted
    const tempInput = document.createElement('input');
    tempInput.value = code;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(`Kode promo "${code}" berhasil disalin ke clipboard!`, 'fa-solid fa-ticket', 'Voucher Tersalin');
  });
}

// ===================================================================
// ===================================================================
// PROMO FLYER 3D COVERFLOW SHOWCASE (DESKTOP & MOBILE)
// ===================================================================
let currentPromoSlide = 0;
let promoSlideAutoTimer = null;
let isPromoSlideHovered = false;

function renderPromoFlyers() {
  const stage = document.getElementById('promo-coverflow-stage');
  if (!stage || typeof AMANDA_PROMOS === 'undefined' || AMANDA_PROMOS.length === 0) return;

  if (currentPromoSlide >= AMANDA_PROMOS.length) {
    currentPromoSlide = 0;
  }

  stage.innerHTML = AMANDA_PROMOS.map((promo, idx) => {
    return `
      <div class="promo-coverflow-card ${idx === currentPromoSlide ? 'is-active' : ''}" 
           id="promo-card-${idx}" 
           data-index="${idx}" 
           onclick="handlePromoCardClick('${promo.id}', ${idx})" 
           title="${idx === currentPromoSlide ? 'Klik untuk memperbesar gambar' : 'Klik untuk melihat promo ini'}">
        <div class="promo-coverflow-media">
          <img src="${promo.image}" alt="${promo.title || 'Promo Amanda'}" class="promo-coverflow-img" loading="lazy" />
        </div>
      </div>
    `;
  }).join('');

  renderPromoPagination();
  updatePromoCoverflow();
  initPromoSlideEvents();
  startPromoSlideAutoPlay();
}

function handlePromoCardClick(promoId, index) {
  const isDesktop = window.innerWidth >= 768;
  const total = (typeof AMANDA_PROMOS !== 'undefined' && AMANDA_PROMOS.length > 0) ? AMANDA_PROMOS.length : 1;

  if (isDesktop) {
    const isPrimaryPair = (index === currentPromoSlide || (total >= 2 && index === (currentPromoSlide + 1) % total));
    if (isPrimaryPair) {
      openFlyerModal(promoId);
    } else {
      currentPromoSlide = index;
      updatePromoCoverflow();
    }
  } else {
    if (currentPromoSlide === index) {
      openFlyerModal(promoId);
    } else {
      currentPromoSlide = index;
      updatePromoCoverflow();
    }
  }
}

function updatePromoCoverflow() {
  const cards = document.querySelectorAll('.promo-coverflow-card');
  const dots = document.querySelectorAll('.promo-slide-dot');
  if (!cards || cards.length === 0) return;

  const total = cards.length;
  const isMobile = window.innerWidth <= 767;

  cards.forEach((card, idx) => {
    let offset = idx - currentPromoSlide;

    // Handle wrapping for natural circular coverflow
    if (total > 2) {
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;
    }

    if (!isMobile) {
      // ==========================================
      // DESKTOP: 2 GAMBAR UTAMA BERDAMPINGAN (3D)
      // ==========================================
      const isPrimary1 = (offset === 0);
      const isPrimary2 = (offset === 1 || (total === 2 && (offset === 1 || offset === -1)));
      const isPrimary = isPrimary1 || isPrimary2;
      card.classList.toggle('is-active', isPrimary);

      if (isPrimary1) {
        // Main Left Image (Primary 1)
        card.style.transform = `translateX(-205px) translateZ(12px) rotateY(-3deg) scale(1)`;
        card.style.opacity = '1';
        card.style.zIndex = '10';
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
        card.setAttribute('title', 'Klik untuk memperbesar gambar');
      } else if (isPrimary2) {
        // Main Right Image (Primary 2)
        card.style.transform = `translateX(205px) translateZ(12px) rotateY(3deg) scale(1)`;
        card.style.opacity = '1';
        card.style.zIndex = '10';
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
        card.setAttribute('title', 'Klik untuk memperbesar gambar');
      } else if (offset === -1) {
        // Left Flanking 3D Background Card
        card.style.transform = `translateX(-450px) translateZ(-130px) rotateY(35deg) scale(0.82)`;
        card.style.opacity = '0.55';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.88)';
        card.style.pointerEvents = 'auto';
        card.setAttribute('title', 'Klik untuk melihat promo ini');
      } else if (offset === 2) {
        // Right Flanking 3D Background Card
        card.style.transform = `translateX(450px) translateZ(-130px) rotateY(-35deg) scale(0.82)`;
        card.style.opacity = '0.55';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.88)';
        card.style.pointerEvents = 'auto';
        card.setAttribute('title', 'Klik untuk melihat promo ini');
      } else {
        // Distant Background Cards
        const tx = offset < 0 ? -600 : 600;
        const rot = offset < 0 ? 45 : -45;
        card.style.transform = `translateX(${tx}px) translateZ(-240px) rotateY(${rot}deg) scale(0.7)`;
        card.style.opacity = '0';
        card.style.zIndex = '1';
        card.style.filter = 'brightness(0.7)';
        card.style.pointerEvents = 'none';
        card.setAttribute('title', 'Klik untuk melihat promo ini');
      }
    } else {
      // ==========================================
      // MOBILE (HP): 1 GAMBAR UTAMA TENGAH (3D)
      // ==========================================
      const isPrimary = (offset === 0);
      card.classList.toggle('is-active', isPrimary);

      if (offset === 0) {
        // Center Active Card
        card.style.transform = `translateX(0px) translateZ(0px) rotateY(0deg) scale(1)`;
        card.style.opacity = '1';
        card.style.zIndex = '10';
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
        card.setAttribute('title', 'Klik untuk memperbesar gambar');
      } else if (offset === -1) {
        // Left Flanking 3D
        card.style.transform = `translateX(-155px) translateZ(-95px) rotateY(32deg) scale(0.82)`;
        card.style.opacity = '0.55';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.9)';
        card.style.pointerEvents = 'auto';
        card.setAttribute('title', 'Klik untuk melihat promo ini');
      } else if (offset === 1) {
        // Right Flanking 3D
        card.style.transform = `translateX(155px) translateZ(-95px) rotateY(-32deg) scale(0.82)`;
        card.style.opacity = '0.55';
        card.style.zIndex = '5';
        card.style.filter = 'brightness(0.9)';
        card.style.pointerEvents = 'auto';
        card.setAttribute('title', 'Klik untuk melihat promo ini');
      } else {
        // Distant / Hidden
        const tx = offset < 0 ? -260 : 260;
        const rot = offset < 0 ? 42 : -42;
        card.style.transform = `translateX(${tx}px) translateZ(-180px) rotateY(${rot}deg) scale(0.7)`;
        card.style.opacity = '0';
        card.style.zIndex = '1';
        card.style.filter = 'brightness(0.75)';
        card.style.pointerEvents = 'none';
        card.setAttribute('title', 'Klik untuk melihat promo ini');
      }
    }
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentPromoSlide);
  });
}

function renderPromoPagination() {
  const pagination = document.getElementById('promo-slider-pagination');
  if (!pagination || typeof AMANDA_PROMOS === 'undefined') return;

  const total = AMANDA_PROMOS.length;
  if (total <= 1) {
    pagination.innerHTML = '';
    return;
  }

  pagination.innerHTML = AMANDA_PROMOS.map((_, idx) => `
    <button class="promo-slide-dot ${idx === currentPromoSlide ? 'active' : ''}" onclick="goToPromoSlideIndex(${idx})" aria-label="Lihat Promo ${idx + 1}"></button>
  `).join('');
}

function goToPromoSlideIndex(index) {
  if (typeof AMANDA_PROMOS === 'undefined' || AMANDA_PROMOS.length === 0) return;
  currentPromoSlide = (index + AMANDA_PROMOS.length) % AMANDA_PROMOS.length;
  updatePromoCoverflow();
}

function nextPromoSlideItem() {
  if (typeof AMANDA_PROMOS === 'undefined' || AMANDA_PROMOS.length === 0) return;
  currentPromoSlide = (currentPromoSlide + 1) % AMANDA_PROMOS.length;
  updatePromoCoverflow();
}

function prevPromoSlideItem() {
  if (typeof AMANDA_PROMOS === 'undefined' || AMANDA_PROMOS.length === 0) return;
  currentPromoSlide = (currentPromoSlide - 1 + AMANDA_PROMOS.length) % AMANDA_PROMOS.length;
  updatePromoCoverflow();
}

function startPromoSlideAutoPlay() {
  if (promoSlideAutoTimer) clearInterval(promoSlideAutoTimer);
  const total = (typeof AMANDA_PROMOS !== 'undefined' && AMANDA_PROMOS) ? AMANDA_PROMOS.length : 0;
  if (total <= 1) return;

  promoSlideAutoTimer = setInterval(() => {
    if (!isPromoSlideHovered) {
      nextPromoSlideItem();
    }
  }, 5000);
}

function initPromoSlideEvents() {
  const wrapper = document.getElementById('promo-coverflow-wrapper');
  if (!wrapper || wrapper.dataset.initEvents) return;
  wrapper.dataset.initEvents = 'true';

  wrapper.addEventListener('mouseenter', () => { isPromoSlideHovered = true; });
  wrapper.addEventListener('mouseleave', () => { isPromoSlideHovered = false; });

  // Touch Swipe for Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  wrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  wrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        nextPromoSlideItem();
      } else {
        prevPromoSlideItem();
      }
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    updatePromoCoverflow();
  });
}

// ===================================================================
// PRICE LIST POSTER SHOWCASE & LIGHTBOX (SIMPEL & ZOOMABLE)
// ===================================================================
function renderPriceListCards() {
  const track = document.getElementById('pricelist-cards-track');
  if (!track || typeof AMANDA_PRICELISTS === 'undefined') return;

  track.innerHTML = AMANDA_PRICELISTS.map(item => {
    return `
      <div class="pricelist-card" id="card-${item.id}" onclick="openPriceListModal('${item.id}')" title="Klik untuk memperbesar price list">
        <div class="pricelist-media-box">
          <img src="${item.image}" alt="${item.title}" class="pricelist-img" loading="lazy" />
        </div>
      </div>
    `;
  }).join('');
}

function openPriceListModal(priceId) {
  const item = AMANDA_PRICELISTS.find(p => p.id === priceId);
  if (!item) return;

  const modal = document.getElementById('flyer-lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const caption = document.getElementById('lightbox-caption');

  if (modal && img) {
    img.src = item.image;
    img.alt = item.title || "Price List Amanda Brownies Balikpapan";
    if (title) title.textContent = item.title;
    if (caption) caption.textContent = item.caption || 'Daftar Harga Resmi Amanda Brownies Kalimantan - Outlet Balikpapan';
    resetFlyerZoom();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Lightbox Zoom & Pan State
let flyerZoomState = {
  scale: 1,
  minScale: 1,
  maxScale: 3.5,
  step: 0.35,
  posX: 0,
  posY: 0,
  isDragging: false,
  startX: 0,
  startY: 0
};

// Open Lightbox Modal
function openFlyerModal(promoId) {
  const promo = AMANDA_PROMOS.find(p => p.id === promoId);
  if (!promo) return;

  const modal = document.getElementById('flyer-lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const caption = document.getElementById('lightbox-caption');

  if (modal && img) {
    img.src = promo.image;
    img.alt = promo.title || "Flyer Promo Amanda Brownies";
    if (title) title.textContent = promo.title;
    if (caption) caption.textContent = promo.badge ? `${promo.badge} • ${promo.period}` : 'Flyer Resmi Amanda Kalimantan';
    resetFlyerZoom();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // prevent scroll while modal open
  }
}

// Close Lightbox Modal
function closeFlyerModal(event) {
  if (event && event.target && event.target.closest('.lightbox-card') && !event.target.closest('.lightbox-close-btn')) {
    return;
  }
  const modal = document.getElementById('flyer-lightbox-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    resetFlyerZoom();
  }
}

// ===================================================================
// LIGHTBOX ZOOM IN / ZOOM OUT & PAN DRAG ENGINE
// ===================================================================
function initFlyerZoomListeners() {
  const wrapper = document.getElementById('lightbox-img-wrapper');
  if (!wrapper) return;

  // Mouse wheel zoom
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomInFlyer();
    } else {
      zoomOutFlyer();
    }
  }, { passive: false });

  // Double click to toggle 1x and 2x zoom
  wrapper.addEventListener('dblclick', (e) => {
    e.preventDefault();
    if (flyerZoomState.scale > 1) {
      resetFlyerZoom();
    } else {
      setFlyerZoom(2);
    }
  });

  // Mouse drag / pan when zoomed
  wrapper.addEventListener('mousedown', (e) => {
    if (flyerZoomState.scale <= 1) return;
    flyerZoomState.isDragging = true;
    flyerZoomState.startX = e.clientX - flyerZoomState.posX;
    flyerZoomState.startY = e.clientY - flyerZoomState.posY;
    wrapper.classList.add('dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!flyerZoomState.isDragging) return;
    flyerZoomState.posX = e.clientX - flyerZoomState.startX;
    flyerZoomState.posY = e.clientY - flyerZoomState.startY;
    applyFlyerTransform();
  });

  window.addEventListener('mouseup', () => {
    if (flyerZoomState.isDragging) {
      flyerZoomState.isDragging = false;
      const wrap = document.getElementById('lightbox-img-wrapper');
      if (wrap) wrap.classList.remove('dragging');
    }
  });

  // Touch support for mobile (pinch and touch pan)
  let touchStartDist = 0;
  let touchStartScale = 1;

  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1 && flyerZoomState.scale > 1) {
      flyerZoomState.isDragging = true;
      flyerZoomState.startX = e.touches[0].clientX - flyerZoomState.posX;
      flyerZoomState.startY = e.touches[0].clientY - flyerZoomState.posY;
    } else if (e.touches.length === 2) {
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartScale = flyerZoomState.scale;
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && flyerZoomState.isDragging) {
      flyerZoomState.posX = e.touches[0].clientX - flyerZoomState.startX;
      flyerZoomState.posY = e.touches[0].clientY - flyerZoomState.startY;
      applyFlyerTransform();
    } else if (e.touches.length === 2 && touchStartDist > 0) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchStartDist;
      setFlyerZoom(touchStartScale * factor);
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    flyerZoomState.isDragging = false;
    touchStartDist = 0;
  });
}

function zoomInFlyer() {
  setFlyerZoom(flyerZoomState.scale + flyerZoomState.step);
}

function zoomOutFlyer() {
  setFlyerZoom(flyerZoomState.scale - flyerZoomState.step);
}

function setFlyerZoom(newScale) {
  flyerZoomState.scale = Math.min(Math.max(newScale, flyerZoomState.minScale), flyerZoomState.maxScale);
  if (flyerZoomState.scale <= 1) {
    flyerZoomState.scale = 1;
    flyerZoomState.posX = 0;
    flyerZoomState.posY = 0;
  }
  applyFlyerTransform();
}

function resetFlyerZoom() {
  flyerZoomState.scale = 1;
  flyerZoomState.posX = 0;
  flyerZoomState.posY = 0;
  applyFlyerTransform();
}

function applyFlyerTransform() {
  const img = document.getElementById('lightbox-img');
  const levelText = document.getElementById('lightbox-zoom-level');
  const wrapper = document.getElementById('lightbox-img-wrapper');
  const guide = document.getElementById('lightbox-zoom-guide');

  if (!img) return;

  img.style.transform = `translate(${flyerZoomState.posX}px, ${flyerZoomState.posY}px) scale(${flyerZoomState.scale})`;

  if (levelText) {
    levelText.textContent = `${Math.round(flyerZoomState.scale * 100)}%`;
  }

  if (wrapper) {
    if (flyerZoomState.scale > 1) {
      wrapper.classList.add('zoomed');
    } else {
      wrapper.classList.remove('zoomed');
    }
  }

  if (guide) {
    guide.classList.toggle('visible', flyerZoomState.scale > 1);
  }
}

// Keyboard shortcuts for modal: Escape, +, -, 0
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('flyer-lightbox-modal');
  if (!modal || !modal.classList.contains('active')) return;

  if (e.key === 'Escape') {
    closeFlyerModal();
  } else if (e.key === '+' || e.key === '=') {
    zoomInFlyer();
  } else if (e.key === '-' || e.key === '_') {
    zoomOutFlyer();
  } else if (e.key === '0') {
    resetFlyerZoom();
  }
});




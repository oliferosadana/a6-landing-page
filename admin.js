// ===================================================================
// AMANDA BROWNIES BALIKPAPAN - CMS DASHBOARD JAVASCRIPT
// Handles CRUD for Promos (4:5), Products, Outlets, Ticker & LocalStorage
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  renderPromosManager();
  renderProductsManager();
  renderOutletsManager();
  renderTickerManager();
  renderSubscriptionManager();

  // Listen for storage changes from other tabs
  window.addEventListener('storage', (e) => {
    if (!e.key || e.key.startsWith('amanda_')) {
      if (typeof reloadAmandaData === 'function') reloadAmandaData();
      renderDashboard();
      renderPromosManager();
      renderProductsManager();
      renderOutletsManager();
      renderTickerManager();
      renderSubscriptionManager();
    }
  });

  // Listen for in-app data updates
  window.addEventListener('amanda_data_updated', () => {
    if (typeof reloadAmandaData === 'function') reloadAmandaData();
    renderDashboard();
    renderPromosManager();
    renderProductsManager();
    renderOutletsManager();
    renderTickerManager();
    renderSubscriptionManager();
  });
});

// ==================== NAVIGATION TABS ====================
function switchTab(tabName, btnElement) {
  // Update nav buttons
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  // Update sections
  document.querySelectorAll('.cms-section').forEach(sec => sec.classList.remove('active'));
  const targetSection = document.getElementById(`section-${tabName}`);
  if (targetSection) targetSection.classList.add('active');

  // Update Topbar Heading
  const headingMap = {
    'dashboard': 'Ringkasan Dashboard',
    'promos': 'Manajemen Flyer & Promo Resmi (4:5)',
    'products': 'Katalog Produk & Ketersediaan Stok',
    'outlets': 'Cabang Outlet Resmi Balikpapan',
    'ticker': 'Pengumuman Running Promo Ticker',
    'subscription': 'Status Sewa & Tagihan Website',
    'settings': 'Cadangan, Impor & Reset Data'
  };
  const headingElem = document.getElementById('page-heading');
  if (headingElem) headingElem.textContent = headingMap[tabName] || 'CMS Amanda Balikpapan';

  // Auto-close sidebar on mobile
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('cms-sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  // Refresh data view
  if (tabName === 'dashboard') renderDashboard();
  if (tabName === 'promos') renderPromosManager();
  if (tabName === 'products') renderProductsManager();
  if (tabName === 'outlets') renderOutletsManager();
  if (tabName === 'ticker') renderTickerManager();
  if (tabName === 'subscription') renderSubscriptionManager();
}

function toggleSidebar() {
  const sidebar = document.getElementById('cms-sidebar');
  if (sidebar) sidebar.classList.toggle('open');
}

// ==================== DASHBOARD OVERVIEW ====================
function renderDashboard() {
  // Update Counts
  document.getElementById('dash-total-products').textContent = AMANDA_PRODUCTS.length;
  document.getElementById('dash-total-promos').textContent = AMANDA_PROMOS.length;
  document.getElementById('dash-total-outlets').textContent = AMANDA_OUTLETS.length;
  document.getElementById('dash-total-ticker').textContent = AMANDA_TICKER.length;

  document.getElementById('badge-prod-count').textContent = AMANDA_PRODUCTS.length;
  document.getElementById('badge-promo-count').textContent = AMANDA_PROMOS.length;
  document.getElementById('badge-outlet-count').textContent = AMANDA_OUTLETS.length;

  // Render Promo Mini Previews
  const promoContainer = document.getElementById('dash-promos-container');
  if (promoContainer) {
    promoContainer.innerHTML = AMANDA_PROMOS.slice(0, 2).map(p => `
      <div class="dash-promo-item">
        <img src="${p.image}" alt="${p.title}" />
        <div class="dash-promo-info">
          <h5>${p.title}</h5>
          <span>${p.badge || 'Promo Spesial'}</span>
        </div>
      </div>
    `).join('');
  }

  // Render Outlets Mini List
  const outletContainer = document.getElementById('dash-outlets-container');
  if (outletContainer) {
    outletContainer.innerHTML = AMANDA_OUTLETS.map(o => `
      <div class="dash-outlet-row">
        <div>
          <span class="dash-outlet-name">${o.name}</span>
          <div class="dash-outlet-city"><i class="fa-solid fa-location-dot" style="color: var(--ch-olive);"></i> ${o.city} • ${o.hours}</div>
        </div>
        <span class="stock-tag-mini"><i class="fa-solid fa-circle-check"></i> Aktif</span>
      </div>
    `).join('');
  }
}

// ===================================================================
// 1. PROMO FLYER (4:5) MANAGEMENT
// ===================================================================
function renderPromosManager() {
  const grid = document.getElementById('promos-management-grid');
  if (grid) {
    grid.innerHTML = AMANDA_PROMOS.map(p => `
      <div class="cms-promo-card">
        <div class="cms-promo-media">
          <img src="${p.image}" alt="${p.title}" />
          <span class="cms-promo-badge ${p.badgeColor === 'red' ? 'red' : ''}">${p.badge}</span>
        </div>
        <div class="cms-promo-body">
          <h4 class="cms-promo-title font-serif">${p.title}</h4>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">${p.description}</p>
          <small style="color: var(--text-dim); font-size: 11.5px;"><i class="fa-regular fa-clock"></i> ${p.period}</small>

          <div class="cms-promo-actions">
            <button class="btn-edit-sm" onclick="editPromo('${p.id}')"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="btn-del-sm" onclick="deletePromo('${p.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderPriceListsManager();
}

// ==================== PRICE LISTS MANAGEMENT ====================
function renderPriceListsManager() {
  const grid = document.getElementById('pricelists-management-grid');
  if (!grid || typeof AMANDA_PRICELISTS === 'undefined') return;

  grid.innerHTML = AMANDA_PRICELISTS.map(p => `
    <div class="cms-promo-card">
      <div class="cms-promo-media">
        <img src="${p.image}" alt="${p.title}" style="object-fit: contain; background: #ede3d1;" />
        <span class="cms-promo-badge">${p.badge || 'Price List'}</span>
      </div>
      <div class="cms-promo-body">
        <h4 class="cms-promo-title font-serif">${p.title}</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">${p.caption || '-'}</p>
        <div class="cms-promo-actions">
          <button class="btn-edit-sm" onclick="editPriceList('${p.id}')"><i class="fa-solid fa-pen-to-square"></i> Edit Poster</button>
        </div>
      </div>
    </div>
  `).join('');
}

function editPriceList(id) {
  const item = AMANDA_PRICELISTS.find(p => p.id === id);
  if (item) openPriceListModal(item);
}

function openPriceListModal(item) {
  const modal = document.getElementById('pricelist-modal');
  const form = document.getElementById('pricelist-form');
  if (!modal || !form) return;

  const fileInput = document.getElementById('pricelist-form-file');
  if (fileInput) fileInput.value = '';

  form.reset();
  document.getElementById('pricelist-form-id').value = item.id;
  document.getElementById('pricelist-form-title').value = item.title;
  document.getElementById('pricelist-form-badge').value = item.badge || '';
  document.getElementById('pricelist-form-image').value = item.image;
  document.getElementById('pricelist-form-caption').value = item.caption || '';
  previewPriceListImage(item.image);

  modal.classList.add('active');
}

function previewPriceListImage(url) {
  const img = document.getElementById('pricelist-img-preview');
  if (img) img.src = url || 'assets/amanda_pricelist_poster.jpg';
}

function savePriceListForm(e) {
  e.preventDefault();
  const id = document.getElementById('pricelist-form-id').value;
  const title = document.getElementById('pricelist-form-title').value.trim();
  const badge = document.getElementById('pricelist-form-badge').value.trim();
  const image = document.getElementById('pricelist-form-image').value.trim();
  const caption = document.getElementById('pricelist-form-caption').value.trim();

  const idx = AMANDA_PRICELISTS.findIndex(p => p.id === id);
  if (idx !== -1) {
    AMANDA_PRICELISTS[idx] = { ...AMANDA_PRICELISTS[idx], title, badge, image, caption };
  } else {
    AMANDA_PRICELISTS.push({ id: 'price-' + Date.now(), title, badge, image, caption });
  }

  saveStoredData('amanda_pricelists', AMANDA_PRICELISTS);
  closeModal('pricelist-modal');
  renderPromosManager();
  showCmsToast('Poster price list berhasil diperbarui!');
}

// ==================== IMAGE UPLOAD HELPER (FILE FROM DEVICE / SMARTPHONE) ====================
function handleImageFileUpload(event, targetInputId, targetPreviewId, maxDim = 1200) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Harap pilih file gambar yang valid (JPG, PNG, WebP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const rawDataUrl = e.target.result;

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Smart resize if image exceeds maximum dimensions
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Export as optimized JPEG for crisp display and compact storage
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

      const targetInput = document.getElementById(targetInputId);
      const targetPreview = document.getElementById(targetPreviewId);

      if (targetInput) targetInput.value = optimizedDataUrl;
      if (targetPreview) targetPreview.src = optimizedDataUrl;

      showCmsToast('Foto dari perangkat berhasil diproses & siap disimpan!', 'Upload Berhasil');
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

function previewPromoImage(url) {
  const img = document.getElementById('promo-img-preview');
  if (img) img.src = url || 'assets/promo_flyer_1.jpg';
}

function previewProductImage(url) {
  const img = document.getElementById('prod-img-preview');
  if (img) img.src = url || 'assets/amanda_brownies_hero_1790255505694.jpg';
}

function previewOutletImage(url) {
  const img = document.getElementById('outlet-img-preview');
  if (img) img.src = url || 'assets/outlet_mt_haryono.jpg';
}

function openPromoModal(promo = null) {
  const modal = document.getElementById('promo-modal');
  const titleElem = document.getElementById('promo-modal-title');
  const form = document.getElementById('promo-form');
  const fileInput = document.getElementById('promo-form-file');
  if (fileInput) fileInput.value = '';

  form.reset();
  if (promo) {
    titleElem.textContent = 'Edit Flyer Promo (4:5)';
    document.getElementById('promo-form-id').value = promo.id;
    document.getElementById('promo-form-title').value = promo.title;
    document.getElementById('promo-form-badge').value = promo.badge;
    document.getElementById('promo-form-badgeColor').value = promo.badgeColor || 'gold';
    document.getElementById('promo-form-image').value = promo.image;
    document.getElementById('promo-form-period').value = promo.period;
    document.getElementById('promo-form-desc').value = promo.description;
    document.getElementById('promo-form-waMsg').value = promo.waMessage || '';
    previewPromoImage(promo.image);
  } else {
    titleElem.textContent = 'Tambah Flyer Promo Baru (4:5)';
    document.getElementById('promo-form-id').value = '';
    document.getElementById('promo-form-image').value = 'assets/promo_flyer_1.jpg';
    previewPromoImage('assets/promo_flyer_1.jpg');
  }

  modal.classList.add('active');
}

function editPromo(id) {
  const promo = AMANDA_PROMOS.find(p => p.id === id);
  if (promo) openPromoModal(promo);
}

function deletePromo(id) {
  if (confirm('Apakah Anda yakin ingin menghapus promo flyer ini?')) {
    AMANDA_PROMOS = AMANDA_PROMOS.filter(p => p.id !== id);
    saveStoredData('amanda_promos', AMANDA_PROMOS);
    renderPromosManager();
    renderDashboard();
    showCmsToast('Promo flyer berhasil dihapus!');
  }
}

function savePromoForm(e) {
  e.preventDefault();
  const id = document.getElementById('promo-form-id').value;
  const title = document.getElementById('promo-form-title').value.trim();
  const badge = document.getElementById('promo-form-badge').value.trim();
  const badgeColor = document.getElementById('promo-form-badgeColor').value;
  const image = document.getElementById('promo-form-image').value.trim();
  const period = document.getElementById('promo-form-period').value.trim();
  const desc = document.getElementById('promo-form-desc').value.trim();
  const waMsg = document.getElementById('promo-form-waMsg').value.trim() || `Halo Amanda Brownies Balikpapan, saya ingin memesan Promo "${title}".`;

  if (id) {
    // Update existing
    const idx = AMANDA_PROMOS.findIndex(p => p.id === id);
    if (idx !== -1) {
      AMANDA_PROMOS[idx] = {
        ...AMANDA_PROMOS[idx],
        title, badge, badgeColor, image, period, description: desc, waMessage: waMsg
      };
    }
  } else {
    // Create new
    const newPromo = {
      id: 'promo-' + Date.now(),
      title, badge, badgeColor, image,
      aspectRatio: "4/5",
      period,
      description: desc,
      waMessage: waMsg,
      ctaText: "Pesan Promo",
      active: true
    };
    AMANDA_PROMOS.push(newPromo);
  }

  saveStoredData('amanda_promos', AMANDA_PROMOS);
  closeModal('promo-modal');
  renderPromosManager();
  renderDashboard();
  showCmsToast('Data flyer promo berhasil disimpan!');
}

// ===================================================================
// 2. PRODUCT & STOCKS MANAGEMENT
// ===================================================================
function renderProductsManager(filterQuery = '') {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  const filtered = AMANDA_PRODUCTS.filter(p => {
    return p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
           p.categoryLabel.toLowerCase().includes(filterQuery.toLowerCase());
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-dim);">Menu tidak ditemukan.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    // Generate mini stock badges
    const stockBadges = (p.outlets || []).map(outStock => {
      const outlet = AMANDA_OUTLETS.find(o => o.id === outStock.outletId);
      const outletShortName = outlet ? outlet.city : 'Cabang';
      const isAvailable = outStock.status === 'Tersedia';
      const isLimited = outStock.status === 'Terbatas';
      const tagClass = isAvailable ? '' : (isLimited ? 'limited' : 'empty');
      return `<span class="stock-tag-mini ${tagClass}">${outletShortName}: ${outStock.status}</span>`;
    }).join('');

    return `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.name}" class="table-prod-img" />
        </td>
        <td>
          <strong>${p.name}</strong>
          <div style="font-size: 11.5px; color: var(--ch-olive);">${p.categoryLabel}</div>
        </td>
        <td>
          <strong style="color: var(--ch-gold-dark);">Rp ${p.price.toLocaleString('id-ID')}</strong>
        </td>
        <td>
          <div>${p.weight || '700 gram'}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${p.shelfLife || '-'}</div>
        </td>
        <td>
          <div class="prod-stock-badges-row">
            ${stockBadges}
          </div>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn-edit-sm" onclick="editProduct('${p.id}')" title="Edit Menu & Stok"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn-del-sm" onclick="deleteProduct('${p.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterProductsTable(query) {
  renderProductsManager(query);
}

function openProductModal(prod = null) {
  const modal = document.getElementById('product-modal');
  const titleElem = document.getElementById('product-modal-title');
  const form = document.getElementById('product-form');
  const stocksTbody = document.getElementById('prod-stocks-tbody');

  form.reset();

  // Populate stocks rows per 6 Balikpapan outlets
  const currentOutletsData = prod ? prod.outlets || [] : [];
  stocksTbody.innerHTML = AMANDA_OUTLETS.map(out => {
    const existingStock = currentOutletsData.find(os => os.outletId === out.id) || {
      status: "Tersedia",
      stock: "Stok Melimpah (30+ box)"
    };

    return `
      <tr data-outlet-id="${out.id}">
        <td>
          <strong>${out.name}</strong>
          <div style="font-size: 11px; color: var(--text-dim);">${out.city}</div>
        </td>
        <td>
          <select class="stock-status-select" data-outlet-id="${out.id}">
            <option value="Tersedia" ${existingStock.status === 'Tersedia' ? 'selected' : ''}>Tersedia (Ready)</option>
            <option value="Terbatas" ${existingStock.status === 'Terbatas' ? 'selected' : ''}>Terbatas (Sisa Sedikit)</option>
            <option value="Habis" ${existingStock.status === 'Habis' ? 'selected' : ''}>Habis (Sold Out)</option>
          </select>
        </td>
        <td>
          <input type="text" class="stock-desc-input" data-outlet-id="${out.id}" value="${existingStock.stock || 'Stok Melimpah'}" placeholder="Contoh: Sisa 5 box">
        </td>
      </tr>
    `;
  }).join('');

  const prodFileInput = document.getElementById('prod-form-file');
  if (prodFileInput) prodFileInput.value = '';

  if (prod) {
    titleElem.textContent = 'Edit Menu & Stok: ' + prod.name;
    document.getElementById('prod-form-id').value = prod.id;
    document.getElementById('prod-form-name').value = prod.name;
    document.getElementById('prod-form-category').value = prod.category;
    document.getElementById('prod-form-price').value = prod.price;
    document.getElementById('prod-form-weight').value = prod.weight || '700 gram';
    document.getElementById('prod-form-shelfLife').value = prod.shelfLife || '';
    document.getElementById('prod-form-badge').value = prod.badge || '';
    document.getElementById('prod-form-image').value = prod.image;
    document.getElementById('prod-form-desc').value = prod.description || '';
    previewProductImage(prod.image);
  } else {
    titleElem.textContent = 'Tambah Menu Brownies Baru';
    document.getElementById('prod-form-id').value = '';
    document.getElementById('prod-form-image').value = 'assets/amanda_brownies_hero_1790255505694.jpg';
    document.getElementById('prod-form-weight').value = '700 gram';
    document.getElementById('prod-form-shelfLife').value = '4 Hari (Suhu Ruang) / 7 Hari (Kulkas)';
    previewProductImage('assets/amanda_brownies_hero_1790255505694.jpg');
  }

  modal.classList.add('active');
}

function editProduct(id) {
  const prod = AMANDA_PRODUCTS.find(p => p.id === id);
  if (prod) openProductModal(prod);
}

function deleteProduct(id) {
  if (confirm('Apakah Anda yakin ingin menghapus produk ini dari katalog?')) {
    AMANDA_PRODUCTS = AMANDA_PRODUCTS.filter(p => p.id !== id);
    saveStoredData('amanda_products', AMANDA_PRODUCTS);
    renderProductsManager();
    renderDashboard();
    showCmsToast('Produk berhasil dihapus!');
  }
}

function saveProductForm(e) {
  e.preventDefault();
  const id = document.getElementById('prod-form-id').value;
  const name = document.getElementById('prod-form-name').value.trim();
  const category = document.getElementById('prod-form-category').value;
  const price = parseInt(document.getElementById('prod-form-price').value, 10) || 0;
  const weight = document.getElementById('prod-form-weight').value.trim() || '700 gram';
  const shelfLife = document.getElementById('prod-form-shelfLife').value.trim() || '4 Hari (Suhu Ruang)';
  const badge = document.getElementById('prod-form-badge').value.trim() || 'Varian Pilihan';
  const image = document.getElementById('prod-form-image').value.trim();
  const desc = document.getElementById('prod-form-desc').value.trim();

  const categoryLabelMap = {
    'kukus': 'Brownies Kukus',
    'bakar': 'Brownies Bakar',
    'marble': 'Premium & Marble'
  };

  // Collect per-outlet stocks
  const outletStockRows = document.querySelectorAll('#prod-stocks-tbody tr');
  const outletsStockData = Array.from(outletStockRows).map(row => {
    const outId = row.getAttribute('data-outlet-id');
    const statusSelect = row.querySelector('.stock-status-select');
    const descInput = row.querySelector('.stock-desc-input');
    return {
      outletId: outId,
      status: statusSelect ? statusSelect.value : 'Tersedia',
      stock: descInput ? descInput.value.trim() : 'Stok Melimpah',
      lastRestock: 'Baru saja diperbarui'
    };
  });

  if (id) {
    // Update
    const idx = AMANDA_PRODUCTS.findIndex(p => p.id === id);
    if (idx !== -1) {
      AMANDA_PRODUCTS[idx] = {
        ...AMANDA_PRODUCTS[idx],
        name,
        category,
        categoryLabel: categoryLabelMap[category] || 'Brownies',
        price,
        weight,
        shelfLife,
        badge,
        image,
        description: desc,
        outlets: outletsStockData
      };
    }
  } else {
    // Create
    const newProd = {
      id: 'prod-' + Date.now(),
      name,
      category,
      categoryLabel: categoryLabelMap[category] || 'Brownies',
      badge,
      badgeColor: category === 'bakar' ? 'bakar' : (category === 'marble' ? 'coffee' : 'gold'),
      price,
      image,
      description: desc,
      weight,
      shelfLife,
      sweetness: "Sedang & Gurih",
      ingredients: "Dark Chocolate, Telur Segar, Tepung Terigu, Mentega",
      outlets: outletsStockData
    };
    AMANDA_PRODUCTS.push(newProd);
  }

  saveStoredData('amanda_products', AMANDA_PRODUCTS);
  closeModal('product-modal');
  renderProductsManager();
  renderDashboard();
  showCmsToast('Data menu & ketersediaan stok berhasil disimpan!');
}

// ===================================================================
// 3. OUTLETS MANAGEMENT
// ===================================================================
// 3. OUTLETS & BOOTH COUNTERS MANAGEMENT
// ===================================================================
function renderOutletsManager() {
  const grid = document.getElementById('outlets-management-grid');
  if (!grid) return;

  grid.innerHTML = AMANDA_OUTLETS.map(o => {
    const boothsList = o.booths || [];
    const boothsPillsHTML = boothsList.length > 0 ? `
      <div class="cms-outlet-booths-box">
        <div class="cms-booths-header">
          <span><i class="fa-solid fa-store" style="color: var(--ch-gold-dark);"></i> ${boothsList.length} Titik Booth Counter:</span>
        </div>
        <div class="cms-booths-tags">
          ${boothsList.map(b => `
            <div class="cms-booth-badge" title="Lokasi: ${b.location || '-'}\nWA: ${b.wa || o.wa}\nMaps: ${b.mapsUrl || '-'}">
              <span class="booth-dot"></span>
              <strong>${b.name}</strong>
              <small>${b.hours || o.hours}</small>
              <div class="cms-booth-badge-links">
                <a href="https://wa.me/${b.wa || o.wa}" target="_blank" title="WhatsApp: ${b.wa || o.wa}"><i class="fa-brands fa-whatsapp" style="color: #25d366;"></i></a>
                <a href="${b.mapsUrl || o.mapsUrl || '#'}" target="_blank" title="Buka Rute Maps"><i class="fa-solid fa-map-location-dot" style="color: #3498db;"></i></a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '<div style="font-size: 11.5px; color: var(--text-dim); margin-top: 6px; font-style: italic;">Belum ada booth counter cabang.</div>';

    return `
      <div class="cms-outlet-card">
        <div class="cms-outlet-media">
          <img src="${o.image}" alt="${o.name}" />
          <span class="cms-outlet-city-badge">${o.city}</span>
        </div>
        <div class="cms-outlet-body">
          <h4 class="cms-outlet-name font-serif">${o.name}</h4>
          <p class="cms-outlet-addr"><i class="fa-solid fa-location-dot" style="color: var(--ch-olive);"></i> ${o.address}</p>
          
          <div class="cms-outlet-meta">
            <span><i class="fa-regular fa-clock"></i> <strong>Jam Buka:</strong> ${o.hours}</span>
            <span><i class="fa-brands fa-whatsapp" style="color: var(--accent-green);"></i> <strong>WA Cabang:</strong> +${o.wa}</span>
            <span><i class="fa-solid fa-phone"></i> <strong>Telepon Toko:</strong> ${o.phone || '-'}</span>
            <span><i class="fa-solid fa-map-pin" style="color: #e74c3c;"></i> <strong>Google Maps:</strong> <a href="${o.mapsUrl}" target="_blank" style="color: var(--ch-olive); text-decoration: underline; font-size: 11px;">Buka Peta Cabang <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 9px;"></i></a></span>
          </div>

          ${boothsPillsHTML}

          <div class="cms-promo-actions">
            <button class="btn-edit-sm" onclick="editOutlet('${o.id}')"><i class="fa-solid fa-pen-to-square"></i> Edit Cabang & Booth</button>
            <button class="btn-del-sm" onclick="deleteOutlet('${o.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openOutletModal(outlet = null) {
  const modal = document.getElementById('outlet-modal');
  const titleElem = document.getElementById('outlet-modal-title');
  const form = document.getElementById('outlet-form');

  const outletFileInput = document.getElementById('outlet-form-file');
  if (outletFileInput) outletFileInput.value = '';

  form.reset();
  if (outlet) {
    titleElem.textContent = 'Edit Data Cabang & Booth: ' + outlet.name;
    document.getElementById('outlet-form-id').value = outlet.id;
    document.getElementById('outlet-form-name').value = outlet.name;
    document.getElementById('outlet-form-city').value = outlet.city;
    document.getElementById('outlet-form-hours').value = outlet.hours;
    document.getElementById('outlet-form-wa').value = outlet.wa;
    document.getElementById('outlet-form-phone').value = outlet.phone || '';
    document.getElementById('outlet-form-address').value = outlet.address;
    document.getElementById('outlet-form-image').value = outlet.image;
    document.getElementById('outlet-form-maps').value = outlet.mapsUrl || '';
    previewOutletImage(outlet.image);
    renderBoothEditorRows(outlet.booths || [], outlet.wa);
  } else {
    titleElem.textContent = 'Tambah Cabang Outlet & Booth Baru';
    document.getElementById('outlet-form-id').value = '';
    document.getElementById('outlet-form-image').value = 'assets/outlet_mt_haryono.jpg';
    document.getElementById('outlet-form-hours').value = '07.30 - 21.30 WITA';
    document.getElementById('outlet-form-wa').value = '6281322119988';
    previewOutletImage('assets/outlet_mt_haryono.jpg');
    renderBoothEditorRows([], '6281322119988');
  }

  modal.classList.add('active');
}

function renderBoothEditorRows(booths = [], defaultWa = '6281322119988') {
  const container = document.getElementById('outlet-booths-editor-container');
  if (!container) return;

  if (booths.length === 0) {
    container.innerHTML = '<div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 14px; background: #fff; border: 1px dashed var(--ch-sand-border); border-radius: var(--radius-sm);"><i class="fa-solid fa-store" style="font-size: 18px; color: var(--ch-gold); display: block; margin-bottom: 6px;"></i>Belum ada booth counter cabang. Klik <strong>"+ Tambah Booth"</strong> di atas untuk menambahkan titik counter baru beserta nomor WhatsApp & link Google Maps.</div>';
    return;
  }

  container.innerHTML = booths.map((b, idx) => `
    <div class="booth-editor-card" data-booth-id="${b.id || ('bth-' + idx)}">
      <div class="booth-editor-top">
        <div class="booth-input-group flex-2">
          <label><i class="fa-solid fa-store"></i> Nama Titik Booth Counter *</label>
          <input type="text" class="booth-name-input" value="${b.name || ''}" placeholder="Contoh: Booth BSCC Dome / Booth Living Plaza" required>
        </div>
        <div class="booth-input-group flex-2">
          <label><i class="fa-solid fa-location-dot"></i> Lokasi Detail / Mall</label>
          <input type="text" class="booth-loc-input" value="${b.location || ''}" placeholder="Contoh: Lantai Dasar Depan Informa">
        </div>
        <div class="booth-input-group flex-1">
          <label><i class="fa-regular fa-clock"></i> Jam Operasional</label>
          <input type="text" class="booth-hours-input" value="${b.hours || '10.00 - 22.00 WITA'}" placeholder="10.00 - 22.00 WITA">
        </div>
        <button type="button" class="btn-del-booth" onclick="removeBoothRow(this)" title="Hapus Titik Booth">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>

      <div class="booth-editor-bottom">
        <div class="booth-input-group flex-1">
          <label><i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> Nomor WhatsApp Khusus Booth (Format 62xxx)</label>
          <input type="text" class="booth-wa-input" value="${b.wa || defaultWa || ''}" placeholder="Contoh: 6281255443322">
        </div>
        <div class="booth-input-group flex-2">
          <label><i class="fa-solid fa-map-location-dot" style="color: #e74c3c;"></i> Tautan Google Maps Titik Booth</label>
          <input type="text" class="booth-maps-input" value="${b.mapsUrl || ''}" placeholder="https://maps.google.com/?q=Living+Plaza+Balikpapan">
        </div>
      </div>
    </div>
  `).join('');
}

function addNewBoothRow() {
  const container = document.getElementById('outlet-booths-editor-container');
  if (!container) return;

  if (container.children.length === 1 && !container.children[0].classList.contains('booth-editor-card')) {
    container.innerHTML = '';
  }

  const currentWa = document.getElementById('outlet-form-wa')?.value || '6281322119988';
  const newCard = document.createElement('div');
  newCard.className = 'booth-editor-card';
  newCard.setAttribute('data-booth-id', 'bth-custom-' + Date.now());
  newCard.innerHTML = `
    <div class="booth-editor-top">
      <div class="booth-input-group flex-2">
        <label><i class="fa-solid fa-store"></i> Nama Titik Booth Counter *</label>
        <input type="text" class="booth-name-input" value="" placeholder="Contoh: Booth Baru Mall / SPBU" required>
      </div>
      <div class="booth-input-group flex-2">
        <label><i class="fa-solid fa-location-dot"></i> Lokasi Detail / Mall</label>
        <input type="text" class="booth-loc-input" value="" placeholder="Contoh: Lantai 1 Dekat Pintu Utama">
      </div>
      <div class="booth-input-group flex-1">
        <label><i class="fa-regular fa-clock"></i> Jam Operasional</label>
        <input type="text" class="booth-hours-input" value="10.00 - 22.00 WITA" placeholder="10.00 - 22.00 WITA">
      </div>
      <button type="button" class="btn-del-booth" onclick="removeBoothRow(this)" title="Hapus Titik Booth">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>

    <div class="booth-editor-bottom">
      <div class="booth-input-group flex-1">
        <label><i class="fa-brands fa-whatsapp" style="color: #25d366;"></i> Nomor WhatsApp Khusus Booth (Format 62xxx)</label>
        <input type="text" class="booth-wa-input" value="${currentWa}" placeholder="Contoh: 6281255443322">
      </div>
      <div class="booth-input-group flex-2">
        <label><i class="fa-solid fa-map-location-dot" style="color: #e74c3c;"></i> Tautan Google Maps Titik Booth</label>
        <input type="text" class="booth-maps-input" value="" placeholder="https://maps.google.com/?q=Lokasi+Booth+Balikpapan">
      </div>
    </div>
  `;
  container.appendChild(newCard);
}

function removeBoothRow(btn) {
  const card = btn.closest('.booth-editor-card');
  if (card) card.remove();
  const container = document.getElementById('outlet-booths-editor-container');
  if (container && container.children.length === 0) {
    container.innerHTML = '<div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 14px; background: #fff; border: 1px dashed var(--ch-sand-border); border-radius: var(--radius-sm);"><i class="fa-solid fa-store" style="font-size: 18px; color: var(--ch-gold); display: block; margin-bottom: 6px;"></i>Belum ada booth counter cabang. Klik <strong>"+ Tambah Booth"</strong> di atas untuk menambahkan titik counter baru beserta nomor WhatsApp & link Google Maps.</div>';
  }
}

function editOutlet(id) {
  const outlet = AMANDA_OUTLETS.find(o => o.id === id);
  if (outlet) openOutletModal(outlet);
}

function deleteOutlet(id) {
  if (confirm('Apakah Anda yakin ingin menghapus data cabang outlet ini beserta semua booth-nya?')) {
    AMANDA_OUTLETS = AMANDA_OUTLETS.filter(o => o.id !== id);
    saveStoredData('amanda_outlets', AMANDA_OUTLETS);
    renderOutletsManager();
    renderDashboard();
    showCmsToast('Data outlet berhasil dihapus!');
  }
}

function saveOutletForm(e) {
  e.preventDefault();
  const id = document.getElementById('outlet-form-id').value;
  const name = document.getElementById('outlet-form-name').value.trim();
  const city = document.getElementById('outlet-form-city').value;
  const hours = document.getElementById('outlet-form-hours').value.trim();
  const wa = document.getElementById('outlet-form-wa').value.trim().replace(/[^0-9]/g, '');
  const phone = document.getElementById('outlet-form-phone').value.trim();
  const address = document.getElementById('outlet-form-address').value.trim();
  const image = document.getElementById('outlet-form-image').value.trim();
  const mapsUrl = document.getElementById('outlet-form-maps').value.trim() || `https://maps.google.com/?q=${encodeURIComponent(name + ' Balikpapan')}`;

  // Collect booth counter rows
  const boothRows = document.querySelectorAll('#outlet-booths-editor-container .booth-editor-card');
  const collectedBooths = Array.from(boothRows).map((row, idx) => {
    const nameInput = row.querySelector('.booth-name-input');
    const locInput = row.querySelector('.booth-loc-input');
    const hoursInput = row.querySelector('.booth-hours-input');
    const waInput = row.querySelector('.booth-wa-input');
    const mapsInput = row.querySelector('.booth-maps-input');
    
    const bName = nameInput ? nameInput.value.trim() : `Booth ${idx + 1}`;
    const rawWa = waInput ? waInput.value.trim().replace(/[^0-9]/g, '') : '';
    const bWa = rawWa || wa;
    const bMaps = mapsInput && mapsInput.value.trim() ? mapsInput.value.trim() : `https://maps.google.com/?q=${encodeURIComponent(bName + ' ' + city + ' Balikpapan')}`;

    return {
      id: row.getAttribute('data-booth-id') || ('bth-' + idx),
      name: bName,
      location: locInput ? locInput.value.trim() : '',
      hours: hoursInput && hoursInput.value.trim() ? hoursInput.value.trim() : '10.00 - 22.00 WITA',
      status: 'Tersedia',
      wa: bWa,
      mapsUrl: bMaps
    };
  }).filter(b => b.name !== '');

  if (id) {
    const idx = AMANDA_OUTLETS.findIndex(o => o.id === id);
    if (idx !== -1) {
      AMANDA_OUTLETS[idx] = {
        ...AMANDA_OUTLETS[idx],
        name, city, hours, wa, phone, address, image, mapsUrl,
        booths: collectedBooths
      };
    }
  } else {
    const newOutlet = {
      id: 'out-bpn-' + Date.now(),
      name, city, region: "Kota Balikpapan",
      hours, wa, phone, address, image, mapsUrl,
      distance: "1.0 km",
      booths: collectedBooths
    };
    AMANDA_OUTLETS.push(newOutlet);
  }

  saveStoredData('amanda_outlets', AMANDA_OUTLETS);
  closeModal('outlet-modal');
  renderOutletsManager();
  renderDashboard();
  showCmsToast('Data cabang & nomor WA serta link Maps booth berhasil disimpan!');
}

// ===================================================================
// 4. RUNNING PROMO TICKER MANAGEMENT
// ===================================================================
function renderTickerManager() {
  const container = document.getElementById('ticker-list-container');
  if (!container) return;

  container.innerHTML = AMANDA_TICKER.map((t, idx) => `
    <div class="ticker-cms-item">
      <div class="ticker-cms-content">
        <div class="ticker-cms-icon"><i class="${t.icon || 'fa-solid fa-bullhorn'}"></i></div>
        <div class="ticker-cms-text">
          <strong>${t.title}</strong> ${t.text}
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn-edit-sm" onclick="editTicker(${idx})"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="btn-del-sm" onclick="deleteTicker(${idx})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function openTickerModal(ticker = null, index = null) {
  const modal = document.getElementById('ticker-modal');
  const titleElem = document.getElementById('ticker-modal-title');
  const form = document.getElementById('ticker-form');

  form.reset();
  if (ticker !== null) {
    titleElem.textContent = 'Edit Pengumuman Ticker';
    document.getElementById('ticker-form-id').value = index;
    document.getElementById('ticker-form-icon').value = ticker.icon || 'fa-solid fa-tag';
    document.getElementById('ticker-form-title').value = ticker.title;
    document.getElementById('ticker-form-text').value = ticker.text;
  } else {
    titleElem.textContent = 'Tambah Pengumuman Ticker';
    document.getElementById('ticker-form-id').value = '';
    document.getElementById('ticker-form-icon').value = 'fa-solid fa-tag';
  }

  modal.classList.add('active');
}

function editTicker(index) {
  const ticker = AMANDA_TICKER[index];
  if (ticker) openTickerModal(ticker, index);
}

function deleteTicker(index) {
  if (confirm('Hapus item pengumuman ticker ini?')) {
    AMANDA_TICKER.splice(index, 1);
    saveStoredData('amanda_ticker', AMANDA_TICKER);
    renderTickerManager();
    renderDashboard();
    showCmsToast('Item ticker berhasil dihapus!');
  }
}

function saveTickerForm(e) {
  e.preventDefault();
  const id = document.getElementById('ticker-form-id').value;
  const icon = document.getElementById('ticker-form-icon').value.trim() || 'fa-solid fa-tag';
  const title = document.getElementById('ticker-form-title').value.trim();
  const text = document.getElementById('ticker-form-text').value.trim();

  if (id !== '') {
    const idx = parseInt(id, 10);
    AMANDA_TICKER[idx] = { id: 'tick-' + (idx + 1), icon, title, text };
  } else {
    AMANDA_TICKER.push({ id: 'tick-' + Date.now(), icon, title, text });
  }

  saveStoredData('amanda_ticker', AMANDA_TICKER);
  closeModal('ticker-modal');
  renderTickerManager();
  renderDashboard();
  showCmsToast('Pengumuman ticker berhasil disimpan!');
}

// ===================================================================
// 5. BACKUP, IMPORT & RESET
// ===================================================================
function exportDataJSON() {
  const exportData = {
    exportedAt: new Date().toISOString(),
    city: "Kota Balikpapan",
    outlets: AMANDA_OUTLETS,
    promos: AMANDA_PROMOS,
    pricelists: AMANDA_PRICELISTS,
    products: AMANDA_PRODUCTS,
    ticker: AMANDA_TICKER
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `amanda_balikpapan_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showCmsToast('File backup JSON berhasil diunduh!');
}

function importDataJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.outlets) {
        AMANDA_OUTLETS = data.outlets;
        saveStoredData('amanda_outlets', AMANDA_OUTLETS);
      }
      if (data.promos) {
        AMANDA_PROMOS = data.promos;
        saveStoredData('amanda_promos', AMANDA_PROMOS);
      }
      if (data.pricelists) {
        AMANDA_PRICELISTS = data.pricelists;
        saveStoredData('amanda_pricelists', AMANDA_PRICELISTS);
      }
      if (data.products) {
        AMANDA_PRODUCTS = data.products;
        saveStoredData('amanda_products', AMANDA_PRODUCTS);
      }
      if (data.ticker) {
        AMANDA_TICKER = data.ticker;
        saveStoredData('amanda_ticker', AMANDA_TICKER);
      }

      renderDashboard();
      renderPromosManager();
      renderProductsManager();
      renderOutletsManager();
      renderTickerManager();

      showCmsToast('Data berhasil dipulihkan dari file backup!');
    } catch (err) {
      alert('Format file JSON tidak valid.');
    }
  };
  reader.readAsText(file);
}

function confirmResetDefault() {
  if (confirm('Peringatan: Semua perubahan khusus akan dihapus dan dikembalikan ke data default resmi Balikpapan. Lanjutkan?')) {
    resetAmandaDataToDefault();
    renderDashboard();
    renderPromosManager();
    renderProductsManager();
    renderOutletsManager();
    renderTickerManager();
    showCmsToast('Semua data berhasil direset ke pengaturan awal!');
  }
}

// ===================================================================
// MODAL & TOAST HELPERS
// ===================================================================
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

function closeModalOnOverlay(e, modalId) {
  if (e.target.id === modalId) {
    closeModal(modalId);
  }
}

function showCmsToast(message, title = 'Sukses') {
  const toast = document.getElementById('cms-toast');
  const titleElem = document.getElementById('cms-toast-title');
  const msgElem = document.getElementById('cms-toast-msg');

  if (toast && msgElem) {
    msgElem.textContent = message;
    if (titleElem) titleElem.textContent = title;

    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');

    if (window.cmsToastTimeout) clearTimeout(window.cmsToastTimeout);
    window.cmsToastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}

// ===================================================================
// RENTAL & SUBSCRIPTION MANAGEMENT
// ===================================================================
function renderSubscriptionManager() {
  if (typeof getRentalSubscription !== 'function') return;

  const sub = getRentalSubscription();
  const days = calculateRemainingDays ? calculateRemainingDays(sub.expiresAt) : 30;
  const isExpired = days <= 0 || sub.status !== 'ACTIVE';

  // 1. Update Topbar & Sidebar Badges
  const topbarSubText = document.getElementById('topbar-sub-text');
  const topbarSubPill = document.getElementById('topbar-sub-pill');
  const sidebarSubBadge = document.getElementById('badge-sub-days');

  if (topbarSubText) {
    topbarSubText.textContent = isExpired ? 'Sewa Berakhir!' : `Sewa Aktif: ${days} Hari`;
  }
  if (sidebarSubBadge) {
    sidebarSubBadge.textContent = `${days}h`;
    sidebarSubBadge.style.background = isExpired ? '#c0392b' : (days <= 7 ? '#e67e22' : 'var(--ch-gold)');
  }
  if (topbarSubPill) {
    const dot = topbarSubPill.querySelector('.sub-dot');
    if (dot) {
      dot.className = 'sub-dot ' + (isExpired ? 'danger' : (days <= 7 ? 'warning' : ''));
    }
  }

  // 2. Update Subscription Status Card
  const cardDot = document.getElementById('sub-card-dot');
  const cardPlanTag = document.getElementById('sub-card-plan-tag');
  const cardPlanName = document.getElementById('sub-card-plan-name');
  const cardStatusBadge = document.getElementById('sub-card-status-badge');
  const cardStartDate = document.getElementById('sub-card-start-date');
  const cardExpiryDate = document.getElementById('sub-card-expiry-date');
  const cardRemainingDays = document.getElementById('sub-card-remaining-days');
  const cardDomain = document.getElementById('sub-card-domain');
  const progressPercent = document.getElementById('sub-progress-percent');
  const progressFill = document.getElementById('sub-progress-fill');

  if (cardPlanName) cardPlanName.textContent = sub.planName || 'Paket Usaha Amanda';
  if (cardPlanTag) {
    const isYearly = sub.planId && (sub.planId.includes('12m') || sub.planId.includes('24m') || sub.planId.includes('year') || (sub.planName && sub.planName.toLowerCase().includes('tahun')));
    cardPlanTag.textContent = isYearly ? '⭐ PAKET TAHUNAN (HEMAT)' : '🗓️ PAKET BULANAN (FLEKSIBEL)';
  }
  if (cardStartDate) cardStartDate.textContent = sub.startDate ? formatAdminDate(sub.startDate) : '-';
  if (cardExpiryDate) cardExpiryDate.textContent = sub.expiresAt ? formatAdminDate(sub.expiresAt) : '-';
  if (cardRemainingDays) {
    cardRemainingDays.textContent = isExpired ? '0 Hari (Kadaluarsa)' : `${days} Hari`;
    cardRemainingDays.style.color = isExpired ? '#c0392b' : (days <= 7 ? '#e67e22' : 'var(--ch-gold-dark)');
  }
  if (cardDomain) cardDomain.textContent = sub.tenantDomain || 'amandaborneo.id';

  if (cardDot) {
    cardDot.className = 'sub-status-dot ' + (isExpired ? 'expired' : 'active');
  }
  if (cardStatusBadge) {
    cardStatusBadge.className = isExpired ? 'badge-status-expired' : 'badge-status-active';
    cardStatusBadge.innerHTML = isExpired 
      ? '<i class="fa-solid fa-circle-exclamation"></i> KADALUARSA / PERLU PERPANJANG' 
      : '<i class="fa-solid fa-shield-check"></i> AKTIF & BERJALAN';
  }

  // Calculate Progress Percent
  if (progressPercent && progressFill) {
    const totalEstDays = sub.planId && sub.planId.includes('12m') ? 365 : (sub.planId && sub.planId.includes('6m') ? 180 : 30);
    const pct = isExpired ? 0 : Math.max(5, Math.min(100, Math.round((days / totalEstDays) * 100)));
    progressPercent.textContent = isExpired ? 'Layanan berakhir' : `${pct}% sisa masa sewa (${days} hari)`;
    progressFill.style.width = `${pct}%`;
    progressFill.style.background = isExpired ? '#c0392b' : (pct <= 25 ? '#e67e22' : 'linear-gradient(90deg, var(--ch-olive), var(--ch-gold))');
  }

  // 3. Render Invoices History Table
  renderInvoicesTable();
}

function renderInvoicesTable() {
  const tbody = document.getElementById('cms-invoices-tbody');
  if (!tbody || typeof getInvoiceHistory !== 'function') return;

  const invoices = getInvoiceHistory();

  if (!invoices || invoices.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">
          <i class="fa-solid fa-receipt" style="font-size: 28px; color: var(--ch-sand-border); display: block; margin-bottom: 8px;"></i>
          Belum ada riwayat tagihan invoice. <a href="billing.html" style="color: var(--ch-olive); font-weight: 700;">Buat pesanan sewa sekarang</a>.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = invoices.map(inv => {
    const isPaid = inv.status === 'PAID';
    return `
      <tr>
        <td>
          <span class="inv-id-tag">${inv.id}</span>
        </td>
        <td style="color: var(--text-muted); font-size: 12.5px;">
          ${formatAdminDate(inv.createdAt)}
        </td>
        <td>
          <strong>${inv.planName || 'Sewa Sistem'}</strong>
          <div style="font-size: 11px; color: var(--text-muted);">+${inv.durationMonths || 1} Bulan</div>
        </td>
        <td style="font-weight: 700; color: var(--text-main);">
          ${formatAdminRupiah(inv.totalAmount || inv.subtotal || 0)}
        </td>
        <td style="font-size: 12px; color: var(--text-muted);">
          ${inv.paymentMethodName ? inv.paymentMethodName.split('(')[0].trim() : 'Transfer'}
        </td>
        <td>
          <span class="inv-status-pill-table ${isPaid ? 'paid' : 'pending'}">
            <i class="fa-solid ${isPaid ? 'fa-circle-check' : 'fa-clock'}"></i>
            ${isPaid ? 'LUNAS' : 'PENDING'}
          </span>
        </td>
        <td style="text-align: right;">
          <a href="invoice.html?id=${encodeURIComponent(inv.id)}" target="_blank" class="btn-table-action" title="Lihat & Cetak Invoice">
            <i class="fa-solid fa-receipt"></i> Buka Invoice
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function formatAdminRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatAdminDate(dateStr) {
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


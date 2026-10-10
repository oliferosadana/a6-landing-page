// ===================================================================
// AMANDA BROWNIES BALIKPAPAN - CMS DASHBOARD JAVASCRIPT
// Handles CRUD for Promos (4:5), Products, Outlets, Ticker & LocalStorage
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();
  renderPromosManager();
  renderProductsManager();
  renderOutletsManager();
  renderOutletCategoriesManager();
  renderCsManager();
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
      renderOutletCategoriesManager();
      renderCsManager();
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
    renderOutletCategoriesManager();
    renderCsManager();
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
    'outlet-categories': 'Manajemen Kategori & Wilayah Outlet',
    'cs': 'Layanan CS & Analisis Data Pelanggan',
    'ticker': 'Pengumuman Running Promo Ticker',
    'settings': 'Cadangan, Impor & Reset Data',
    'security': 'Vault Kunci API & Keamanan Database'
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
  if (tabName === 'outlet-categories') renderOutletCategoriesManager();
  if (tabName === 'cs') renderCsManager();
  if (tabName === 'ticker') renderTickerManager();
  if (tabName === 'security') renderSecurityVault();
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
  const badgeOutletCat = document.getElementById('badge-outlet-cat-count');
  if (badgeOutletCat && typeof AMANDA_OUTLET_CATEGORIES !== 'undefined') {
    badgeOutletCat.textContent = AMANDA_OUTLET_CATEGORIES.length;
  }
  const badgeCs = document.getElementById('badge-cs-count');
  if (badgeCs) {
    const csList = typeof getCsInquiries === 'function' ? getCsInquiries() : (typeof AMANDA_CS_INQUIRIES !== 'undefined' ? AMANDA_CS_INQUIRIES : []);
    const newCount = csList.filter(c => c.status === 'NEW').length;
    badgeCs.textContent = newCount;
    badgeCs.style.display = newCount > 0 ? 'inline-block' : 'none';
  }

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
          <button class="btn-del-sm" onclick="deletePriceList('${p.id}')" title="Hapus"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}

function editPriceList(id) {
  const item = AMANDA_PRICELISTS.find(p => p.id === id);
  if (item) openPriceListModal(item);
}

function deletePriceList(id) {
  if (confirm('Apakah Anda yakin ingin menghapus poster price list ini?')) {
    AMANDA_PRICELISTS = AMANDA_PRICELISTS.filter(p => p.id !== id);
    saveStoredData('amanda_pricelists', AMANDA_PRICELISTS);
    renderPriceListsManager();
    showCmsToast('Poster price list berhasil dihapus!');
  }
}

function openPriceListModal(item = null) {
  const modal = document.getElementById('pricelist-modal');
  const form = document.getElementById('pricelist-form');
  const titleElem = document.getElementById('pricelist-modal-title');
  if (!modal || !form) return;

  const fileInput = document.getElementById('pricelist-form-file');
  if (fileInput) fileInput.value = '';

  form.reset();

  if (item) {
    if (titleElem) titleElem.textContent = 'Edit Poster Price List';
    document.getElementById('pricelist-form-id').value = item.id;
    document.getElementById('pricelist-form-title').value = item.title;
    document.getElementById('pricelist-form-badge').value = item.badge || '';
    document.getElementById('pricelist-form-image').value = item.image;
    document.getElementById('pricelist-form-caption').value = item.caption || '';
    previewPriceListImage(item.image);
  } else {
    if (titleElem) titleElem.textContent = 'Tambah Poster Price List Baru';
    document.getElementById('pricelist-form-id').value = '';
    document.getElementById('pricelist-form-title').value = '';
    document.getElementById('pricelist-form-badge').value = 'Price List Brownies';
    document.getElementById('pricelist-form-image').value = 'assets/amanda_pricelist_poster.jpg';
    document.getElementById('pricelist-form-caption').value = 'Daftar Harga Resmi Amanda Brownies Kalimantan';
    previewPriceListImage('assets/amanda_pricelist_poster.jpg');
  }

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

  if (id) {
    const idx = AMANDA_PRICELISTS.findIndex(p => p.id === id);
    if (idx !== -1) {
      AMANDA_PRICELISTS[idx] = { ...AMANDA_PRICELISTS[idx], title, badge, image, caption };
    }
  } else {
    AMANDA_PRICELISTS.push({
      id: 'price-' + Date.now(),
      title,
      badge,
      image,
      caption
    });
  }

  saveStoredData('amanda_pricelists', AMANDA_PRICELISTS);
  closeModal('pricelist-modal');
  renderPriceListsManager();
  showCmsToast('Poster price list berhasil disimpan!');
}

// ==================== IMAGE UPLOAD HELPER (FILE FROM DEVICE / SMARTPHONE) ====================
function handleImageFileUpload(event, targetInputId, targetPreviewId, maxDim = 960) {
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

      // Export as optimized JPEG for crisp display and compact storage (~60KB-100KB)
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.80);

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
    if (typeof pushToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
      pushToSupabase('promos', { id: id }, 'delete');
    }
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
    if (typeof pushToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
      pushToSupabase('products', { id: id }, 'delete');
    }
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
                <button type="button" class="btn-del-mini-booth" onclick="deleteSingleBooth('${o.id}', '${b.id}')" title="Hapus Booth Ini"><i class="fa-solid fa-xmark"></i></button>
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
    populateOutletFormCitySelect(outlet.city);
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
    populateOutletFormCitySelect(AMANDA_OUTLET_CATEGORIES[0]?.name || 'Balikpapan Selatan');
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
    if (typeof pushToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
      pushToSupabase('outlets', { id: id }, 'delete');
    }
    renderOutletsManager();
    renderDashboard();
    showCmsToast('Data outlet berhasil dihapus!');
  }
}

function deleteSingleBooth(outletId, boothId) {
  const outlet = AMANDA_OUTLETS.find(o => o.id === outletId);
  if (!outlet) return;
  const booth = (outlet.booths || []).find(b => b.id === boothId);
  const bName = booth ? booth.name : 'booth ini';
  if (confirm(`Apakah Anda yakin ingin menghapus "${bName}" dari cabang ${outlet.name}?`)) {
    outlet.booths = (outlet.booths || []).filter(b => b.id !== boothId);
    saveStoredData('amanda_outlets', AMANDA_OUTLETS);
    if (typeof pushToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
      pushToSupabase('outlets', AMANDA_OUTLETS);
    }
    renderOutletsManager();
    showCmsToast(`Titik booth "${bName}" berhasil dihapus!`);
  }
}

function saveOutletForm(e) {
  e.preventDefault();
  const id = document.getElementById('outlet-form-id').value;
  const name = document.getElementById('outlet-form-name').value.trim() || 'Cabang Amanda';
  const city = document.getElementById('outlet-form-city').value || 'Balikpapan';
  const hours = document.getElementById('outlet-form-hours').value.trim() || '07.00 - 22.00 WITA';
  let wa = document.getElementById('outlet-form-wa').value.trim().replace(/[^0-9]/g, '');
  if (!wa) wa = '6281241075981';
  const phone = document.getElementById('outlet-form-phone').value.trim() || wa;
  const address = document.getElementById('outlet-form-address').value.trim() || 'Kota Balikpapan';
  const image = document.getElementById('outlet-form-image').value.trim() || 'assets/outlet_mt_haryono.jpg';
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
  renderOutletCategoriesManager();
  renderDashboard();
  showCmsToast('Data cabang & nomor WA serta link Maps booth berhasil disimpan!');
}

function populateOutletFormCitySelect(selectedCity = '') {
  const select = document.getElementById('outlet-form-city');
  if (!select) return;

  const categories = (typeof AMANDA_OUTLET_CATEGORIES !== 'undefined' && AMANDA_OUTLET_CATEGORIES.length > 0)
    ? AMANDA_OUTLET_CATEGORIES
    : DEFAULT_OUTLET_CATEGORIES;

  select.innerHTML = categories.map(c => `
    <option value="${c.name}" ${selectedCity === c.name ? 'selected' : ''}>${c.name} (${c.region || 'Kota Balikpapan'})</option>
  `).join('');
}

// ===================================================================
// 3B. OUTLET CATEGORIES / WILAYAH MANAGEMENT
// ===================================================================
function renderOutletCategoriesManager(filterQuery = '') {
  const grid = document.getElementById('outlet-categories-grid');
  if (!grid || typeof AMANDA_OUTLET_CATEGORIES === 'undefined') return;

  const query = filterQuery.toLowerCase().trim();
  let categories = AMANDA_OUTLET_CATEGORIES;
  if (query) {
    categories = categories.filter(c => 
      c.name.toLowerCase().includes(query) || 
      (c.region && c.region.toLowerCase().includes(query)) ||
      (c.description && c.description.toLowerCase().includes(query)) ||
      (c.slug && c.slug.toLowerCase().includes(query))
    );
  }

  // Update Stats
  const totalCats = AMANDA_OUTLET_CATEGORIES.length;
  const activeCats = AMANDA_OUTLET_CATEGORIES.filter(c => c.status !== 'inactive').length;
  const connectedOutletsCount = AMANDA_OUTLETS.length;

  const statTotal = document.getElementById('stat-total-outlet-cats');
  const statActive = document.getElementById('stat-active-outlet-cats');
  const statOutlets = document.getElementById('stat-cats-connected-outlets');
  if (statTotal) statTotal.textContent = totalCats;
  if (statActive) statActive.textContent = activeCats;
  if (statOutlets) statOutlets.textContent = connectedOutletsCount;

  const badgeOutletCat = document.getElementById('badge-outlet-cat-count');
  if (badgeOutletCat) badgeOutletCat.textContent = totalCats;

  if (categories.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: #fff; border: 1px dashed var(--ch-sand-border); border-radius: var(--radius-lg);">
        <i class="fa-solid fa-map-location-dot" style="font-size: 36px; color: var(--ch-gold); margin-bottom: 12px; display: block;"></i>
        <h4 style="font-size: 16px; margin-bottom: 6px;">Tidak ada kategori wilayah yang cocok</h4>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Klik tombol "+ Tambah Kategori Wilayah" di atas untuk menambahkan zona wilayah baru.</p>
        <button class="btn-primary" onclick="openOutletCategoryModal()"><i class="fa-solid fa-plus"></i> Tambah Kategori Wilayah</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = categories.map(cat => {
    // Find connected outlets
    const connected = AMANDA_OUTLETS.filter(o => o.city === cat.name || o.region === cat.name);
    const colorClass = cat.badgeColor || 'olive';
    const isActive = cat.status !== 'inactive';

    const connectedPills = connected.length > 0 ? `
      <div class="cat-connected-outlets">
        <span class="cat-connected-title"><i class="fa-solid fa-store"></i> ${connected.length} Cabang Terhubung:</span>
        <div class="cat-connected-tags">
          ${connected.map(o => `
            <span class="cat-outlet-tag" title="${o.address}">
              <i class="fa-solid fa-circle-check" style="color: #25d366; font-size: 8px;"></i> ${o.name}
            </span>
          `).join('')}
        </div>
      </div>
    ` : `
      <div class="cat-connected-outlets empty">
        <span style="font-size: 11.5px; color: var(--text-dim); font-style: italic;"><i class="fa-regular fa-circle-dot"></i> Belum ada cabang terdaftar di wilayah ini.</span>
      </div>
    `;

    return `
      <div class="cms-category-card ${isActive ? '' : 'inactive'}">
        <div class="cat-card-header">
          <div class="cat-icon-badge ${colorClass}">
            <i class="${cat.icon || 'fa-solid fa-location-dot'}"></i>
          </div>
          <div class="cat-title-wrap">
            <div class="cat-name-row">
              <h4 class="cat-name font-serif">${cat.name}</h4>
              <span class="cat-status-pill ${isActive ? 'active' : 'inactive'}">
                ${isActive ? '<i class="fa-solid fa-circle"></i> Aktif' : '<i class="fa-regular fa-circle"></i> Nonaktif'}
              </span>
            </div>
            <span class="cat-region"><i class="fa-solid fa-map"></i> ${cat.region || 'Kota Balikpapan'}</span>
          </div>
        </div>

        <div class="cat-card-body">
          <div class="cat-slug-badge">
            <i class="fa-solid fa-tag"></i> <code>slug: ${cat.slug || cat.id}</code>
            <span class="cat-order-tag" title="Urutan Tampilan">Urutan #${cat.sortOrder || 1}</span>
          </div>

          <p class="cat-description">${cat.description || 'Tidak ada deskripsi wilayah tambahan.'}</p>

          ${connectedPills}
        </div>

        <div class="cat-card-footer">
          <button class="btn-edit-sm" onclick="editOutletCategory('${cat.id}')">
            <i class="fa-solid fa-pen-to-square"></i> Edit Wilayah
          </button>
          <button class="btn-del-sm" onclick="deleteOutletCategory('${cat.id}')" title="Hapus Kategori Wilayah">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterOutletCategoriesList(query) {
  renderOutletCategoriesManager(query);
}

function openOutletCategoryModal(category = null) {
  const modal = document.getElementById('outlet-category-modal');
  const titleElem = document.getElementById('outlet-category-modal-title');
  const form = document.getElementById('outlet-category-form');
  if (!modal || !form) return;

  form.reset();
  if (category) {
    titleElem.textContent = 'Edit Kategori Wilayah: ' + category.name;
    document.getElementById('category-form-id').value = category.id;
    document.getElementById('category-form-name').value = category.name;
    document.getElementById('category-form-region').value = category.region || 'Kota Balikpapan';
    document.getElementById('category-form-slug').value = category.slug || category.id;
    document.getElementById('category-form-icon').value = category.icon || 'fa-solid fa-location-dot';
    document.getElementById('category-form-color').value = category.badgeColor || 'olive';
    document.getElementById('category-form-sort').value = category.sortOrder || 1;
    document.getElementById('category-form-status').value = category.status || 'active';
    document.getElementById('category-form-desc').value = category.description || '';
  } else {
    titleElem.textContent = 'Tambah Kategori Wilayah Baru';
    document.getElementById('category-form-id').value = '';
    document.getElementById('category-form-region').value = 'Kota Balikpapan';
    document.getElementById('category-form-icon').value = 'fa-solid fa-location-dot';
    document.getElementById('category-form-color').value = 'olive';
    document.getElementById('category-form-sort').value = (AMANDA_OUTLET_CATEGORIES.length + 1);
    document.getElementById('category-form-status').value = 'active';
    document.getElementById('category-form-desc').value = '';
  }

  modal.classList.add('active');
}

function autoGenerateCategorySlug(val) {
  const slugInput = document.getElementById('category-form-slug');
  const idInput = document.getElementById('category-form-id');
  if (!slugInput || (idInput && idInput.value)) return;
  const slug = val.toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  slugInput.value = slug;
}

function editOutletCategory(id) {
  const cat = AMANDA_OUTLET_CATEGORIES.find(c => c.id === id);
  if (cat) openOutletCategoryModal(cat);
}

function deleteOutletCategory(id) {
  const cat = AMANDA_OUTLET_CATEGORIES.find(c => c.id === id);
  if (!cat) return;

  const connectedOutlets = AMANDA_OUTLETS.filter(o => o.city === cat.name || o.region === cat.name);
  if (connectedOutlets.length > 0) {
    const outletNames = connectedOutlets.map(o => o.name).join(', ');
    if (!confirm(`Peringatan: Terdapat ${connectedOutlets.length} outlet cabang (${outletNames}) yang terhubung dengan wilayah "${cat.name}".\n\nApakah Anda tetap yakin ingin menghapus kategori wilayah ini?`)) {
      return;
    }
  } else {
    if (!confirm(`Hapus kategori wilayah "${cat.name}"?`)) {
      return;
    }
  }

  AMANDA_OUTLET_CATEGORIES = AMANDA_OUTLET_CATEGORIES.filter(c => c.id !== id);
  saveStoredData('amanda_outlet_categories', AMANDA_OUTLET_CATEGORIES);
  if (typeof pushToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
    pushToSupabase('outlet_categories', { id: id }, 'delete');
  }
  renderOutletCategoriesManager();
  renderDashboard();
  showCmsToast(`Kategori wilayah "${cat.name}" berhasil dihapus!`);
}

function saveOutletCategoryForm(e) {
  e.preventDefault();
  const id = document.getElementById('category-form-id').value;
  const name = document.getElementById('category-form-name').value.trim();
  const region = document.getElementById('category-form-region').value.trim() || 'Kota Balikpapan';
  const slug = document.getElementById('category-form-slug').value.trim() || (name.toLowerCase().replace(/\s+/g, '-'));
  const icon = document.getElementById('category-form-icon').value.trim() || 'fa-solid fa-location-dot';
  const badgeColor = document.getElementById('category-form-color').value || 'olive';
  const sortOrder = parseInt(document.getElementById('category-form-sort').value, 10) || 1;
  const status = document.getElementById('category-form-status').value || 'active';
  const desc = document.getElementById('category-form-desc').value.trim();

  if (id) {
    const idx = AMANDA_OUTLET_CATEGORIES.findIndex(c => c.id === id);
    if (idx !== -1) {
      AMANDA_OUTLET_CATEGORIES[idx] = {
        ...AMANDA_OUTLET_CATEGORIES[idx],
        name, region, slug, icon, badgeColor, sortOrder, status, description: desc
      };
    }
  } else {
    const newCat = {
      id: 'cat-' + (slug || Date.now()),
      slug: slug || ('cat-' + Date.now()),
      name,
      region,
      icon,
      badgeColor,
      sortOrder,
      status,
      description: desc
    };
    AMANDA_OUTLET_CATEGORIES.push(newCat);
  }

  // Sort by sortOrder
  AMANDA_OUTLET_CATEGORIES.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));

  saveStoredData('amanda_outlet_categories', AMANDA_OUTLET_CATEGORIES);
  closeModal('outlet-category-modal');
  renderOutletCategoriesManager();
  renderDashboard();
  showCmsToast('Kategori wilayah outlet berhasil disimpan & tersinkronisasi!');
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
    const deletedItem = AMANDA_TICKER[index];
    AMANDA_TICKER.splice(index, 1);
    saveStoredData('amanda_ticker', AMANDA_TICKER);
    if (deletedItem && deletedItem.id && typeof pushToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
      pushToSupabase('ticker', { id: deletedItem.id }, 'delete');
    }
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
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function closeModalOnOverlay(e, modalId) {
  if (e.target.id === modalId || e.target.classList.contains('cms-modal-overlay')) {
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
// SECURITY VAULT & API CREDENTIALS CONTROLLER
// ===================================================================
function renderSecurityVault() {
  const vault = typeof getSecurityVaultData === 'function' ? getSecurityVaultData() : null;
  if (!vault) return;

  const urlInput = document.getElementById('vault-supabase-url');
  const anonKeyInput = document.getElementById('vault-supabase-anon-key');
  const secretKeyInput = document.getElementById('vault-supabase-secret-key');
  const cfTokenInput = document.getElementById('vault-cf-token');
  const webhookInput = document.getElementById('vault-webhook-secret');
  const lastUpdatedElem = document.getElementById('vault-last-updated');
  const statusLabel = document.getElementById('vault-status-label');

  if (urlInput) urlInput.value = vault.supabaseUrl || '';
  if (anonKeyInput) anonKeyInput.value = vault.supabaseAnonKey || '';
  if (secretKeyInput) secretKeyInput.value = vault.supabaseSecretKey || '';
  if (cfTokenInput) cfTokenInput.value = vault.cloudflareToken || '';
  if (webhookInput) webhookInput.value = vault.webhookSecret || '';

  // Load WAAS Master Platform Config
  const waasRaw = localStorage.getItem('amanda_waas_config');
  let waasConfig = {
    waasUrl: 'https://zomkdefqivvbtxqzavpz.supabase.co',
    waasKey: 'sb_publishable_xG2a15CPnDELITqWHdodiQ__PnNZX8-',
    tenantId: 'tenant_amanda',
    subdomain: 'amanda'
  };
  if (waasRaw) {
    try {
      const parsed = JSON.parse(waasRaw);
      waasConfig = Object.assign(waasConfig, parsed);
    } catch (e) {}
  }

  const waasUrlInput = document.getElementById('vault-waas-url');
  const waasKeyInput = document.getElementById('vault-waas-key');
  const waasTenantInput = document.getElementById('vault-waas-tenant-id');
  const waasSubdomainInput = document.getElementById('vault-waas-subdomain');

  if (waasUrlInput) waasUrlInput.value = waasConfig.waasUrl || '';
  if (waasKeyInput) waasKeyInput.value = waasConfig.waasKey || '';
  if (waasTenantInput) waasTenantInput.value = waasConfig.tenantId || '';
  if (waasSubdomainInput) waasSubdomainInput.value = waasConfig.subdomain || '';

  if (lastUpdatedElem) {
    lastUpdatedElem.textContent = vault.lastUpdated 
      ? `Terakhir diperbarui: ${new Date(vault.lastUpdated).toLocaleString('id-ID')}`
      : 'Belum pernah disinkronkan.';
  }

  if (statusLabel) {
    const isConn = typeof isSupabaseActive === 'function' && isSupabaseActive();
    statusLabel.textContent = isConn ? 'Tersambung Aktif' : 'Menunggu Konfigurasi';
    statusLabel.style.color = isConn ? 'var(--accent-green)' : 'var(--accent-red)';
  }

  // Populate Admin User Form
  const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
  const adminNameInput = document.getElementById('admin-user-name');
  const adminEmailInput = document.getElementById('admin-user-email');
  if (session && session.user) {
    if (adminNameInput) adminNameInput.value = session.user.name || 'Admin Amanda Balikpapan';
    if (adminEmailInput) adminEmailInput.value = session.user.email || 'admin@amanda.com';
  }
}

function refreshSecurityVaultUI() {
  renderSecurityVault();
  showCmsToast('Data Vault Keamanan dimuat ulang.', 'Vault Refreshed');
}

function toggleVaultInputMask(inputId, btnElement) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btnElement) btnElement.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    if (btnElement) btnElement.innerHTML = '<i class="fa-regular fa-eye"></i>';
  }
}

async function handleSaveVaultCredentials(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-save-vault');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Menyimpan ke Database...';
  }

  const vaultData = {
    supabaseUrl: document.getElementById('vault-supabase-url').value,
    supabaseAnonKey: document.getElementById('vault-supabase-anon-key').value,
    supabaseSecretKey: document.getElementById('vault-supabase-secret-key').value,
    cloudflareToken: document.getElementById('vault-cf-token').value,
    webhookSecret: document.getElementById('vault-webhook-secret').value
  };

  const waasConfigData = {
    waasUrl: (document.getElementById('vault-waas-url')?.value || '').trim() || 'https://zomkdefqivvbtxqzavpz.supabase.co',
    waasKey: (document.getElementById('vault-waas-key')?.value || '').trim() || 'sb_publishable_xG2a15CPnDELITqWHdodiQ__PnNZX8-',
    tenantId: (document.getElementById('vault-waas-tenant-id')?.value || '').trim() || 'tenant_amanda',
    subdomain: (document.getElementById('vault-waas-subdomain')?.value || '').trim() || 'amanda'
  };

  localStorage.setItem('amanda_waas_config', JSON.stringify(waasConfigData));

  if (typeof window.refreshWaasStatusEnforcer === 'function') {
    window.refreshWaasStatusEnforcer();
  }

  if (typeof saveSecurityVaultData === 'function') {
    const res = await saveSecurityVaultData(vaultData, true);
    if (res.success) {
      showCmsToast('Kredensial Vault & Integrasi WAAS berhasil disimpan!', 'Vault Tersimpan');
    } else {
      showCmsToast('Gagal menyimpan: ' + res.message, 'Error Vault');
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Simpan Kredensial & Sinkronkan ke Database';
  }
  renderSecurityVault();
}

async function testCloudVaultConnection() {
  const url = document.getElementById('vault-supabase-url').value;
  const anonKey = document.getElementById('vault-supabase-anon-key').value;
  const btn = document.getElementById('btn-test-vault');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Menguji...';
  }

  if (typeof testSupabaseConnection === 'function') {
    const res = await testSupabaseConnection(url, anonKey);
    if (res.success) {
      showCmsToast(res.message, 'Koneksi Berhasil');
    } else {
      showCmsToast('Koneksi Gagal: ' + res.message, 'Uji Koneksi');
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-bolt"></i> Uji Koneksi Database';
  }
  renderSecurityVault();
}

async function handleUpdateAdminCredentials(event) {
  event.preventDefault();
  const session = typeof getAuthSession === 'function' ? getAuthSession() : null;
  const userId = session && session.user ? session.user.id : 'usr-admin-bpn';
  const name = document.getElementById('admin-user-name').value;
  const email = document.getElementById('admin-user-email').value;
  const pass = document.getElementById('admin-user-password').value;

  if (typeof updateAdminCredentials === 'function') {
    const res = await updateAdminCredentials(userId, email, pass, name);
    if (res.success) {
      document.getElementById('admin-user-password').value = '';
      showCmsToast('Kredensial Admin CMS berhasil diperbarui dengan enkripsi SHA-256!', 'Sukses');
    } else {
      showCmsToast('Gagal: ' + res.message, 'Error');
    }
  }
}

// ===================================================================
// CUSTOMER SERVICE (CS) MANAGEMENT & DATA ANALYTICS
// ===================================================================
const CS_CATEGORY_LABELS = {
  'catering': { label: 'Pesanan Katering', icon: 'fa-solid fa-utensils', badgeColor: '#3b82f6' },
  'stock': { label: 'Tanya Stok Outlet', icon: 'fa-solid fa-boxes-stacked', badgeColor: '#8b5cf6' },
  'complaint': { label: 'Komplain / Pengaduan', icon: 'fa-solid fa-triangle-exclamation', badgeColor: '#ef4444' },
  'promo': { label: 'Klaim Promo', icon: 'fa-solid fa-tags', badgeColor: '#f59e0b' },
  'partnership': { label: 'Kerjasama / B2B', icon: 'fa-solid fa-handshake', badgeColor: '#10b981' },
  'other': { label: 'Lainnya', icon: 'fa-solid fa-comment-dots', badgeColor: '#6b7280' }
};

function renderCsManager() {
  const tbody = document.getElementById('cs-inquiries-tbody');
  const emptyState = document.getElementById('cs-empty-state');
  if (!tbody) return;

  const rawList = typeof getCsInquiries === 'function' ? getCsInquiries() : (typeof AMANDA_CS_INQUIRIES !== 'undefined' ? AMANDA_CS_INQUIRIES : []);
  const allInquiries = Array.isArray(rawList) ? rawList : [];

  // 1. Populate Outlet Filter Dropdown if needed
  const outletFilter = document.getElementById('cs-filter-outlet');
  if (outletFilter && outletFilter.options.length <= 1 && typeof AMANDA_OUTLETS !== 'undefined' && AMANDA_OUTLETS.length > 0) {
    const currentVal = outletFilter.value;
    outletFilter.innerHTML = '<option value="all">Semua Outlet Balikpapan</option>' +
      AMANDA_OUTLETS.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    outletFilter.value = currentVal;
  }

  // 2. Compute KPI Metrics
  const totalCount = allInquiries.length;
  const newCount = allInquiries.filter(i => i.status === 'NEW').length;
  const inProgressCount = allInquiries.filter(i => i.status === 'IN_PROGRESS').length;
  const resolvedCount = allInquiries.filter(i => i.status === 'RESOLVED').length;

  const ratingSum = allInquiries.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
  const avgRating = totalCount > 0 ? (ratingSum / totalCount).toFixed(1) : '5.0';

  // Update KPI counters
  const elTotal = document.getElementById('cs-stat-total');
  const elNew = document.getElementById('cs-stat-new');
  const elInProg = document.getElementById('cs-stat-inprogress');
  const elResolved = document.getElementById('cs-stat-resolved');
  const elRating = document.getElementById('cs-stat-rating');
  const elBadgeCount = document.getElementById('badge-cs-count');

  if (elTotal) elTotal.textContent = totalCount;
  if (elNew) elNew.textContent = newCount;
  if (elInProg) elInProg.textContent = inProgressCount;
  if (elResolved) elResolved.textContent = resolvedCount;
  if (elRating) elRating.textContent = avgRating + ' ★';
  if (elBadgeCount) {
    elBadgeCount.textContent = newCount;
    elBadgeCount.style.display = newCount > 0 ? 'inline-block' : 'none';
  }

  // 3. Filter Inquiries
  const filterOutlet = document.getElementById('cs-filter-outlet') ? document.getElementById('cs-filter-outlet').value : 'all';
  const filterCategory = document.getElementById('cs-filter-category') ? document.getElementById('cs-filter-category').value : 'all';
  const filterStatus = document.getElementById('cs-filter-status') ? document.getElementById('cs-filter-status').value : 'all';
  const searchKeyword = (document.getElementById('cs-search-input') ? document.getElementById('cs-search-input').value : '').toLowerCase().trim();

  const filtered = allInquiries.filter(item => {
    if (filterOutlet !== 'all' && item.outlet_id !== filterOutlet) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchKeyword) {
      const matchName = (item.name || '').toLowerCase().includes(searchKeyword);
      const matchPhone = (item.phone || '').toLowerCase().includes(searchKeyword);
      const matchId = (item.id || '').toLowerCase().includes(searchKeyword);
      const matchReceipt = (item.receipt_number || '').toLowerCase().includes(searchKeyword);
      const matchMsg = (item.message || '').toLowerCase().includes(searchKeyword);
      const matchOutlet = (item.outlet_name || '').toLowerCase().includes(searchKeyword);
      if (!matchName && !matchPhone && !matchId && !matchReceipt && !matchMsg && !matchOutlet) return false;
    }
    return true;
  });

  const tableCountBadge = document.getElementById('cs-table-count-badge');
  if (tableCountBadge) tableCountBadge.textContent = `${filtered.length} Data`;

  // 4. Render Table or Empty State
  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(item => {
    const catMeta = CS_CATEGORY_LABELS[item.category] || CS_CATEGORY_LABELS['other'];
    const dateObj = item.created_at ? new Date(item.created_at) : new Date();
    const dateFormatted = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WITA';
    
    // Rating Stars
    const ratingStars = '★'.repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)));

    // WhatsApp Direct Link
    const waReplyText = encodeURIComponent(
      `Halo Kak ${item.name},\n\nTerima kasih telah menghubungi Customer Service Amanda Brownies Balikpapan terkait tiket *#${item.id}*.\n\nKami siap membantu kendala / pesanan Kakak...`
    );
    const waLink = `https://wa.me/${item.phone}?text=${waReplyText}`;

    // Receipt Column with Multi-Image Support
    const imagesList = Array.isArray(item.receipt_images) && item.receipt_images.length > 0
      ? item.receipt_images
      : (item.receipt_image ? [item.receipt_image] : []);

    let receiptCell = '<span style="color: var(--text-dim); font-size: 12px;">-</span>';
    if (imagesList.length > 0) {
      const thumbHtml = imagesList.map((imgSrc, idx) => `
        <button type="button" onclick="openCsReceiptModal('${item.id}', ${idx})" title="Foto ${idx + 1} (Klik untuk perbesar)" style="background: none; border: 1px solid var(--border-sand); padding: 2px; border-radius: 6px; cursor: pointer;">
          <img src="${imgSrc}" alt="Foto ${idx + 1}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 4px; display: block;">
        </button>
      `).join('');

      receiptCell = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;">
            ${thumbHtml}
          </div>
          <span style="font-size: 10.5px; font-weight: 700; color: var(--primary-olive); cursor: pointer;" onclick="openCsReceiptModal('${item.id}', 0)">
            <i class="fa-solid fa-images"></i> ${imagesList.length} Foto Bukti
          </span>
        </div>
      `;
    } else if (item.receipt_number) {
      receiptCell = `<span style="font-size: 11.5px; font-weight: 600; color: var(--text-muted); background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">#${item.receipt_number}</span>`;
    }

    // Status Badge Color & Select
    let statusBadgeStyle = 'background: #fee2e2; color: #dc2626; border-color: #fca5a5;';
    if (item.status === 'IN_PROGRESS') {
      statusBadgeStyle = 'background: #fef3c7; color: #d97706; border-color: #fde68a;';
    } else if (item.status === 'RESOLVED') {
      statusBadgeStyle = 'background: #dcfce7; color: #16a34a; border-color: #86efac;';
    }

    return `
      <tr style="border-bottom: 1px solid var(--border-sand-light); font-size: 13px;">
        <td style="padding: 12px 16px; vertical-align: top;">
          <div style="font-weight: 700; color: var(--primary-olive); font-family: monospace; font-size: 13px;">#${item.id}</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">${dateFormatted}</div>
        </td>
        
        <td style="padding: 12px 16px; vertical-align: top;">
          <div style="font-weight: 700; color: var(--text-main);">${escapeHtml(item.name)}</div>
          <a href="${waLink}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #16a34a; font-weight: 600; text-decoration: none; margin-top: 2px;">
            <i class="fa-brands fa-whatsapp"></i> +${item.phone}
          </a>
        </td>

        <td style="padding: 12px 16px; vertical-align: top;">
          <div style="font-size: 12.5px; font-weight: 600; color: var(--text-main);">${escapeHtml(item.outlet_name || 'Amanda Balikpapan')}</div>
          ${item.receipt_number ? `<div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">No Struk: <strong>${escapeHtml(item.receipt_number)}</strong></div>` : ''}
        </td>

        <td style="padding: 12px 16px; vertical-align: top;">
          <span style="display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #fff; background: ${catMeta.badgeColor}; padding: 3px 8px; border-radius: 12px;">
            <i class="${catMeta.icon}"></i> ${catMeta.label}
          </span>
          <div style="color: #eab308; font-size: 12px; margin-top: 4px;" title="Rating: ${item.rating || 5} dari 5 Bintang">
            ${ratingStars} <span style="font-size: 11px; color: var(--text-dim); font-weight: 600;">(${item.rating || 5}/5)</span>
          </div>
        </td>

        <td style="padding: 12px 16px; vertical-align: top; max-width: 280px;">
          <div style="font-size: 12.5px; line-height: 1.5; color: var(--text-main); background: #fdfbf7; padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border-sand-light);">
            ${escapeHtml(item.message)}
          </div>
        </td>

        <td style="padding: 12px 16px; text-align: center; vertical-align: top;">
          ${receiptCell}
        </td>

        <td style="padding: 12px 16px; text-align: center; vertical-align: top;">
          <select onchange="changeCsStatus('${item.id}', this.value)" style="padding: 4px 8px; font-size: 11.5px; font-weight: 700; border-radius: 8px; border: 1px solid; cursor: pointer; ${statusBadgeStyle}">
            <option value="NEW" ${item.status === 'NEW' ? 'selected' : ''}>🔴 Baru</option>
            <option value="IN_PROGRESS" ${item.status === 'IN_PROGRESS' ? 'selected' : ''}>🟡 Diproses</option>
            <option value="RESOLVED" ${item.status === 'RESOLVED' ? 'selected' : ''}>🟢 Selesai</option>
          </select>
        </td>

        <td style="padding: 12px 16px; text-align: right; vertical-align: top;">
          <div style="display: inline-flex; gap: 6px;">
            <a href="${waLink}" target="_blank" class="btn-secondary-sm" style="color: #16a34a; border-color: #86efac; text-decoration: none; padding: 5px 9px;" title="Balas via WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <button type="button" class="btn-secondary-sm" onclick="deleteCsInquiry('${item.id}')" style="color: #dc2626; border-color: #fca5a5; padding: 5px 9px;" title="Hapus Tiket">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

let activeCsModalImages = [];
let activeCsModalIndex = 0;
let activeCsModalItem = null;
let isCsReceiptZoomed = false;

function toggleCsReceiptZoom() {
  const imgElem = document.getElementById('cs-modal-receipt-img');
  const hintElem = document.getElementById('cs-modal-zoom-hint');
  if (!imgElem) return;

  isCsReceiptZoomed = !isCsReceiptZoomed;
  if (isCsReceiptZoomed) {
    imgElem.style.transform = 'scale(1.85)';
    imgElem.style.cursor = 'zoom-out';
    imgElem.style.maxHeight = 'none';
    if (hintElem) hintElem.innerHTML = '<i class="fa-solid fa-magnifying-glass-minus"></i> Klik foto lagi untuk mengecilkan ke ukuran normal';
  } else {
    imgElem.style.transform = 'none';
    imgElem.style.cursor = 'zoom-in';
    imgElem.style.maxHeight = '460px';
    if (hintElem) hintElem.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i> Klik foto untuk memperbesar (Zoom In / Out)';
  }
}

function resetCsReceiptZoom() {
  isCsReceiptZoomed = false;
  const imgElem = document.getElementById('cs-modal-receipt-img');
  const hintElem = document.getElementById('cs-modal-zoom-hint');
  if (imgElem) {
    imgElem.style.transform = 'none';
    imgElem.style.cursor = 'zoom-in';
    imgElem.style.maxHeight = '460px';
  }
  if (hintElem) {
    hintElem.innerHTML = '<i class="fa-solid fa-magnifying-glass-plus"></i> Klik foto untuk memperbesar (Zoom In / Out)';
  }
}

function openCsReceiptModal(inquiryId, initialIndex = 0) {
  const rawList = typeof getCsInquiries === 'function' ? getCsInquiries() : (typeof AMANDA_CS_INQUIRIES !== 'undefined' ? AMANDA_CS_INQUIRIES : []);
  const item = rawList.find(i => i.id === inquiryId);
  if (!item) return;

  activeCsModalItem = item;
  activeCsModalImages = Array.isArray(item.receipt_images) && item.receipt_images.length > 0
    ? item.receipt_images
    : (item.receipt_image ? [item.receipt_image] : []);
  activeCsModalIndex = initialIndex >= 0 && initialIndex < activeCsModalImages.length ? initialIndex : 0;

  const titleEl = document.getElementById('cs-modal-ticket-title');
  const nameEl = document.getElementById('cs-modal-customer-name');
  const receiptNoEl = document.getElementById('cs-modal-receipt-no');
  const outletEl = document.getElementById('cs-modal-outlet-name');
  const waBtn = document.getElementById('cs-modal-wa-btn');

  if (titleEl) titleEl.textContent = `Bukti Lampiran Foto - #${item.id}`;
  if (nameEl) nameEl.textContent = item.name || '-';
  if (receiptNoEl) receiptNoEl.textContent = item.receipt_number || 'Tidak Ada Nomor Struk';
  if (outletEl) outletEl.textContent = item.outlet_name || 'Amanda Brownies';

  if (waBtn) {
    const waReplyText = encodeURIComponent(
      `Halo Kak ${item.name}, kami menindaklanjuti foto bukti / struk yang telah Kakak kirimkan pada tiket *#${item.id}*...`
    );
    waBtn.href = `https://wa.me/${item.phone}?text=${waReplyText}`;
  }

  resetCsReceiptZoom();
  updateCsReceiptModalView();
  openModal('cs-receipt-modal');
}

function selectCsModalImage(idx) {
  if (idx >= 0 && idx < activeCsModalImages.length) {
    activeCsModalIndex = idx;
    resetCsReceiptZoom();
    updateCsReceiptModalView();
  }
}

function updateCsReceiptModalView() {
  const imgElem = document.getElementById('cs-modal-receipt-img');
  const emptyElem = document.getElementById('cs-modal-receipt-empty');
  const downloadBtn = document.getElementById('cs-modal-download-btn');
  const galleryStrip = document.getElementById('cs-modal-gallery-strip');

  if (activeCsModalImages.length > 0) {
    const currentSrc = activeCsModalImages[activeCsModalIndex] || activeCsModalImages[0];
    imgElem.src = currentSrc;
    imgElem.style.display = 'block';
    emptyElem.style.display = 'none';
    downloadBtn.href = currentSrc;
    downloadBtn.download = `Bukti_${activeCsModalItem ? activeCsModalItem.id : 'foto'}_${activeCsModalIndex + 1}.jpg`;
    downloadBtn.style.display = 'inline-flex';

    if (galleryStrip) {
      if (activeCsModalImages.length > 1) {
        galleryStrip.innerHTML = activeCsModalImages.map((src, idx) => `
          <button type="button" onclick="selectCsModalImage(${idx})" style="border: 2px solid ${idx === activeCsModalIndex ? 'var(--primary-gold)' : 'rgba(255,255,255,0.3)'}; border-radius: 6px; padding: 2px; background: none; cursor: pointer; transform: ${idx === activeCsModalIndex ? 'scale(1.08)' : 'none'}; transition: all 0.15s;" title="Lihat Foto ${idx + 1}">
            <img src="${src}" alt="Thumb ${idx + 1}" style="width: 46px; height: 46px; object-fit: cover; border-radius: 4px; display: block;">
          </button>
        `).join('');
        galleryStrip.style.display = 'flex';
      } else {
        galleryStrip.innerHTML = '';
        galleryStrip.style.display = 'none';
      }
    }
  } else {
    imgElem.src = '';
    imgElem.style.display = 'none';
    emptyElem.style.display = 'block';
    downloadBtn.style.display = 'none';
    if (galleryStrip) {
      galleryStrip.innerHTML = '';
      galleryStrip.style.display = 'none';
    }
  }
}

async function changeCsStatus(inquiryId, newStatus) {
  if (typeof updateCsInquiryStatus === 'function') {
    updateCsInquiryStatus(inquiryId, newStatus);
    
    // Sync to Supabase Cloud if active
    if (typeof isSupabaseActive === 'function' && isSupabaseActive() && typeof supabaseClient !== 'undefined' && supabaseClient) {
      try {
        await supabaseClient.from('cs_inquiries').update({ status: newStatus }).eq('id', inquiryId);
      } catch (e) {
        console.warn('Supabase status update error:', e);
      }
    }
    
    showCmsToast(`Status tiket #${inquiryId} diperbarui menjadi ${newStatus}.`, 'Status Diperbarui');
    renderCsManager();
    renderDashboard();
  }
}

async function deleteCsInquiry(inquiryId) {
  if (!confirm(`Apakah Anda yakin ingin menghapus tiket #${inquiryId}? Tindakan ini tidak dapat dibatalkan.`)) return;

  const rawList = typeof getCsInquiries === 'function' ? getCsInquiries() : (typeof AMANDA_CS_INQUIRIES !== 'undefined' ? AMANDA_CS_INQUIRIES : []);
  const updatedList = rawList.filter(i => i.id !== inquiryId);

  if (typeof saveCsInquiries === 'function') {
    saveCsInquiries(updatedList, true);
  }

  // Delete from Supabase if connected
  if (typeof pushToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
    try {
      await pushToSupabase('cs_inquiries', inquiryId, 'delete');
    } catch (e) {
      console.warn('Supabase delete inquiry error:', e);
    }
  }

  showCmsToast(`Tiket #${inquiryId} berhasil dihapus.`, 'Tiket Dihapus');
  renderCsManager();
  renderDashboard();
}

// ===================================================================
// EXCEL / CSV EXPORT ENGINE FOR CS DATA ANALYTICS
// ===================================================================
function exportCsToExcel() {
  const rawList = typeof getCsInquiries === 'function' ? getCsInquiries() : (typeof AMANDA_CS_INQUIRIES !== 'undefined' ? AMANDA_CS_INQUIRIES : []);
  if (!rawList || rawList.length === 0) {
    alert('Belum ada data tiket CS untuk diekspor.');
    return;
  }

  // Prepare CSV Headers
  const headers = [
    'No Tiket',
    'Tanggal & Waktu (WITA)',
    'Nama Pelanggan',
    'Nomor WhatsApp',
    'Outlet Amanda',
    'Kategori Pengaduan',
    'No Struk Pembelian',
    'Ada Lampiran Foto Struk',
    'Rating Kepuasan (1-5)',
    'Pesan & Keterangan',
    'Status Tiket'
  ];

  // Map rows
  const rows = rawList.map(item => {
    const catMeta = CS_CATEGORY_LABELS[item.category] || CS_CATEGORY_LABELS['other'];
    const dateObj = item.created_at ? new Date(item.created_at) : new Date();
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    return [
      item.id || '',
      dateStr,
      item.name || '',
      '\'' + (item.phone || ''), // Leading apostrophe to preserve WhatsApp numbers as string in Excel
      item.outlet_name || 'Amanda Balikpapan',
      catMeta.label,
      item.receipt_number || '-',
      item.receipt_image ? 'YA (Foto Terlampir)' : 'TIDAK',
      item.rating || 5,
      (item.message || '').replace(/\r?\n/g, ' '),
      item.status || 'NEW'
    ];
  });

  // Build CSV String with UTF-8 BOM
  const csvContent = '\uFEFF' + [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(','))
  ].join('\r\n');

  // Trigger download as CSV/Excel compatible file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 10).replace(/-/g, '') + '_' + String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
  const filename = `Laporan_CS_Amanda_Balikpapan_${timestamp}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showCmsToast(`Laporan data CS berhasil diekspor ke format Excel (${filename})!`, 'Ekspor Selesai');
}

function escapeCsvCell(cell) {
  if (cell === null || cell === undefined) return '""';
  const str = String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}




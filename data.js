// ===================================================================
// DATA PRODUK, PROMO & OUTLET AMANDA BROWNIES KOTA BALIKPAPAN
// Terhubung dengan LocalStorage agar dapat dikelola via CMS
// ===================================================================

const DEFAULT_OUTLETS = [
  {
    id: "out-bpn-01",
    name: "Amanda Brownies Outlet MT Haryono (Pusat Balikpapan)",
    city: "Balikpapan Selatan",
    region: "Kota Balikpapan",
    image: "assets/outlet_mt_haryono.jpg",
    address: "Jl. MT Haryono No. 15, RT. 45, Kel. Damai, Balikpapan Selatan",
    phone: "(0542) 876-5432",
    wa: "6281322119988",
    hours: "07.30 - 21.30 WITA",
    mapsUrl: "https://maps.google.com/?q=Amanda+Brownies+MT+Haryono+Balikpapan",
    distance: "1.2 km",
    booths: [
      {
        id: "bth-01-a",
        name: "Booth Living Plaza Balikpapan",
        location: "Lantai Dasar (Depan Informa / ACE Hardware)",
        hours: "10.00 - 22.00 WITA",
        status: "Tersedia",
        wa: "6281322119988"
      },
      {
        id: "bth-01-b",
        name: "Booth SPBU MT Haryono Damai",
        location: "Rest Area & Convenience SPBU 64.761.02",
        hours: "08.00 - 21.00 WITA",
        status: "Tersedia",
        wa: "6281322119988"
      },
      {
        id: "bth-01-c",
        name: "Booth Bandara SAMS Sepinggan Gate 4",
        location: "Ruang Tunggu Keberangkatan Domestik",
        hours: "06.00 - 20.30 WITA",
        status: "Tersedia",
        wa: "6281322119988"
      },
      {
        id: "bth-01-d",
        name: "Booth MaxOne Hotel Balikpapan",
        location: "Lobby Utama & Cafe Courtyard",
        hours: "09.00 - 21.00 WITA",
        status: "Tersedia",
        wa: "6281322119988"
      },
      {
        id: "bth-01-e",
        name: "Booth RS Siloam Balikpapan Hall",
        location: "Lobby Timur Pavilion Rawat Jalan",
        hours: "08.00 - 20.00 WITA",
        status: "Tersedia",
        wa: "6281322119988"
      }
    ]
  },
  {
    id: "out-bpn-02",
    name: "Amanda Brownies Cabang Ruhui Rahayu (Ring Road Dome)",
    city: "Balikpapan Selatan",
    region: "Kota Balikpapan",
    image: "assets/outlet_ruhui_dome.jpg",
    address: "Jl. Ruhui Rahayu No. 88, Gunung Bahagia, Balikpapan Selatan (Dekat Gedung BSCC Dome)",
    phone: "(0542) 887-2233",
    wa: "6281255443322",
    hours: "08.00 - 21.30 WITA",
    mapsUrl: "https://maps.google.com/?q=Amanda+Brownies+Ruhui+Rahayu+Balikpapan",
    distance: "2.4 km",
    booths: [
      {
        id: "bth-02-aa",
        name: "Booth BSCC Dome Balikpapan",
        location: "Area Pintu Masuk Barat BSCC Dome",
        hours: "08.30 - 21.00 WITA",
        status: "Tersedia",
        wa: "6281255443322"
      },
      {
        id: "bth-02-bb",
        name: "Booth Pasar Segar Balikpapan Baru",
        location: "Kios Kuliner Blok RA-08 Pasar Segar",
        hours: "07.00 - 17.00 WITA",
        status: "Tersedia",
        wa: "6281255443322"
      }
    ]
  },
  {
    id: "out-bpn-03",
    name: "Amanda Brownies Outlet Ahmad Yani (Klandasan Ilir)",
    city: "Balikpapan Kota",
    region: "Kota Balikpapan",
    image: "assets/outlet_mt_haryono.jpg",
    address: "Jl. Jenderal Ahmad Yani No. 42, Klandasan Ilir, Balikpapan Kota",
    phone: "(0542) 765-4321",
    wa: "6281344556677",
    hours: "07.30 - 21.00 WITA",
    mapsUrl: "https://maps.google.com/?q=Amanda+Brownies+Ahmad+Yani+Balikpapan",
    distance: "3.1 km",
    booths: [
      {
        id: "bth-03-a",
        name: "Booth Plaza Balikpapan (The Plaza)",
        location: "Ground Floor GF-32 (Dekat Hypermart)",
        hours: "10.00 - 22.00 WITA",
        status: "Tersedia",
        wa: "6281344556677"
      },
      {
        id: "bth-03-b",
        name: "Booth Pelabuhan Semayang",
        location: "Ruang Tunggu Terminal Penyeberangan Semayang",
        hours: "07.00 - 20.00 WITA",
        status: "Tersedia",
        wa: "6281344556677"
      }
    ]
  },
  {
    id: "out-bpn-04",
    name: "Amanda Brownies Cabang Sepinggan (Akses Bandara SAMS)",
    city: "Balikpapan Selatan",
    region: "Kota Balikpapan",
    image: "assets/outlet_sepinggan.jpg",
    address: "Jl. Marsma R. Iswahyudi No. 102, Sepinggan, Balikpapan Selatan (5 Menit dari Bandara)",
    phone: "(0542) 789-0123",
    wa: "6281155667788",
    hours: "06.30 - 21.00 WITA",
    mapsUrl: "https://maps.google.com/?q=Amanda+Brownies+Sepinggan+Balikpapan",
    distance: "4.5 km",
    booths: [
      {
        id: "bth-04-a",
        name: "Booth Bandara SAMS Sepinggan (Keberangkatan)",
        location: "Lantai 3 Gate 4 Terminal Keberangkatan Domestik",
        hours: "06.00 - 21.00 WITA",
        status: "Tersedia",
        wa: "6281155667788"
      },
      {
        id: "bth-04-b",
        name: "Booth Bandara SAMS (Kedatangan)",
        location: "Lantai 1 Arrival Hall (Dekat Pengambilan Bagasi)",
        hours: "07.00 - 21.30 WITA",
        status: "Tersedia",
        wa: "6281155667788"
      }
    ]
  },
  {
    id: "out-bpn-05",
    name: "Amanda Brownies Outlet KM. 4.5 Batu Ampar",
    city: "Balikpapan Utara",
    region: "Kota Balikpapan",
    image: "assets/outlet_ruhui_dome.jpg",
    address: "Jl. Soekarno Hatta KM. 4.5 No. 70, Batu Ampar, Balikpapan Utara",
    phone: "(0542) 865-9988",
    wa: "6281299887766",
    hours: "08.00 - 21.00 WITA",
    mapsUrl: "https://maps.google.com/?q=Amanda+Brownies+KM+4+Balikpapan",
    distance: "5.2 km",
    booths: [
      {
        id: "bth-05-a",
        name: "Booth Rapak Plaza (Ramayana)",
        location: "Lantai 1 Depan Supermarket Rapak Plaza",
        hours: "09.30 - 21.00 WITA",
        status: "Tersedia",
        wa: "6281299887766"
      },
      {
        id: "bth-05-b",
        name: "Booth Terminal Antarkota Batu Ampar",
        location: "Kios Depan Jalur Keberangkatan Bus",
        hours: "07.30 - 18.00 WITA",
        status: "Tersedia",
        wa: "6281299887766"
      }
    ]
  },
  {
    id: "out-bpn-06",
    name: "Amanda Brownies Cabang Balikpapan Baru (Ruko Sentra Eropa)",
    city: "Balikpapan Kota",
    region: "Kota Balikpapan",
    image: "assets/outlet_sepinggan.jpg",
    address: "Kompleks Balikpapan Baru, Ruko Sentra Eropa Blok AB-2 No. 10, Damai Baru, Balikpapan",
    phone: "(0542) 877-3344",
    wa: "6281388776655",
    hours: "08.00 - 21.30 WITA",
    mapsUrl: "https://maps.google.com/?q=Amanda+Brownies+Balikpapan+Baru",
    distance: "2.0 km",
    booths: [
      {
        id: "bth-06-a",
        name: "Booth E-Walk Mall BSB",
        location: "Lantai Lower Ground LG-12 (Depan Superindo)",
        hours: "10.00 - 22.00 WITA",
        status: "Tersedia",
        wa: "6281388776655"
      },
      {
        id: "bth-06-b",
        name: "Booth Pentacity Shopping Venue",
        location: "Lantai 1 Atrium East Promenade",
        hours: "10.00 - 22.00 WITA",
        status: "Tersedia",
        wa: "6281388776655"
      }
    ]
  }
];

const DEFAULT_OUTLET_CATEGORIES = [
  {
    id: "cat-bpn-selatan",
    slug: "balikpapan-selatan",
    name: "Balikpapan Selatan",
    region: "Kota Balikpapan",
    icon: "fa-solid fa-location-dot",
    badgeColor: "olive",
    description: "Wilayah MT Haryono, Sepinggan, Ruhui Rahayu, Damai & Akses Bandara SAMS",
    status: "active",
    sortOrder: 1
  },
  {
    id: "cat-bpn-kota",
    slug: "balikpapan-kota",
    name: "Balikpapan Kota",
    region: "Kota Balikpapan",
    icon: "fa-solid fa-city",
    badgeColor: "gold",
    description: "Pusat Kota, Jl. Jend. Ahmad Yani, Klandasan & Sentra Eropa Balikpapan Baru",
    status: "active",
    sortOrder: 2
  },
  {
    id: "cat-bpn-utara",
    slug: "balikpapan-utara",
    name: "Balikpapan Utara",
    region: "Kota Balikpapan",
    icon: "fa-solid fa-map-pin",
    badgeColor: "green",
    description: "Area KM 4.5, Batu Ampar, Soekarno Hatta & Karang Joang",
    status: "active",
    sortOrder: 3
  },
  {
    id: "cat-bpn-barat",
    slug: "balikpapan-barat",
    name: "Balikpapan Barat",
    region: "Kota Balikpapan",
    icon: "fa-solid fa-anchor",
    badgeColor: "sand",
    description: "Wilayah Kampung Baru, Pelabuhan Semayang & Kawasan Industri Kariangau",
    status: "active",
    sortOrder: 4
  },
  {
    id: "cat-bpn-tengah",
    slug: "balikpapan-tengah",
    name: "Balikpapan Tengah",
    region: "Kota Balikpapan",
    icon: "fa-solid fa-building",
    badgeColor: "olive",
    description: "Gunung Sari, Mekar Sari, Sumber Rejo & Karang Rejo",
    status: "active",
    sortOrder: 5
  },
  {
    id: "cat-bpn-timur",
    slug: "balikpapan-timur",
    name: "Balikpapan Timur",
    region: "Kota Balikpapan",
    icon: "fa-solid fa-umbrella-beach",
    badgeColor: "gold",
    description: "Manggar, Lamaru, Teritip & Kawasan Pantai Balikpapan",
    status: "active",
    sortOrder: 6
  },
  {
    id: "cat-ikn",
    slug: "ikn-penajam",
    name: "IKN & Penajam",
    region: "Kawasan IKN Nusantara",
    icon: "fa-solid fa-tree",
    badgeColor: "green",
    description: "Kawasan Ibu Kota Nusantara (IKN), Sepaku & Penajam Paser Utara",
    status: "active",
    sortOrder: 7
  }
];

const DEFAULT_PROMOS = [
  {
    id: "promo-01",
    title: "Diskon 20% Semua Varian Brownies",
    badge: "Flash Sale Balikpapan",
    badgeColor: "gold",
    image: "assets/promo_flyer_1.jpg",
    aspectRatio: "4/5",
    description: "Nikmati potongan 20% untuk semua varian brownies favorit (Kukus Original, Cheese Cream, Almond, & Pandan). Cocok untuk oleh-oleh dan cemilan keluarga!",
    period: "Berlaku Hari Ini s/d Pukul 21:30 WITA",
    waMessage: "Halo Amanda Brownies Balikpapan, saya ingin memesan Promo Diskon 20%. Mohon info varian yang ready.",
    ctaText: "Pesan Promo 20%",
    active: true
  },
  {
    id: "promo-02",
    title: "Spesial Promo Bundling 3 Box Hemat",
    badge: "Paket Hemat Rp 210.000",
    badgeColor: "red",
    image: "assets/promo_flyer_2.jpg",
    aspectRatio: "4/5",
    description: "Beli 3 paket brownies pilihan (Almond Brownies, Tiramisu Marble, Cheese Cream) dapatkan harga hemat hanya Rp 210.000 + Free Totebag!",
    period: "Berlaku Khusus Outlet Resmi Balikpapan",
    waMessage: "Halo Amanda Brownies Balikpapan, saya mau pesan Paket Bundling 3 Box Hemat Rp 210.000.",
    ctaText: "Pesan Paket 3 Box",
    active: true
  }
];

const DEFAULT_PRICELISTS = [
  {
    id: "price-01",
    title: "Daftar Harga Menu Resmi Amanda Brownies Balikpapan",
    badge: "Price List Brownies",
    image: "assets/amanda_pricelist_poster.jpg",
    caption: "Daftar Harga Resmi Amanda Brownies Kalimantan - Outlet Balikpapan"
  },
  {
    id: "price-02",
    title: "Daftar Harga Menu Spesial & Bolu Pastry",
    badge: "Menu & Bolu Pastry",
    image: "assets/amanda_pricelist_premium.jpg",
    caption: "Daftar Harga Menu Spesial, Bolu & Pastry - Outlet Balikpapan"
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: "prod-01",
    name: "Brownies Kukus Original",
    category: "kukus",
    categoryLabel: "Brownies Kukus",
    badge: "Varian Ikonik",
    badgeColor: "gold",
    price: 48000,
    image: "assets/amanda_brownies_hero_1790255505694.jpg",
    description: "Kelezatan brownies kukus original dengan tekstur lembut legit, aroma cokelat pekat, serta lapisan cokelat leleh khas di bagian tengah.",
    weight: "700 gram",
    shelfLife: "4 Hari (Suhu Ruang) / 7 Hari (Kulkas)",
    sweetness: "Sedang & Gurih",
    ingredients: "Dark Chocolate, Telur Segar, Tepung Terigu, Gula Murni, Butter Khusus",
    outlets: [
      { outletId: "out-bpn-01", status: "Tersedia", stock: "Stok Melimpah (50+ box)", lastRestock: "15 menit lalu" },
      { outletId: "out-bpn-02", status: "Tersedia", stock: "Stok Melimpah (40+ box)", lastRestock: "30 menit lalu" },
      { outletId: "out-bpn-03", status: "Tersedia", stock: "Stok Melimpah (35+ box)", lastRestock: "Baru saja" },
      { outletId: "out-bpn-04", status: "Tersedia", stock: "Stok Melimpah (45+ box)", lastRestock: "20 menit lalu" },
      { outletId: "out-bpn-05", status: "Tersedia", stock: "Stok Melimpah (30+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-06", status: "Tersedia", stock: "Stok Melimpah (25+ box)", lastRestock: "45 menit lalu" }
    ]
  },
  {
    id: "prod-02",
    name: "Brownies Kukus Cheese Cream",
    category: "kukus",
    categoryLabel: "Brownies Kukus",
    badge: "Lapis Keju",
    badgeColor: "cheese",
    price: 55000,
    image: "assets/brownies_cheese_cream_1790255567593.jpg",
    description: "Kombinasi cake brownies cokelat lembut dengan lapisan cream cheese gurih di tengah serta taburan keju cheddar parut di atasnya.",
    weight: "700 gram",
    shelfLife: "3 Hari (Suhu Ruang) / 6 Hari (Kulkas)",
    sweetness: "Gurih Manis Pas",
    ingredients: "Cream Cheese, Dark Cocoa, Keju Cheddar Pilihan, Butter",
    outlets: [
      { outletId: "out-bpn-01", status: "Tersedia", stock: "Stok Melimpah (30+ box)", lastRestock: "30 menit lalu" },
      { outletId: "out-bpn-02", status: "Tersedia", stock: "Stok Melimpah (25+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-03", status: "Terbatas", stock: "Sisa 5 box (Cepat Habis)", lastRestock: "2 jam lalu" },
      { outletId: "out-bpn-04", status: "Tersedia", stock: "Stok Melimpah (28+ box)", lastRestock: "45 menit lalu" },
      { outletId: "out-bpn-05", status: "Tersedia", stock: "Stok Melimpah (15+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-06", status: "Tersedia", stock: "Stok Melimpah (20+ box)", lastRestock: "30 menit lalu" }
    ]
  },
  {
    id: "prod-03",
    name: "Brownies Tiramisu Marble",
    category: "marble",
    categoryLabel: "Premium & Marble",
    badge: "Espresso & Cokelat",
    badgeColor: "coffee",
    price: 56000,
    image: "assets/brownies_tiramisu_marble_1790255612507.jpg",
    description: "Perpaduan rasa kopi espresso khas tiramisu dengan brownies cokelat dalam motif marmer elegan dan aroma harum lembut.",
    weight: "720 gram",
    shelfLife: "4 Hari (Suhu Ruang) / 7 Hari (Kulkas)",
    sweetness: "Aroma Kopi Mantap",
    ingredients: "Ekstrak Kopi Espresso, Tiramisu Glaze, Dark Cocoa, Telur Segar",
    outlets: [
      { outletId: "out-bpn-01", status: "Tersedia", stock: "Stok Melimpah (25+ box)", lastRestock: "40 menit lalu" },
      { outletId: "out-bpn-02", status: "Tersedia", stock: "Stok Melimpah (18+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-03", status: "Tersedia", stock: "Stok Melimpah (20+ box)", lastRestock: "30 menit lalu" },
      { outletId: "out-bpn-04", status: "Terbatas", stock: "Sisa 4 box", lastRestock: "3 jam lalu" },
      { outletId: "out-bpn-05", status: "Tersedia", stock: "Stok Melimpah (12+ box)", lastRestock: "2 jam lalu" },
      { outletId: "out-bpn-06", status: "Tersedia", stock: "Stok Melimpah (15+ box)", lastRestock: "1 jam lalu" }
    ]
  },
  {
    id: "prod-04",
    name: "Brownies Sarikaya Pandan",
    category: "kukus",
    categoryLabel: "Brownies Kukus",
    badge: "Pandan Asli",
    badgeColor: "pandan",
    price: 52000,
    image: "assets/brownies_sarikaya_pandan_1790255635549.jpg",
    description: "Lapisan custard sarikaya pandan wangi alami berpadu harmonis dengan legitnya brownies cokelat kukus Amanda.",
    weight: "700 gram",
    shelfLife: "3 Hari (Suhu Ruang) / 5 Hari (Kulkas)",
    sweetness: "Wangi Gurih Pandan",
    ingredients: "Ekstrak Daun Pandan Asli, Santan Kelapa Murni, Dark Chocolate, Telur",
    outlets: [
      { outletId: "out-bpn-01", status: "Tersedia", stock: "Stok Melimpah (20+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-02", status: "Tersedia", stock: "Stok Melimpah (15+ box)", lastRestock: "2 jam lalu" },
      { outletId: "out-bpn-03", status: "Tersedia", stock: "Stok Melimpah (18+ box)", lastRestock: "40 menit lalu" },
      { outletId: "out-bpn-04", status: "Tersedia", stock: "Stok Melimpah (22+ box)", lastRestock: "30 menit lalu" },
      { outletId: "out-bpn-05", status: "Terbatas", stock: "Sisa 3 box", lastRestock: "3 jam lalu" },
      { outletId: "out-bpn-06", status: "Tersedia", stock: "Stok Melimpah (14+ box)", lastRestock: "1 jam lalu" }
    ]
  },
  {
    id: "prod-05",
    name: "Brownies Bakar Crunchy Almond",
    category: "bakar",
    categoryLabel: "Brownies Bakar",
    badge: "Panggang Renyah",
    badgeColor: "bakar",
    price: 53000,
    image: "assets/brownies_bakar_almond_1790255717334.jpg",
    description: "Brownies panggang dengan kerak renyah di luar, tekstur fudgy di dalam, dan taburan kacang almond panggang melimpah.",
    weight: "650 gram",
    shelfLife: "7 Hari (Suhu Ruang) / 14 Hari (Kulkas)",
    sweetness: "Fudge Gurih Almond",
    ingredients: "Kacang Almond Panggang, Couverture Cacao, Mentega, Gula Pasir",
    outlets: [
      { outletId: "out-bpn-01", status: "Tersedia", stock: "Stok Melimpah (35+ box)", lastRestock: "30 menit lalu" },
      { outletId: "out-bpn-02", status: "Tersedia", stock: "Stok Melimpah (25+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-03", status: "Tersedia", stock: "Stok Melimpah (20+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-04", status: "Tersedia", stock: "Stok Melimpah (30+ box)", lastRestock: "45 menit lalu" },
      { outletId: "out-bpn-05", status: "Tersedia", stock: "Stok Melimpah (18+ box)", lastRestock: "2 jam lalu" },
      { outletId: "out-bpn-06", status: "Tersedia", stock: "Stok Melimpah (22+ box)", lastRestock: "1 jam lalu" }
    ]
  },
  {
    id: "prod-06",
    name: "Brownies Kukus Choco Marble",
    category: "marble",
    categoryLabel: "Premium & Marble",
    badge: "Dua Cokelat",
    badgeColor: "gold",
    price: 52000,
    image: "assets/brownies_tiramisu_marble_1790255612507.jpg",
    description: "Kombinasi klasik milk chocolate manis lembut dan dark chocolate pekat dalam motif marmer cantik yang disukai keluarga.",
    weight: "700 gram",
    shelfLife: "4 Hari (Suhu Ruang) / 7 Hari (Kulkas)",
    sweetness: "Manis Lembut Seimbang",
    ingredients: "Milk & Dark Chocolate, Telur Segar, Tepung, Mentega",
    outlets: [
      { outletId: "out-bpn-01", status: "Tersedia", stock: "Stok Melimpah (20+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-02", status: "Tersedia", stock: "Stok Melimpah (15+ box)", lastRestock: "2 jam lalu" },
      { outletId: "out-bpn-03", status: "Tersedia", stock: "Stok Melimpah (18+ box)", lastRestock: "1 jam lalu" },
      { outletId: "out-bpn-04", status: "Tersedia", stock: "Stok Melimpah (20+ box)", lastRestock: "30 menit lalu" },
      { outletId: "out-bpn-05", status: "Terbatas", stock: "Sisa 4 box", lastRestock: "3 jam lalu" },
      { outletId: "out-bpn-06", status: "Tersedia", stock: "Stok Melimpah (12+ box)", lastRestock: "1 jam lalu" }
    ]
  }
];

const DEFAULT_TICKER = [
  { id: "tick-1", icon: "fa-solid fa-tag", title: "FLASH SALE BPN:", text: "Diskon 20% Brownies Cheese Cream & Tiramisu Marble" },
  { id: "tick-2", icon: "fa-solid fa-gift", title: "PROMO SPESIAL:", text: "Potongan harga langsung untuk seluruh varian pilihan di outlet resmi Balikpapan" },
  { id: "tick-3", icon: "fa-solid fa-truck-fast", title: "GRATIS ONGKIR:", text: "Pengiriman s/d 5 Km dari seluruh outlet resmi Balikpapan" },
  { id: "tick-4", icon: "fa-solid fa-store", title: "CABANG RESMI BPN:", text: "MT Haryono • Ruhui Rahayu • Sepinggan • Ahmad Yani • KM 4.5 • Balikpapan Baru" },
  { id: "tick-5", icon: "fa-solid fa-clock", title: "PENAWARAN HARI INI:", text: "Khusus pemesanan hari ini s/d pukul 21:30 WITA" }
];

// ===================================================================
// STORAGE HELPER FUNCTIONS (LOCALSTORAGE SYNC)
// ===================================================================
function getStoredData(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`LocalStorage read error for ${key}:`, e);
    return fallback;
  }
}

function saveStoredData(key, data, syncCloud = true) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyAmandaDataChanged();

    // Auto-sync to Supabase Cloud if connected and syncCloud is true
    if (syncCloud && typeof pushToSupabase === 'function' && typeof isSupabaseActive === 'function' && isSupabaseActive()) {
      const tableMap = {
        'amanda_products': 'products',
        'amanda_promos': 'promos',
        'amanda_outlets': 'outlets',
        'amanda_outlet_categories': 'outlet_categories',
        'amanda_ticker': 'ticker',
        'amanda_platform_tenants': 'tenants',
        'amanda_invoices': 'invoices'
      };
      const tableName = tableMap[key];
      if (tableName && Array.isArray(data)) {
        pushToSupabase(tableName, data);
      }
    }
  } catch (e) {
    console.error(`LocalStorage save error for ${key}:`, e);
  }
}

let amandaNotifyTimer = null;
function notifyAmandaDataChanged() {
  if (amandaNotifyTimer) clearTimeout(amandaNotifyTimer);
  amandaNotifyTimer = setTimeout(() => {
    try {
      localStorage.setItem('amanda_sync_timestamp', Date.now().toString());
    } catch (e) { }
    window.dispatchEvent(new CustomEvent('amanda_data_updated'));
  }, 120);
}

// Global active datasets loaded from localStorage or defaults
let AMANDA_OUTLETS = [];
let AMANDA_OUTLET_CATEGORIES = [];
let AMANDA_PROMOS = [];
let AMANDA_PRICELISTS = [];
let AMANDA_PRODUCTS = [];
let AMANDA_TICKER = [];

function reloadAmandaData() {
  AMANDA_OUTLET_CATEGORIES = getStoredData('amanda_outlet_categories', DEFAULT_OUTLET_CATEGORIES);
  AMANDA_OUTLETS = getStoredData('amanda_outlets', DEFAULT_OUTLETS).map(out => {
    return {
      ...out,
      booths: Array.isArray(out.booths) ? out.booths : []
    };
  });
  AMANDA_PROMOS = getStoredData('amanda_promos', DEFAULT_PROMOS);
  AMANDA_PRICELISTS = getStoredData('amanda_pricelists', DEFAULT_PRICELISTS);
  AMANDA_PRODUCTS = getStoredData('amanda_products', DEFAULT_PRODUCTS);
  AMANDA_TICKER = getStoredData('amanda_ticker', DEFAULT_TICKER);
}

// Initial data load
reloadAmandaData();

// Reset helper
function resetAmandaDataToDefault() {
  localStorage.removeItem('amanda_outlets');
  localStorage.removeItem('amanda_outlet_categories');
  localStorage.removeItem('amanda_promos');
  localStorage.removeItem('amanda_pricelists');
  localStorage.removeItem('amanda_products');
  localStorage.removeItem('amanda_ticker');
  localStorage.removeItem('amanda_rental_sub');
  localStorage.removeItem('amanda_invoices');
  reloadAmandaData();
  notifyAmandaDataChanged();
}

// ===================================================================
// RENTAL / SUBSCRIPTION & INVOICE DATA MODELS
// ===================================================================
const DEFAULT_RENTAL_PLANS = [
  // --- KATEGORI BULANAN (MONTHLY) ---
  {
    id: "plan-1m",
    name: "Paket Starter (1 Bulan)",
    cycle: "monthly",
    durationMonths: 1,
    price: 99000,
    originalPrice: 99000,
    discountLabel: null,
    badge: "Fleksibel",
    description: "Cocok untuk uji coba operasional cabang atau promosi event musiman.",
    perMonthEquivalent: "Rp 99.000 / bln",
    features: [
      "Akses Penuh Landing Page Amanda",
      "Panel CMS Pengelolaan Menu & Stok",
      "Manajemen 6 Cabang & Booth Counter",
      "Integrasi WhatsApp Chat Langsung",
      "Running Promo Ticker & Flyer Lightbox"
    ]
  },
  {
    id: "plan-3m",
    name: "Paket Kuartal (3 Bulan)",
    cycle: "monthly",
    durationMonths: 3,
    price: 279000,
    originalPrice: 297000,
    discountLabel: "Hemat 6%",
    badge: "Pilihan Santai",
    description: "Ideal untuk pengujian operasional kuartalan dengan biaya lebih terjangkau.",
    perMonthEquivalent: "Rp 93.000 / bln",
    features: [
      "Semua Fitur Paket Starter",
      "Upload Gambar dari HP / Perangkat",
      "Export & Backup Data JSON Rutin",
      "Dukungan WhatsApp Respon Cepat"
    ]
  },
  {
    id: "plan-6m",
    name: "Paket Bisnis (6 Bulan)",
    cycle: "monthly",
    durationMonths: 6,
    price: 499000,
    originalPrice: 594000,
    discountLabel: "Hemat 16%",
    badge: "Paling Populer",
    description: "Pilihan terbaik untuk operasional cabang resmi jangka menengah.",
    perMonthEquivalent: "Rp 83.100 / bln",
    features: [
      "Semua Fitur Paket Kuartal",
      "Bebas Tambah & Edit Promo Flyer 4:5",
      "Prioritas Bantuan Teknis WhatsApp",
      "Free Setup Subdomain Cabang"
    ]
  },

  // --- KATEGORI TAHUNAN (YEARLY - BEST VALUE) ---
  {
    id: "plan-12m",
    name: "Paket Enterprise (1 Tahun)",
    cycle: "yearly",
    durationMonths: 12,
    price: 899000,
    originalPrice: 1188000,
    discountLabel: "Hemat 25% (2 Bln Gratis)",
    badge: "Paling Laris",
    description: "Solusi hemat maksimal untuk operasional stabil tahunan.",
    perMonthEquivalent: "Rp 74.900 / bln",
    features: [
      "Semua Fitur Paket Bisnis",
      "Biaya Termurah (Hanya ~Rp 74rb/bln)",
      "Garansi Uptime 99.9% & Pembaruan Sistem",
      "Kustomisasi Logo & Identitas Cabang",
      "Dukungan Full Backup & Migrasi Data"
    ]
  },
  {
    id: "plan-24m",
    name: "Paket Bisnis Pro (2 Tahun)",
    cycle: "yearly",
    durationMonths: 24,
    price: 1599000,
    originalPrice: 2376000,
    discountLabel: "Hemat 33%",
    badge: "Super Hemat",
    description: "Untuk mitra outlet jangka panjang dengan komitmen garansi sistem penuh.",
    perMonthEquivalent: "Rp 66.600 / bln",
    features: [
      "Semua Fitur Paket Enterprise 1 Tahun",
      "Biaya Jauh Lebih Murah (~Rp 66rb/bln)",
      "Setup Custom Domain Pribadi Gratis",
      "Prioritas Jalur VIP Customer Support 24/7",
      "Bebas Update Fitur Baru Tanpa Biaya Tambahan"
    ]
  }
];

const DEFAULT_PAYMENT_METHODS = [
  {
    id: "qris",
    name: "QRIS Instant (Semua Bank & E-Wallet)",
    type: "instant",
    icon: "fa-solid fa-qrcode",
    badge: "Otomatis & Tercepat",
    accountNumber: "NMID: ID1023245678901",
    accountHolder: "PT AMANDA DIGITAL KALIMANTAN",
    instructions: "Scan barcode QRIS menggunakan BCA Mobile, Livin Mandiri, BRImo, GoPay, OVO, Dana, atau ShopeePay."
  },
  {
    id: "bca",
    name: "Transfer Bank BCA",
    type: "bank",
    icon: "fa-solid fa-building-columns",
    accountNumber: "8691-234-567",
    accountHolder: "AMANDA DIGITAL BALIKPAPAN",
    instructions: "Transfer ke nomor rekening BCA di atas dan simpan struk transfer untuk konfirmasi."
  },
  {
    id: "mandiri",
    name: "Transfer Bank Mandiri",
    type: "bank",
    icon: "fa-solid fa-building-columns",
    accountNumber: "149-00-9876543-2",
    accountHolder: "AMANDA DIGITAL BALIKPAPAN",
    instructions: "Transfer via ATM / Mandiri Livin ke nomor rekening di atas."
  },
  {
    id: "ewallet",
    name: "E-Wallet (DANA / GoPay / OVO)",
    type: "ewallet",
    icon: "fa-solid fa-wallet",
    accountNumber: "0813-2211-9988",
    accountHolder: "Amanda Digital Balikpapan",
    instructions: "Kirim saldo ke nomor DANA/GoPay di atas dengan mencantumkan nomor invoice pada catatan transfer."
  }
];

const DEFAULT_RENTAL_SUBSCRIPTION = {
  tenantName: "Amanda Brownies Kota Balikpapan",
  tenantPhone: "6281322119988",
  tenantEmail: "admin.balikpapan@amandabrownies.id",
  planId: "plan-6m",
  planName: "Paket Bisnis (6 Bulan)",
  status: "active", // active | pending | expired
  startDate: "2026-09-01",
  expiryDate: "2027-03-01",
  domain: "balikpapan.amandabrownies.id",
  lastInvoiceId: "INV-202609-001"
};

const DEFAULT_INVOICE_HISTORY = [
  {
    id: "INV-202609-001",
    date: "2026-09-01",
    dueDate: "2026-09-04",
    tenantName: "Amanda Brownies Kota Balikpapan",
    tenantPhone: "6281322119988",
    tenantEmail: "admin.balikpapan@amandabrownies.id",
    planId: "plan-6m",
    planName: "Paket Bisnis (6 Bulan)",
    durationMonths: 6,
    subtotal: 499000,
    uniqueCode: 124,
    totalAmount: 499124,
    paymentMethodId: "qris",
    paymentMethodName: "QRIS Instant Realtime",
    status: "PAID", // PAID | PENDING | EXPIRED
    paidAt: "2026-09-01 11:20 WITA"
  }
];

function getRentalSubscription() {
  return getStoredData('amanda_rental_sub', DEFAULT_RENTAL_SUBSCRIPTION);
}

function saveRentalSubscription(data, syncCloud = true) {
  saveStoredData('amanda_rental_sub', data, syncCloud);
}

function getInvoiceHistory() {
  return getStoredData('amanda_invoices', DEFAULT_INVOICE_HISTORY);
}

function saveInvoiceHistory(list, syncCloud = true) {
  saveStoredData('amanda_invoices', list, syncCloud);
}

function getInvoiceById(id) {
  const history = getInvoiceHistory();
  return history.find(inv => inv.id === id) || null;
}

function calculateRemainingDays(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const now = new Date();
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ===================================================================
// SUPERADMIN MULTI-TENANT & PLATFORM STORAGE HELPERS
// ===================================================================
const DEFAULT_TENANTS = [
  {
    id: "tenant-bpn",
    name: "Amanda Brownies Cabang Balikpapan",
    city: "Kota Balikpapan, Kaltim",
    phone: "6281322119988",
    email: "admin.balikpapan@amandabrownies.id",
    domain: "balikpapan.amandabrownies.id",
    planId: "plan-6m",
    planName: "Paket Bisnis (6 Bulan)",
    cycle: "monthly",
    status: "active", // active | pending | suspended | expired
    startDate: "2026-09-01",
    expiresAt: "2027-03-01",
    totalPaid: 499124,
    outletsCount: 6,
    notes: "Cabang utama Kalimantan Timur dengan 6 outlet & 9 booth counter."
  },
  {
    id: "tenant-smd",
    name: "Amanda Brownies Cabang Samarinda",
    city: "Kota Samarinda, Kaltim",
    phone: "6281299887766",
    email: "admin.samarinda@amandabrownies.id",
    domain: "samarinda.amandabrownies.id",
    planId: "plan-12m",
    planName: "Paket Enterprise (1 Tahun)",
    cycle: "yearly",
    status: "active",
    startDate: "2026-08-15",
    expiresAt: "2027-08-15",
    totalPaid: 899450,
    outletsCount: 4,
    notes: "Outlet Juanda, Antasari, SCP Mall, & PM Noor."
  },
  {
    id: "tenant-bjm",
    name: "Amanda Brownies Cabang Banjarmasin",
    city: "Kota Banjarmasin, Kalsel",
    phone: "6281144332211",
    email: "admin.banjarmasin@amandabrownies.id",
    domain: "banjarmasin.amandabrownies.id",
    planId: "plan-1m",
    planName: "Paket Starter (1 Bulan)",
    cycle: "monthly",
    status: "active",
    startDate: "2026-09-10",
    expiresAt: "2026-10-10",
    totalPaid: 99120,
    outletsCount: 3,
    notes: "Outlet A. Yani KM 3.5, Lambung Mangkurat, & Duta Mall."
  },
  {
    id: "tenant-ptk",
    name: "Amanda Brownies Cabang Pontianak",
    city: "Kota Pontianak, Kalbar",
    phone: "6281355667788",
    email: "admin.pontianak@amandabrownies.id",
    domain: "pontianak.amandabrownies.id",
    planId: "plan-6m",
    planName: "Paket Bisnis (6 Bulan)",
    cycle: "monthly",
    status: "expired",
    startDate: "2026-03-01",
    expiresAt: "2026-09-01",
    totalPaid: 499230,
    outletsCount: 3,
    notes: "Perlu konfirmasi perpanjangan sewa kuartal II."
  }
];

function getTenants() {
  return getStoredData('amanda_platform_tenants', DEFAULT_TENANTS);
}

function saveTenants(list, syncCloud = true) {
  saveStoredData('amanda_platform_tenants', list, syncCloud);
}

function getRentalPlans() {
  return getStoredData('amanda_platform_plans', DEFAULT_RENTAL_PLANS);
}

function saveRentalPlans(plans, syncCloud = true) {
  saveStoredData('amanda_platform_plans', plans, syncCloud);
}

function getPaymentMethods() {
  return getStoredData('amanda_platform_payments', DEFAULT_PAYMENT_METHODS);
}

function savePaymentMethods(methods, syncCloud = true) {
  saveStoredData('amanda_platform_payments', methods, syncCloud);
}


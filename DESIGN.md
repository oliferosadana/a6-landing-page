# DESIGN DIRECTION: Amanda Brownies Balikpapan (Anti-Slop Implementation)

## 1. Brand Identity & Personality
- **Brand**: Amanda Brownies Kukus & Bakar — Layanan Resmi Kota Balikpapan.
- **Personality**: Authentic, grounded, artisan bakery, warm, trustworthy, and content-first.
- **Philosophy**: Every visual element serves an actual purpose (readability, navigation, purchasing). No gratuitous AI glows, no fake metrics, no template filler.

## 2. Color System (Color Hunt: #f5efe3 #4f5b2a #b8892d #d8c9a8)
- **Background Root (`#F5EFE3`)**: Warm Ivory Cream — natural, organic artisan bakery feel.
- **Primary Brand Accent (`#4F5B2A`)**: Deep Artisan Olive Green — strong, sophisticated contrast for badges, active chips, and brand headers.
- **Secondary Brand Accent (`#B8892D`)**: Warm Amber Caramel Gold — used for prices, highlights, and secondary accents.
- **Surface & Borders (`#D8C9A8`)**: Warm Sand / Tan — crisp 1px borders and gentle tactile backgrounds.
- **Text Main (`#231B14`)**: Deep Roasted Coffee / Charcoal — optimal readability and contrast.
- **Action (`#25D366`)**: Functional WhatsApp green for conversion-critical actions.

## 3. Typography Hierarchy
- **Display / Headings**: `Playfair Display` (Serif, elegant, dignified)
- **Body & UI**: `Plus Jakarta Sans` (Clear, high legibility, balanced weight)
- **Numerals & Codes**: Tabular clean monospace for prices & voucher codes

## 4. Anti-Slop Principles Applied
- **No fake statistics**: Removed fabricated review counters and exaggerated numbers.
- **No fake customer stock photos**: Replaced generic avatar cards with practical, verifiable Balikpapan outlet & delivery information.
- **No floating orbs or neon glow stack**: Subtle warm ambient backdrop with clean, grounded component surfaces.
- **Restrained geometry**: Clean 8px–12px border radius, eliminating the "everything-is-a-capsule" AI slop trope.
- **High functional clarity**: Accordion dropdowns open on the active card without distorting neighboring grid elements (`align-items: start`).

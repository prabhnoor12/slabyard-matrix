/**
 * SlabYardMatrix — 241-Page Static Site Generator (Cloudflare Workers / Pages Ready)
 * Compiles 241 static HTML pages + sitemap.xml + robots.txt + ads.txt + Cloudflare assets config
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const SRC_DIR = path.join(ROOT, 'src');
const DIST_DIR = path.join(ROOT, 'dist');

const SITE_NAME = 'SlabYardMatrix';
const SITE_URL = 'https://slabyardmatrix.com';
const TODAY = '2026-11-23';

const slabs = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'slabs.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projects.json'), 'utf8'));
const footings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'footings.json'), 'utf8'));
const gravel = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'gravel.json'), 'utf8'));

if (fs.existsSync(DIST_DIR)) fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST_DIR, 'assets'), { recursive: true });

const cssRaw = fs.readFileSync(path.join(SRC_DIR, 'styles.css'), 'utf8');
const jsRaw = fs.readFileSync(path.join(SRC_DIR, 'app.js'), 'utf8');
const cssHash = crypto.createHash('md5').update(cssRaw).digest('hex').slice(0, 8);
const jsHash = crypto.createHash('md5').update(jsRaw).digest('hex').slice(0, 8);

const CSS_PATH = `/assets/styles.${cssHash}.css`;
const JS_PATH = `/assets/app.${jsHash}.js`;
fs.writeFileSync(path.join(DIST_DIR, `assets/styles.${cssHash}.css`), cssRaw);
fs.writeFileSync(path.join(DIST_DIR, `assets/app.${jsHash}.js`), jsRaw);

// Build global quick-jump datalist
const allSearchEntries = [
  ...slabs.map(s => ({ label: s.shortLabel, url: `/slabs/${s.slug}/` })),
  ...projects.map(p => ({ label: p.name, url: `/projects/${p.slug}/` })),
  ...footings.map(f => ({ label: f.shortLabel, url: `/footings/${f.slug}/` })),
  ...gravel.map(g => ({ label: g.shortLabel, url: `/gravel/${g.slug}/` }))
];
const DATALIST_HTML = `<datalist id="slab-pages-list">${allSearchEntries.map(e => `<option value="${escapeAttr(e.label)}" data-url="${e.url}"></option>`).join('')}</datalist>`;

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;');
}

function writePage(relPath, html) {
  const full = path.join(DIST_DIR, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
}

const sitemapUrls = [];

function renderLayout({ title, description, canonicalPath, breadcrumbs, jsonLdGraph, mainHtml, sidebarLinks }) {
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  if (!canonicalPath.includes('404')) sitemapUrls.push(canonicalUrl);

  const schemaScript = JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLdGraph });
  const bcHtml = breadcrumbs.map((b, i) =>
    i < breadcrumbs.length - 1
      ? `<a href="${b.url}">${escapeHtml(b.name)}</a><span>/</span>`
      : `<span>${escapeHtml(b.name)}</span>`
  ).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${escapeHtml(title)} | ${SITE_NAME}</title>
  <meta name="description" content="${escapeAttr(description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="expect" href="#hero-panel" blocking="render">
  <link rel="stylesheet" href="${CSS_PATH}">
  <script type="application/ld+json">${schemaScript}</script>
  <script type="speculationrules">
    {"prefetch":[{"where":{"href_matches":"/*"},"eagerness":"moderate"}]}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/">
        <span class="brand-badge">YD³</span>
        <span>${SITE_NAME}</span>
      </a>
      <nav class="nav-links" aria-label="Primary Navigation">
        <a href="/#slabs">Concrete Slabs</a>
        <a href="/#projects">Garage &amp; RV Pads</a>
        <a href="/#footings">Sonotube &amp; Footings</a>
        <a href="/#gravel">Driveway Gravel</a>
      </nav>
      <search class="search-bar">
        <input id="quick-jump" type="search" list="slab-pages-list" placeholder="Jump to 10x10, 24x24, 12&quot; Sonotube..." aria-label="Search concrete and gravel calculators">
        ${DATALIST_HTML}
      </search>
      <button id="theme-toggle" class="theme-btn" type="button" aria-label="Toggle color theme">🌙 Dark</button>
    </div>
  </header>

  <div class="container">
    <div class="ad-slot ad-leaderboard" data-refresh="true" aria-label="Advertisement">
      <span>Display Ad Slot — 728×90 Leaderboard (Home Depot / Lowe's / Concrete Ready-Mix)</span>
    </div>

    <div class="layout-grid">
      <main>
        <nav class="breadcrumb" aria-label="Breadcrumb">${bcHtml}</nav>
        ${mainHtml}
      </main>
      <aside class="sidebar-col">
        <div class="ad-slot ad-sidebar" data-refresh="true" aria-label="Sidebar Advertisement">
          <span>Sticky 300×600 High-RPM Display Ad Slot<br>(Concrete Trucks, Mixers &amp; Rebar Suppliers)</span>
        </div>
        <div class="card" style="margin-top:16px">
          <h3 style="margin-top:0;font-size:1rem">Popular Dimension Shortcuts</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${(sidebarLinks || []).map(l => `<a class="link-chip" href="${l.url}">${escapeHtml(l.label)}</a>`).join('')}
          </div>
        </div>
      </aside>
    </div>
  </div>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-links">
        <a href="/">Home</a>
        <a href="/about/">Engineering Methodology</a>
        <a href="/privacy-policy/">Privacy Policy</a>
        <a href="/terms/">Terms of Use</a>
        <a href="/contact/">Contact</a>
        <a href="/sitemap.xml">XML Sitemap</a>
      </div>
      <p>&copy; 2026 ${SITE_NAME}. Concrete yield standards based on 0.60 cu ft per 80 lb bag (45 bags/yd³), 0.45 cu ft per 60 lb bag (60 bags/yd³), and 1.40 tons/yd³ compacted #57 stone density. Always verify local frost-line depth and ACI 318 structural codes before pouring.</p>
    </div>
  </footer>

  <div class="ad-mobile-sticky" aria-label="Mobile Sticky Ad">Mobile Adhesion Ad Unit (320×50) — Zero CLS</div>
  <script src="${JS_PATH}" defer></script>
</body>
</html>`;
}

function buildDatasetSchema(name, desc, url) {
  return {
    '@type': 'Dataset',
    name,
    description: desc,
    url: `${SITE_URL}${url}`,
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
    dateModified: TODAY
  };
}

function renderSlabSvg(l, w, tIn, mono, yards, bags80) {
  return `<div class="svg-blueprint-wrap">
    <svg viewBox="0 0 640 210" role="img" aria-label="Isometric concrete slab cross-section blueprint">
      <defs>
        <pattern id="rebarGrid" width="24" height="14" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 14" fill="none" stroke="#d97706" stroke-width="0.7" opacity="0.45"/>
        </pattern>
      </defs>
      <!-- Compacted #57 Gravel Sub-base -->
      <polygon points="90,152 330,188 555,142 315,108" fill="#64748b" opacity="0.35" stroke="#475569" stroke-width="1.2"/>
      <!-- Thickened Monolithic Edge (toggled) -->
      <g id="svg-mono-edge" style="display:${mono ? 'inline' : 'none'}">
        <polygon points="90,126 330,162 330,188 90,152" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
        <polygon points="330,162 555,116 555,142 330,188" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
      </g>
      <!-- Concrete Slab Top & Edges -->
      <polygon points="90,104 330,140 555,94 315,58" fill="#cbd5e1" stroke="#334155" stroke-width="1.6"/>
      <polygon points="90,104 330,140 555,94 315,58" fill="url(#rebarGrid)"/>
      <polygon points="90,104 330,140 330,158 90,122" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
      <polygon points="330,140 555,94 555,112 330,158" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
      <!-- Blueprint Labels -->
      <text id="svg-dim-label" x="20" y="30" fill="currentColor" font-family="monospace" font-size="14" font-weight="700">${l}' × ${w}' × ${tIn}"${mono ? ' + 12" Edge' : ''}</text>
      <text id="svg-vol-label" x="620" y="30" text-anchor="end" fill="#d97706" font-family="monospace" font-size="14" font-weight="700">${yards} yd³ | ${bags80} Bags</text>
      <text x="20" y="198" fill="currentColor" opacity="0.7" font-family="monospace" font-size="11">Layer 1: 4" Compacted #57 Stone | Layer 2: #4 Rebar @ 18" O.C. | Layer 3: ${tIn}" Concrete Slab</text>
    </svg>
  </div>`;
}

function renderAffiliateCards(mode, bags80, rebarSticks, gravelTons) {
  if (mode === 'gravel') {
    return `<div class="affiliate-grid">
      <div class="aff-card"><div><strong>Non-Woven Geotextile Driveway Fabric</strong><p style="font-size:0.84rem;color:var(--text-muted);margin:6px 0">Prevents clay mud from pumping up into your ${gravelTons} tons of crushed stone.</p></div><a class="aff-btn" href="#gravel-checklist">Check Roll Coverage →</a></div>
      <div class="aff-card"><div><strong>Vibratory Plate Compactor Rental</strong><p style="font-size:0.84rem;color:var(--text-muted);margin:6px 0">Compacts 2" lifts to 95% Proctor density so driveway gravel locks tight without rutting.</p></div><a class="aff-btn" href="#gravel-checklist">Compaction Specs →</a></div>
      <div class="aff-card"><div><strong>Local Dump Truck Delivery Quotes</strong><p style="font-size:0.84rem;color:var(--text-muted);margin:6px 0">Bulk quarry delivery saves 55%+ vs buying 50 lb bags at retail.</p></div><a class="aff-btn" href="#gravel-checklist">Compare Bulk Rates →</a></div>
    </div>`;
  }
  return `<div class="affiliate-grid">
    <div class="aff-card"><div><strong>Quikrete / Sakrete 80 lb High-Strength Mix</strong><p style="font-size:0.84rem;color:var(--text-muted);margin:6px 0">Need ${bags80} bags (${(bags80 / 42).toFixed(1)} pallets). 4,000 PSI structural concrete mix.</p></div><a class="aff-btn" href="#material-bom">View Pallet Pricing →</a></div>
    <div class="aff-card"><div><strong>#4 Grade-60 Rebar &amp; 2" Slab Chairs</strong><p style="font-size:0.84rem;color:var(--text-muted);margin:6px 0">Estimate ${rebarSticks || 12} × 20-ft sticks on 18" O.C. grid with 16-gauge tie wire.</p></div><a class="aff-btn" href="#material-bom">Rebar Spacing Guide →</a></div>
    <div class="aff-card"><div><strong>3.5 Cu Ft Portable Barrel Mixer / Bull Float</strong><p style="font-size:0.84rem;color:var(--text-muted);margin:6px 0">Essential finishing kit for pouring 15 to 90 bags without cold joints.</p></div><a class="aff-btn" href="#material-bom">Pour Day Checklist →</a></div>
  </div>`;
}

const defaultSidebar = [
  { label: '10x10 Concrete Slab (4")', url: '/slabs/10x10-concrete-slab-calculator/' },
  { label: '12x12 Patio Slab (4")', url: '/slabs/12x12-concrete-slab-calculator/' },
  { label: '20x20 2-Car Garage Slab', url: '/slabs/20x20-concrete-slab-calculator/' },
  { label: '24x24 Monolithic Garage Slab', url: '/slabs/24x24-monolithic-concrete-slab-thickened-edge/' },
  { label: '30x40 Pole Barn Floor', url: '/projects/pole-barn-floor-30x40-concrete-calculator/' },
  { label: '12" Sonotube (48" Deep)', url: '/footings/12-inch-sonotube-48-inches-deep-concrete-bags/' },
  { label: '12x100 Gravel Driveway Tons', url: '/gravel/12x100-gravel-driveway-tons-and-dump-trucks/' }
];

// --- 1. Build 84 Concrete Slab Dimension Pages ---
for (const s of slabs) {
  const url = `/slabs/${s.slug}/`;
  const siblings = slabs.filter(x => x.lengthFt === s.lengthFt && x.widthFt === s.widthFt && x.slug !== s.slug);
  const nearby = slabs.filter(x => x.variantType === s.variantType && x.slug !== s.slug).slice(0, 8);

  const thicknessRows = [4, 5, 6, 8].map(t => {
    const netYds = ((s.areaSqFt * (t / 12)) + (s.hasThickenedEdge ? s.perimeterFt * (8 / 12) : 0)) / 27;
    const grossYds = +(netYds * 1.10).toFixed(2);
    const b80 = Math.ceil((netYds * 27 * 1.10) / 0.60);
    const b60 = Math.ceil((netYds * 27 * 1.10) / 0.45);
    const truck = Math.round(Math.max(1, Math.ceil(grossYds * 2) / 2) * 168 + (grossYds < 9 ? 185 : 0));
    return `<tr>
      <td data-label="Slab Thickness" data-sort="${t}"><strong>${t} Inches</strong>${t === s.thicknessIn ? ' (Selected)' : ''}</td>
      <td data-label="Cubic Yards (+10%)" data-sort="${grossYds}">${grossYds} yd³</td>
      <td data-label="80 lb Bags" data-sort="${b80}">${b80} bags</td>
      <td data-label="60 lb Bags" data-sort="${b60}">${b60} bags</td>
      <td data-label="Ready-Mix Est." data-sort="${truck}">$${truck.toLocaleString()}</td>
    </tr>`;
  }).join('');

  const faqs = [
    { q: `How many cubic yards of concrete do I need for a ${s.lengthFt}x${s.widthFt} slab at ${s.thicknessIn} inches thick?`, a: `A ${s.lengthFt}×${s.widthFt} (${s.areaSqFt} sq ft) ${s.variantType.toLowerCase()} requires ${s.netCubicYards} net cubic yards. Adding the standard 10% subgrade/spillage waste allowance brings your order to ${s.grossCubicYards} cubic yards (${s.readyMixOrderYds} yards from a ready-mix truck).` },
    { q: `How many 80 lb bags of concrete for a ${s.lengthFt}x${s.widthFt} slab?`, a: `Because each 80 lb bag of pre-mixed concrete yields 0.60 cubic feet, you need ${s.bags80} bags of 80 lb concrete (${s.pallets80} pallets) or ${s.bags60} bags of 60 lb concrete including 10% waste.` },
    { q: `Is a ready-mix truck or bagged concrete cheaper for a ${s.lengthFt}x${s.widthFt} pour?`, a: `Bagged 80 lb concrete costs roughly $${s.bagCost80.toLocaleString()} for materials alone, whereas ordering ${s.readyMixOrderYds} cubic yards via ready-mix truck costs roughly $${s.readyMixCost.toLocaleString()} (including ${s.shortLoadFee ? '$185 short-load fee' : 'full-load pricing'}). Our recommended method: ${s.winnerMethod}.` }
  ];

  const mainHtml = `
    <section id="hero-panel" class="hero-card">
      <h1>${escapeHtml(s.title)}</h1>
      <p class="hero-sub">Exact ACI 318 concrete volume, <strong>80 lb / 60 lb bag pallet count</strong>, #4 rebar grid, 4" #57 gravel sub-base, and Ready-Mix Truck vs. Bagged cost breakdown for a <strong>${s.lengthFt}' × ${s.widthFt}' (${s.areaSqFt} sq ft)</strong> ${escapeHtml(s.useCase)}.</p>
      <div class="kpi-grid">
        <div class="kpi-box highlight"><div class="kpi-label">Concrete Needed (+10%)</div><div class="kpi-val" id="out-yards">${s.grossCubicYards} yd³</div><div class="kpi-sub">Net: ${s.netCubicYards} yd³ (${s.psiRecommended} PSI)</div></div>
        <div class="kpi-box"><div class="kpi-label">80 lb Bags Needed</div><div class="kpi-val" id="out-bags80">${s.bags80} bags</div><div class="kpi-sub">${s.pallets80} pallets (~$${s.bagCost80.toLocaleString()})</div></div>
        <div class="kpi-box"><div class="kpi-label">60 lb Bags Needed</div><div class="kpi-val" id="out-bags60">${s.bags60} bags</div><div class="kpi-sub">${s.pallets60} pallets (0.45 cu ft/bag)</div></div>
        <div class="kpi-box"><div class="kpi-label">Ready-Mix Truck Est.</div><div class="kpi-val" id="out-truck-cost">$${s.readyMixCost.toLocaleString()}</div><div class="kpi-sub">${s.readyMixOrderYds} yd³ order (${s.winnerMethod})</div></div>
      </div>
    </section>

    <section class="card isolated-widget" id="slab-calculator" data-mode="slab">
      <h2 style="margin-top:0">Live Interactive Concrete Slab &amp; Cost Calculator</h2>
      <div class="calc-grid">
        <div class="field"><label for="inp-length">Length (Feet)</label><input id="inp-length" type="number" min="1" max="200" value="${s.lengthFt}"></div>
        <div class="field"><label for="inp-width">Width (Feet)</label><input id="inp-width" type="number" min="1" max="200" value="${s.widthFt}"></div>
        <div class="field"><label for="inp-thickness">Slab Thickness (Inches)</label><input id="inp-thickness" type="number" min="2" max="24" step="0.5" value="${s.thicknessIn}"></div>
        <div class="field"><label for="inp-waste">Waste / Uneven Grade (%)</label><input id="inp-waste" type="number" min="0" max="25" value="10"></div>
      </div>
      <div class="toggle-row">
        <label class="toggle-pill"><input id="chk-mono" type="checkbox" ${s.hasThickenedEdge ? 'checked' : ''}> Add 12"×12" Monolithic Thickened Perimeter Edge (+${+(s.perimeterFt * (8 / 12) / 27).toFixed(2)} yd³)</label>
      </div>
      <div id="out-verdict" class="alert-banner"></div>
      <div class="kpi-grid">
        <div class="kpi-box"><div class="kpi-label">#4 Rebar (18" O.C. Grid)</div><div class="kpi-val" id="out-rebar">${s.rebarSticks20ft} sticks</div><div class="kpi-sub">${s.rebarLinearFt} LF (20-ft sticks)</div></div>
        <div class="kpi-box"><div class="kpi-label">4" #57 Gravel Sub-Base</div><div class="kpi-val" id="out-gravel">${s.gravelTons} Tons</div><div class="kpi-sub">${s.gravelCubicYards} cu yds compacted</div></div>
        <div class="kpi-box"><div class="kpi-label">80 lb Bag Cost Est.</div><div class="kpi-val" id="out-bag-cost">$${s.bagCost80.toLocaleString()}</div><div class="kpi-sub">@ $5.65 / 80 lb bag</div></div>
        <div class="kpi-box"><div class="kpi-label">2×4 / 2×6 Form Boards</div><div class="kpi-val">${s.formBoards16ft} boards</div><div class="kpi-sub">16-ft lumber (${s.perimeterFt} LF)</div></div>
      </div>
      ${renderSlabSvg(s.lengthFt, s.widthFt, s.thicknessIn, s.hasThickenedEdge, s.grossCubicYards, s.bags80)}
      ${renderAffiliateCards('slab', s.bags80, s.rebarSticks20ft, s.gravelTons)}
    </section>

    <div class="ad-slot ad-incontent" data-refresh="true" aria-label="In-Content Advertisement">
      <span>In-Content Display Ad Unit (336×280 / Responsive)</span>
    </div>

    <section class="card deferred-section" id="material-bom">
      <h2 style="margin-top:0">${s.lengthFt}×${s.widthFt} Slab Thickness Comparison Matrix (4" vs 5" vs 6" vs 8")</h2>
      <div class="table-container">
        <table data-sortable>
          <thead><tr>
            <th aria-sort="none"><button class="sort-btn" type="button">Thickness ↕</button></th>
            <th aria-sort="none"><button class="sort-btn" type="button">Cubic Yards ↕</button></th>
            <th aria-sort="none"><button class="sort-btn" type="button">80 lb Bags ↕</button></th>
            <th aria-sort="none"><button class="sort-btn" type="button">60 lb Bags ↕</button></th>
            <th aria-sort="none"><button class="sort-btn" type="button">Ready-Mix Est. ↕</button></th>
          </tr></thead>
          <tbody>${thicknessRows}</tbody>
        </table>
      </div>
    </section>

    <section class="card deferred-section">
      <h2 style="margin-top:0">Other ${s.lengthFt}×${s.widthFt} Slab Specs &amp; Related Sizes</h2>
      <div class="link-grid">
        ${[...siblings, ...nearby].map(n => `<a class="link-chip" href="/slabs/${n.slug}/">${escapeHtml(n.shortLabel)}<small>${n.grossCubicYards} yd³ • ${n.bags80} bags</small></a>`).join('')}
      </div>
    </section>

    <section class="card deferred-section">
      <h2 style="margin-top:0">Frequently Asked Questions</h2>
      ${faqs.map(f => `<div class="faq-item"><h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p></div>`).join('')}
    </section>`;

  const html = renderLayout({
    title: s.title,
    description: `Exact concrete calculator for a ${s.lengthFt}x${s.widthFt} ${s.variantType}: ${s.grossCubicYards} cubic yards, ${s.bags80} 80lb bags, ${s.rebarSticks20ft} rebar sticks, and ${s.gravelTons} tons of #57 gravel base.`,
    canonicalPath: url,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Concrete Slabs', url: '/#slabs' }, { name: s.shortLabel, url }],
    jsonLdGraph: [
      { '@type': 'WebApplication', name: s.title, url: `${SITE_URL}${url}`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any' },
      buildDatasetSchema(s.title, `Concrete cubic yards, 80lb/60lb bag counts, rebar grid, and gravel sub-base data for ${s.shortLabel}`, url),
      { '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Concrete Slabs', item: `${SITE_URL}/#slabs` },
        { '@type': 'ListItem', position: 3, name: s.shortLabel, item: `${SITE_URL}${url}` }
      ]}
    ],
    mainHtml,
    sidebarLinks: defaultSidebar
  });
  writePage(`slabs/${s.slug}/index.html`, html);
}

// --- 2. Build 52 High-Intent Project Pages ---
for (const p of projects) {
  const url = `/projects/${p.slug}/`;
  const related = projects.filter(x => x.category === p.category && x.slug !== p.slug).slice(0, 6);
  const faqs = [
    { q: `How many yards of concrete for a ${p.name}?`, a: `A ${p.lengthFt}' × ${p.widthFt}' pour at ${p.thicknessIn} inches thick${p.hasThickenedEdge ? ' with a 12" thickened perimeter edge' : ''} requires ${p.grossCubicYards} cubic yards including 10% waste (${p.bags80} bags of 80 lb concrete).` },
    { q: `What PSI concrete should I order for ${p.name}?`, a: `We recommend ${p.psiRecommended} PSI structural concrete (air-entrained in freeze-thaw zones) reinforced with #4 rebar on 18-inch centers (${p.rebarSticks20ft} × 20-ft sticks) over ${p.gravelTons} tons of compacted #57 stone.` }
  ];

  const mainHtml = `
    <section id="hero-panel" class="hero-card">
      <h1>${escapeHtml(p.name)}: Concrete Yards, Bags &amp; Rebar Spec</h1>
      <p class="hero-sub">Category: <strong>${escapeHtml(p.category)}</strong> • Recommended Mix: <strong>${p.psiRecommended} PSI</strong> • Footprint: <strong>${p.lengthFt}' × ${p.widthFt}' (${p.areaSqFt} sq ft)</strong>.</p>
      <div class="alert-banner ok"><strong>Structural Engineer Field Note:</strong> ${escapeHtml(p.engineeringNote)}</div>
      <div class="kpi-grid">
        <div class="kpi-box highlight"><div class="kpi-label">Concrete Volume (+10%)</div><div class="kpi-val" id="out-yards">${p.grossCubicYards} yd³</div><div class="kpi-sub">Order ${p.readyMixOrderYds} yd³ ready-mix</div></div>
        <div class="kpi-box"><div class="kpi-label">80 lb Bags Needed</div><div class="kpi-val" id="out-bags80">${p.bags80} bags</div><div class="kpi-sub">${p.pallets80} pallets (~$${p.bagCost80.toLocaleString()})</div></div>
        <div class="kpi-box"><div class="kpi-label">#4 Rebar (20ft Sticks)</div><div class="kpi-val" id="out-rebar">${p.rebarSticks20ft} sticks</div><div class="kpi-sub">${p.rebarLinearFt} linear feet</div></div>
        <div class="kpi-box"><div class="kpi-label">4" #57 Gravel Sub-Base</div><div class="kpi-val" id="out-gravel">${p.gravelTons} Tons</div><div class="kpi-sub">${p.gravelCubicYards} cu yds compacted</div></div>
      </div>
    </section>

    <section class="card isolated-widget" id="slab-calculator" data-mode="slab">
      <h2 style="margin-top:0">Customize Your ${escapeHtml(p.name)} Dimensions</h2>
      <div class="calc-grid">
        <div class="field"><label for="inp-length">Length (Feet)</label><input id="inp-length" type="number" min="1" max="200" value="${p.lengthFt}"></div>
        <div class="field"><label for="inp-width">Width (Feet)</label><input id="inp-width" type="number" min="1" max="200" value="${p.widthFt}"></div>
        <div class="field"><label for="inp-thickness">Thickness (Inches)</label><input id="inp-thickness" type="number" min="2" max="24" step="0.5" value="${p.thicknessIn}"></div>
        <div class="field"><label for="inp-waste">Waste (%)</label><input id="inp-waste" type="number" min="0" max="25" value="10"></div>
      </div>
      <div class="toggle-row">
        <label class="toggle-pill"><input id="chk-mono" type="checkbox" ${p.hasThickenedEdge ? 'checked' : ''}> Include 12"×12" Monolithic Thickened Perimeter Edge</label>
      </div>
      <div id="out-verdict" class="alert-banner"></div>
      <div class="kpi-grid">
        <div class="kpi-box"><div class="kpi-label">60 lb Bags</div><div class="kpi-val" id="out-bags60">${p.bags60} bags</div></div>
        <div class="kpi-box"><div class="kpi-label">Ready-Mix Cost Est.</div><div class="kpi-val" id="out-truck-cost">$${p.readyMixCost.toLocaleString()}</div></div>
        <div class="kpi-box"><div class="kpi-label">Bagged Cost Est.</div><div class="kpi-val" id="out-bag-cost">$${p.bagCost80.toLocaleString()}</div></div>
        <div class="kpi-box"><div class="kpi-label">Total Slab Weight</div><div class="kpi-val">${p.weightLbs.toLocaleString()} lbs</div></div>
      </div>
      ${renderSlabSvg(p.lengthFt, p.widthFt, p.thicknessIn, p.hasThickenedEdge, p.grossCubicYards, p.bags80)}
      ${renderAffiliateCards('slab', p.bags80, p.rebarSticks20ft, p.gravelTons)}
    </section>

    <div class="ad-slot ad-incontent" data-refresh="true" aria-label="In-Content Advertisement"><span>In-Content Display Ad Unit (336×280)</span></div>

    <section class="card deferred-section" id="material-bom">
      <h2 style="margin-top:0">Related ${escapeHtml(p.category)} Concrete Projects</h2>
      <div class="link-grid">
        ${related.map(r => `<a class="link-chip" href="/projects/${r.slug}/">${escapeHtml(r.name)}<small>${r.grossCubicYards} yd³ • ${r.bags80} bags</small></a>`).join('')}
      </div>
    </section>

    <section class="card deferred-section">
      <h2 style="margin-top:0">Frequently Asked Questions</h2>
      ${faqs.map(f => `<div class="faq-item"><h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p></div>`).join('')}
    </section>`;

  writePage(`projects/${p.slug}/index.html`, renderLayout({
    title: `${p.name} Concrete Calculator`,
    description: `${p.name}: needs ${p.grossCubicYards} cubic yards (${p.bags80} 80lb bags), ${p.rebarSticks20ft} sticks of #4 rebar, and ${p.gravelTons} tons of compacted #57 stone.`,
    canonicalPath: url,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Concrete Projects', url: '/#projects' }, { name: p.name, url }],
    jsonLdGraph: [
      { '@type': 'WebApplication', name: p.name, url: `${SITE_URL}${url}`, applicationCategory: 'UtilitiesApplication' },
      buildDatasetSchema(p.name, p.engineeringNote, url),
      { '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
    ],
    mainHtml,
    sidebarLinks: defaultSidebar
  }));
}

// --- 3. Build 60 Sonotube & Continuous Footing Pages ---
for (const f of footings) {
  const url = `/footings/${f.slug}/`;
  const related = footings.filter(x => x.footingType === f.footingType && x.slug !== f.slug).slice(0, 8);
  const isTube = f.footingType.includes('Sonotube');

  const mainHtml = `
    <section id="hero-panel" class="hero-card">
      <h1>${escapeHtml(f.title)}</h1>
      <p class="hero-sub">Type: <strong>${escapeHtml(f.footingType)}</strong> • Typical Application: <strong>${escapeHtml(f.recommendedPostSize)}</strong> • Rebar Spec: <strong>${escapeHtml(f.rebarSpec)}</strong>.</p>
      <div class="kpi-grid">
        <div class="kpi-box highlight"><div class="kpi-label">80 lb Bags Needed (+10%)</div><div class="kpi-val" id="out-bags80">${f.bags80} bags</div><div class="kpi-sub">${isTube ? `${f.bags80PerHole} bags per hole` : `${f.pallets80} pallets`}</div></div>
        <div class="kpi-box"><div class="kpi-label">60 lb Bags Needed</div><div class="kpi-val" id="out-bags60">${f.bags60} bags</div><div class="kpi-sub">0.45 cu ft yield/bag</div></div>
        <div class="kpi-box"><div class="kpi-label">Total Cubic Yards</div><div class="kpi-val" id="out-yards">${f.grossCubicYards} yd³</div><div class="kpi-sub">${f.grossCubicFt} cu ft gross</div></div>
        <div class="kpi-box"><div class="kpi-label">Bagged Material Cost</div><div class="kpi-val" id="out-bag-cost">$${f.bagCost80.toLocaleString()}</div><div class="kpi-sub">@ $5.65 / 80 lb bag</div></div>
      </div>
    </section>

    <section class="card isolated-widget" id="slab-calculator" data-mode="footing">
      <h2 style="margin-top:0">Live Sonotube Pier &amp; Footing Bag Calculator</h2>
      <div class="calc-grid">
        <div class="field"><label for="inp-width">Tube Diameter (Inches)</label><input id="inp-width" type="number" min="4" max="36" value="${f.diameterIn}"></div>
        <div class="field"><label for="inp-thickness">Hole Depth (Inches)</label><input id="inp-thickness" type="number" min="12" max="96" value="${f.depthIn}"></div>
        <div class="field"><label for="inp-count">Number of Piers / Holes</label><input id="inp-count" type="number" min="1" max="100" value="${f.postCount}"></div>
        <div class="field"><label for="inp-waste">Over-Dig Waste (%)</label><input id="inp-waste" type="number" min="0" max="25" value="10"></div>
      </div>
      <div id="out-verdict" class="alert-banner ok"></div>
      ${renderAffiliateCards('footing', f.bags80, 8, 1)}
    </section>

    <div class="ad-slot ad-incontent" data-refresh="true" aria-label="In-Content Advertisement"><span>In-Content Display Ad Unit (336×280)</span></div>

    <section class="card deferred-section" id="material-bom">
      <h2 style="margin-top:0">Related Sonotube &amp; Footing Calculators</h2>
      <div class="link-grid">
        ${related.map(r => `<a class="link-chip" href="/footings/${r.slug}/">${escapeHtml(r.shortLabel)}<small>${r.bags80} × 80 lb bags • ${r.grossCubicYards} yd³</small></a>`).join('')}
      </div>
    </section>`;

  writePage(`footings/${f.slug}/index.html`, renderLayout({
    title: f.title,
    description: `${f.shortLabel} concrete calculator: ${f.bags80} bags of 80lb concrete (${f.bags60} 60lb bags / ${f.grossCubicYards} cubic yards) including 10% waste.`,
    canonicalPath: url,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Footings & Sonotubes', url: '/#footings' }, { name: f.shortLabel, url }],
    jsonLdGraph: [
      { '@type': 'WebApplication', name: f.title, url: `${SITE_URL}${url}`, applicationCategory: 'UtilitiesApplication' },
      buildDatasetSchema(f.title, `Concrete bag and cubic yard yield dataset for ${f.shortLabel}`, url)
    ],
    mainHtml,
    sidebarLinks: defaultSidebar
  }));
}

// --- 4. Build 40 Gravel Tonnage & Driveway Pages ---
for (const g of gravel) {
  const url = `/gravel/${g.slug}/`;
  const related = gravel.filter(x => x.slug !== g.slug).slice(0, 8);

  const mainHtml = `
    <section id="hero-panel" class="hero-card">
      <h1>${escapeHtml(g.title)}</h1>
      <p class="hero-sub">Aggregate Spec: <strong>${escapeHtml(g.materialName)}</strong> • Density: <strong>${g.densityTonsPerYard} Tons/yd³</strong> • Coverage Area: <strong>${g.areaSqFt.toLocaleString()} sq ft</strong> at <strong>${g.depthIn}" compacted depth</strong>.</p>
      <div class="kpi-grid">
        <div class="kpi-box highlight"><div class="kpi-label">Gravel Tons (+15% Compaction)</div><div class="kpi-val" id="out-gravel">${g.grossTons} Tons</div><div class="kpi-sub">${g.grossLbs.toLocaleString()} lbs total weight</div></div>
        <div class="kpi-box"><div class="kpi-label">Cubic Yards Needed</div><div class="kpi-val" id="out-yards">${g.grossCubicYards} yd³</div><div class="kpi-sub">Net loose: ${g.netCubicYards} yd³</div></div>
        <div class="kpi-box"><div class="kpi-label">Dump Truck Loads</div><div class="kpi-val" id="out-rebar">${g.tandemTruckLoads15Ton} loads</div><div class="kpi-sub">15-ton tandem-axle truck</div></div>
        <div class="kpi-box"><div class="kpi-label">Delivered Cost Est.</div><div class="kpi-val" id="out-truck-cost">$${g.totalDeliveredCost.toLocaleString()}</div><div class="kpi-sub">Material $${g.bulkMaterialCost} + $${g.deliveryFee} haul</div></div>
      </div>
    </section>

    <section class="card isolated-widget" id="slab-calculator" data-mode="gravel">
      <h2 style="margin-top:0">Live Driveway Gravel &amp; #57 Crushed Stone Tonnage Calculator</h2>
      <div class="calc-grid">
        <div class="field"><label for="inp-length">Length (Feet)</label><input id="inp-length" type="number" min="1" max="1000" value="${g.lengthFt}"></div>
        <div class="field"><label for="inp-width">Width (Feet)</label><input id="inp-width" type="number" min="1" max="200" value="${g.widthFt}"></div>
        <div class="field"><label for="inp-thickness">Depth (Inches)</label><input id="inp-thickness" type="number" min="1" max="36" value="${g.depthIn}"></div>
        <div class="field"><label for="inp-density">Stone Material Density</label>
          <select id="inp-density">
            <option value="1.40" ${g.densityTonsPerYard === 1.40 ? 'selected' : ''}>#57 Crushed Stone (1.40 T/yd³)</option>
            <option value="1.45" ${g.densityTonsPerYard >= 1.42 ? 'selected' : ''}>Crusher Run / Road Base (1.45 T/yd³)</option>
            <option value="1.35" ${g.densityTonsPerYard <= 1.38 ? 'selected' : ''}>Pea Gravel / River Rock (1.35 T/yd³)</option>
            <option value="1.50">Decomposed Granite Fines (1.50 T/yd³)</option>
          </select>
        </div>
        <div class="field"><label for="inp-waste">Compaction Factor (%)</label><input id="inp-waste" type="number" min="0" max="25" value="15"></div>
      </div>
      <div id="out-verdict" class="alert-banner ok"></div>
      <div class="kpi-grid">
        <div class="kpi-box"><div class="kpi-label">Equivalent 50 lb Bags</div><div class="kpi-val" id="out-bags80">${g.bags50lb} bags</div><div class="kpi-sub">0.5 cu ft retail bags</div></div>
      </div>
      ${renderAffiliateCards('gravel', 0, 0, g.grossTons)}
    </section>

    <div class="ad-slot ad-incontent" data-refresh="true" aria-label="In-Content Advertisement"><span>In-Content Display Ad Unit (336×280)</span></div>

    <section class="card deferred-section" id="gravel-checklist">
      <h2 style="margin-top:0">Related Driveway &amp; Sub-Base Gravel Calculators</h2>
      <div class="link-grid">
        ${related.map(r => `<a class="link-chip" href="/gravel/${r.slug}/">${escapeHtml(r.shortLabel)}<small>${r.grossTons} Tons • ${r.grossCubicYards} yd³</small></a>`).join('')}
      </div>
    </section>`;

  writePage(`gravel/${g.slug}/index.html`, renderLayout({
    title: g.title,
    description: `Calculate tons of gravel for ${g.shortLabel}: ${g.grossTons} tons (${g.grossCubicYards} cubic yards) including 15% compaction factor and dump truck delivery cost.`,
    canonicalPath: url,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Gravel & Stone', url: '/#gravel' }, { name: g.shortLabel, url }],
    jsonLdGraph: [
      { '@type': 'WebApplication', name: g.title, url: `${SITE_URL}${url}`, applicationCategory: 'UtilitiesApplication' },
      buildDatasetSchema(g.title, `Aggregate tonnage and cubic yard coverage dataset for ${g.shortLabel}`, url)
    ],
    mainHtml,
    sidebarLinks: defaultSidebar
  }));
}

// --- 5. Master Homepage (/) + 4 Compliance Pages + 404 ---
const homeMain = `
  <section id="hero-panel" class="hero-card">
    <h1>Concrete Slab Cubic Yards, 80 lb Bag Pallet, Sonotube &amp; Gravel Tonnage Matrix</h1>
    <p class="hero-sub">Instant ACI 318 concrete volume, <strong>Ready-Mix Truck vs. 80 lb Bag cost crossover</strong>, #4 rebar grid spacing, monolithic thickened-edge calculations, and compacted #57 driveway stone tonnage across 241 pre-engineered pages.</p>
    <div class="kpi-grid">
      <div class="kpi-box highlight"><div class="kpi-label">Concrete Volume (+10%)</div><div class="kpi-val" id="out-yards">5.43 yd³</div><div class="kpi-sub">20×20 Slab @ 4" Thick</div></div>
      <div class="kpi-box"><div class="kpi-label">80 lb Bags Needed</div><div class="kpi-val" id="out-bags80">245 bags</div><div class="kpi-sub">45 bags per cubic yard</div></div>
      <div class="kpi-box"><div class="kpi-label">60 lb Bags Needed</div><div class="kpi-val" id="out-bags60">326 bags</div><div class="kpi-sub">60 bags per cubic yard</div></div>
      <div class="kpi-box"><div class="kpi-label">Ready-Mix Cost Est.</div><div class="kpi-val" id="out-truck-cost">$1,109</div><div class="kpi-sub">Incl. short-load fee</div></div>
    </div>
  </section>

  <section class="card isolated-widget" id="slab-calculator" data-mode="slab">
    <h2 style="margin-top:0">Master Concrete Slab, Rebar &amp; Gravel Calculator</h2>
    <div class="calc-grid">
      <div class="field"><label for="inp-length">Length (Feet)</label><input id="inp-length" type="number" min="1" max="200" value="20"></div>
      <div class="field"><label for="inp-width">Width (Feet)</label><input id="inp-width" type="number" min="1" max="200" value="20"></div>
      <div class="field"><label for="inp-thickness">Thickness (Inches)</label><input id="inp-thickness" type="number" min="2" max="24" step="0.5" value="4"></div>
      <div class="field"><label for="inp-waste">Waste Factor (%)</label><input id="inp-waste" type="number" min="0" max="25" value="10"></div>
    </div>
    <div class="toggle-row">
      <label class="toggle-pill"><input id="chk-mono" type="checkbox"> Include 12"×12" Monolithic Thickened Perimeter Edge</label>
    </div>
    <div id="out-verdict" class="alert-banner"></div>
    <div class="kpi-grid">
      <div class="kpi-box"><div class="kpi-label">#4 Rebar (20ft Sticks)</div><div class="kpi-val" id="out-rebar">33 sticks</div></div>
      <div class="kpi-box"><div class="kpi-label">4" #57 Gravel Sub-Base</div><div class="kpi-val" id="out-gravel">7.96 Tons</div></div>
      <div class="kpi-box"><div class="kpi-label">80 lb Bag Cost</div><div class="kpi-val" id="out-bag-cost">$1,384</div></div>
    </div>
    ${renderSlabSvg(20, 20, 4, false, 5.43, 245)}
  </section>

  <section class="card deferred-section" id="slabs">
    <h2 style="margin-top:0">Popular Concrete Slab Dimensions (84 Pages)</h2>
    <div class="link-grid">
      ${slabs.filter(s => s.thicknessIn === 4 && !s.hasThickenedEdge).map(s => `<a class="link-chip" href="/slabs/${s.slug}/">${escapeHtml(s.shortLabel)}<small>${s.grossCubicYards} yd³ • ${s.bags80} bags</small></a>`).join('')}
    </div>
  </section>

  <section class="card deferred-section" id="projects">
    <h2 style="margin-top:0">Garage, RV Pad, Hot Tub &amp; Pole Barn Concrete Guides (52 Pages)</h2>
    <div class="link-grid">
      ${projects.slice(0, 24).map(p => `<a class="link-chip" href="/projects/${p.slug}/">${escapeHtml(p.name)}<small>${p.grossCubicYards} yd³ • ${p.psiRecommended} PSI</small></a>`).join('')}
    </div>
  </section>

  <section class="card deferred-section" id="footings">
    <h2 style="margin-top:0">Sonotube Deck Piers &amp; Continuous Strip Footings (60 Pages)</h2>
    <div class="link-grid">
      ${footings.slice(0, 24).map(f => `<a class="link-chip" href="/footings/${f.slug}/">${escapeHtml(f.shortLabel)}<small>${f.bags80} × 80 lb bags • ${f.grossCubicYards} yd³</small></a>`).join('')}
    </div>
  </section>

  <section class="card deferred-section" id="gravel">
    <h2 style="margin-top:0">Driveway Gravel, #57 Stone &amp; Sub-Base Tonnage (40 Pages)</h2>
    <div class="link-grid">
      ${gravel.slice(0, 24).map(g => `<a class="link-chip" href="/gravel/${g.slug}/">${escapeHtml(g.shortLabel)}<small>${g.grossTons} Tons • ${g.grossCubicYards} yd³</small></a>`).join('')}
    </div>
  </section>`;

writePage('index.html', renderLayout({
  title: 'Concrete Slab Cubic Yards, 80lb Bags, Sonotube & Gravel Tonnage Calculator',
  description: 'Calculate exact concrete cubic yards, 80lb/60lb bag counts, #4 rebar grids, monolithic edges, Sonotube pier bags, and driveway gravel tonnage.',
  canonicalPath: '/',
  breadcrumbs: [{ name: 'Home', url: '/' }],
  jsonLdGraph: [
    { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/` },
    buildDatasetSchema('SlabYardMatrix Concrete & Aggregate Dataset', 'Verified ACI 318 slab volumes, bag yields, rebar grids, and compacted #57 stone tonnage tables.', '/')
  ],
  mainHtml: homeMain,
  sidebarLinks: defaultSidebar
}));

const compliancePages = [
  { slug: 'about', title: 'Engineering Methodology & Concrete Yield Formulas', body: `<p><strong>${SITE_NAME}</strong> uses industry-standard ACI 318 volumetric formulas: 1 cubic yard = 27 cubic feet, 80 lb pre-mixed bags yield 0.60 cu ft (45 bags/yd³), 60 lb bags yield 0.45 cu ft (60 bags/yd³), and compacted #57 crushed limestone averages 1.40 tons per cubic yard with a 15% plate-compactor settlement factor.</p>` },
  { slug: 'privacy-policy', title: 'Privacy Policy', body: `<p>${SITE_NAME} does not collect or sell personally identifiable information. Third-party advertising partners (including Google AdSense) may use cookies to serve relevant ads based on prior visits. All calculations execute locally in your browser.</p>` },
  { slug: 'terms', title: 'Terms of Use & Engineering Disclaimer', body: `<p>All concrete volumes, rebar spacing recommendations, and gravel tonnage estimates on ${SITE_NAME} are provided for informational planning purposes. Always verify local building codes, frost-line footing depths, and soil bearing capacity with a licensed structural engineer before pouring.</p>` },
  { slug: 'contact', title: 'Contact SlabYardMatrix', body: `<p>Have a custom commercial pour specification or found a local aggregate density variation? Reach our engineering team at <strong>engineering@slabyardmatrix.com</strong>.</p>` }
];

for (const cp of compliancePages) {
  writePage(`${cp.slug}/index.html`, renderLayout({
    title: cp.title,
    description: `${cp.title} for ${SITE_NAME}.`,
    canonicalPath: `/${cp.slug}/`,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: cp.title, url: `/${cp.slug}/` }],
    jsonLdGraph: [{ '@type': 'WebPage', name: cp.title, url: `${SITE_URL}/${cp.slug}/` }],
    mainHtml: `<section id="hero-panel" class="hero-card"><h1>${escapeHtml(cp.title)}</h1>${cp.body}</section>`,
    sidebarLinks: defaultSidebar
  }));
}

writePage('404.html', renderLayout({
  title: 'Page Not Found (404)',
  description: 'The requested concrete or gravel calculator page could not be found.',
  canonicalPath: '/404.html',
  breadcrumbs: [{ name: 'Home', url: '/' }, { name: '404', url: '/404.html' }],
  jsonLdGraph: [{ '@type': 'WebPage', name: '404 Not Found' }],
  mainHtml: `<section id="hero-panel" class="hero-card"><h1>404 — Dimension Not Found</h1><p>Use the search bar above or return to the <a href="/">SlabYardMatrix Master Calculator</a>.</p></section>`,
  sidebarLinks: defaultSidebar
}));

// Sitemap, robots.txt, ads.txt, Cloudflare Headers/Redirects/Wrangler fallback
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(u => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`;
writePage('sitemap.xml', sitemapXml);
writePage('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
writePage('ads.txt', `# Replace pub-0000000000000000 with your Google AdSense Publisher ID\ngoogle.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n`);
writePage('_headers', `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n`);
writePage('_redirects', `/index.html / 301\n`);
writePage('.assetsignore', `wrangler.jsonc\nsrc/\n`);
writePage('wrangler.jsonc', JSON.stringify({ name: 'slabyard-matrix', compatibility_date: '2025-09-27', assets: { directory: './', not_found_handling: '404-page' } }, null, 2));
writePage('src/build.js', `console.log('[SlabYardMatrix] Pre-built static dist assets ready for Cloudflare deployment.');\n`);

console.log(`[SlabYardMatrix SSG] Built ${sitemapUrls.length} static HTML pages (+ 404.html) in dist/!`);

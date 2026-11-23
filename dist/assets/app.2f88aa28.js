/* SlabYardMatrix — Interactive Concrete Slab, Footing & Gravel Calculator + Sortable Tables */
(() => {
  // 1. Adaptive Color-Scheme Toggle via <meta name="color-scheme">
  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  const themeBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('slabyard-theme');
  if (savedTheme && metaScheme) {
    metaScheme.setAttribute('content', savedTheme);
  }
  if (themeBtn && metaScheme) {
    const syncLabel = () => {
      const cur = metaScheme.getAttribute('content');
      themeBtn.textContent = cur === 'dark' ? '☀️ Light' : cur === 'light' ? '🌓 Auto' : '🌙 Dark';
    };
    syncLabel();
    themeBtn.addEventListener('click', () => {
      const cur = metaScheme.getAttribute('content');
      const next = cur === 'light dark' ? 'dark' : cur === 'dark' ? 'light' : 'light dark';
      metaScheme.setAttribute('content', next);
      localStorage.setItem('slabyard-theme', next);
      syncLabel();
    });
  }

  // 2. Global Quick-Jump Search Bar (<search> + <datalist>)
  const jumpInput = document.getElementById('quick-jump');
  if (jumpInput) {
    jumpInput.addEventListener('change', () => {
      const val = jumpInput.value.trim();
      const opts = document.querySelectorAll('#slab-pages-list option');
      for (const opt of opts) {
        if (opt.value === val && opt.dataset.url) {
          window.location.href = opt.dataset.url;
          return;
        }
      }
    });
  }

  // 3. Interactive Concrete & Gravel Calculator Widget
  const calcEl = document.getElementById('slab-calculator');
  if (calcEl) {
    const mode = calcEl.dataset.mode || 'slab'; // 'slab', 'footing', 'gravel'
    const inpL = document.getElementById('inp-length');
    const inpW = document.getElementById('inp-width');
    const inpT = document.getElementById('inp-thickness');
    const inpCount = document.getElementById('inp-count');
    const inpWaste = document.getElementById('inp-waste');
    const chkMono = document.getElementById('chk-mono');
    const inpDensity = document.getElementById('inp-density');

    const outYards = document.getElementById('out-yards');
    const outBags80 = document.getElementById('out-bags80');
    const outBags60 = document.getElementById('out-bags60');
    const outRebar = document.getElementById('out-rebar');
    const outGravel = document.getElementById('out-gravel');
    const outTruckCost = document.getElementById('out-truck-cost');
    const outBagCost = document.getElementById('out-bag-cost');
    const outVerdict = document.getElementById('out-verdict');
    const svgDimText = document.getElementById('svg-dim-label');
    const svgVolText = document.getElementById('svg-vol-label');
    const svgEdgeGroup = document.getElementById('svg-mono-edge');

    const recalc = () => {
      const waste = Math.max(0, Math.min(30, parseFloat(inpWaste?.value || '10'))) / 100;

      if (mode === 'gravel') {
        const l = Math.max(1, parseFloat(inpL?.value || '100'));
        const w = Math.max(1, parseFloat(inpW?.value || '12'));
        const dIn = Math.max(1, parseFloat(inpT?.value || '4'));
        const density = parseFloat(inpDensity?.value || '1.40');

        const netYds = (l * w * (dIn / 12)) / 27;
        const grossYds = netYds * (1 + waste);
        const tons = grossYds * density;
        const loads = (tons / 15).toFixed(1);
        const estCost = Math.round(tons * 42 + (tons <= 15 ? 145 : Math.ceil(tons / 18) * 145));

        if (outYards) outYards.textContent = `${grossYds.toFixed(2)} yd³`;
        if (outGravel) outGravel.textContent = `${tons.toFixed(2)} Tons`;
        if (outBags80) outBags80.textContent = `${Math.ceil((l * w * (dIn / 12) * (1 + waste)) / 0.5)} bags`;
        if (outTruckCost) outTruckCost.textContent = `$${estCost.toLocaleString()}`;
        if (outRebar) outRebar.textContent = `${loads} loads (15-ton)`;
        if (outVerdict) {
          outVerdict.className = 'alert-banner ok';
          outVerdict.innerHTML = `<strong>Compaction & Delivery Check:</strong> Including ${(waste * 100).toFixed(0)}% plate-compactor settlement, order <strong>${tons.toFixed(1)} tons (${grossYds.toFixed(1)} cu yds)</strong>. That equals <strong>${loads} standard tandem-axle dump truck load(s)</strong>.`;
        }
        if (svgDimText) svgDimText.textContent = `${l}' L × ${w}' W × ${dIn}" Deep`;
        if (svgVolText) svgVolText.textContent = `${tons.toFixed(1)} Tons (${grossYds.toFixed(1)} yd³)`;
        return;
      }

      if (mode === 'footing') {
        const diaIn = Math.max(4, parseFloat(inpW?.value || '12'));
        const depthIn = Math.max(6, parseFloat(inpT?.value || '48'));
        const count = Math.max(1, parseInt(inpCount?.value || '6', 10));
        const rFt = (diaIn / 2) / 12;
        const netCuFt = Math.PI * rFt * rFt * (depthIn / 12) * count;
        const grossCuFt = netCuFt * (1 + waste);
        const grossYds = grossCuFt / 27;
        const bags80 = Math.ceil(grossCuFt / 0.60);
        const bags60 = Math.ceil(grossCuFt / 0.45);
        const bagCost = Math.round(bags80 * 5.65);

        if (outYards) outYards.textContent = `${grossYds.toFixed(2)} yd³`;
        if (outBags80) outBags80.textContent = `${bags80} bags`;
        if (outBags60) outBags60.textContent = `${bags60} bags`;
        if (outBagCost) outBagCost.textContent = `$${bagCost.toLocaleString()}`;
        if (outVerdict) {
          const isTruck = grossYds >= 1.75;
          outVerdict.className = isTruck ? 'alert-banner' : 'alert-banner ok';
          outVerdict.innerHTML = isTruck
            ? `<strong>Heavy Pier Volume (${grossYds.toFixed(2)} yd³):</strong> Mixing ${bags80} bags (${(bags80 * 80).toLocaleString()} lbs) by hand takes 4+ hours. Consider a <strong>short-load ready-mix concrete truck</strong>.`
            : `<strong>DIY-Friendly Pour (${bags80} × 80 lb Bags):</strong> ${(bags80 / count).toFixed(1)} bags per Sonotube (${(bags80 / 42).toFixed(1)} pallets total). Ideal for a rented electric barrel mixer.`;
        }
        if (svgDimText) svgDimText.textContent = `${count}× Piers (${diaIn}" Ø × ${depthIn}" Deep)`;
        if (svgVolText) svgVolText.textContent = `${bags80} × 80lb Bags (${grossYds.toFixed(2)} yd³)`;
        return;
      }

      // Default: Concrete Slab Mode
      const l = Math.max(1, parseFloat(inpL?.value || '20'));
      const w = Math.max(1, parseFloat(inpW?.value || '20'));
      const tIn = Math.max(2, parseFloat(inpT?.value || '4'));
      const mono = !!chkMono?.checked;

      const area = l * w;
      const perim = 2 * (l + w);
      const baseCuFt = area * (tIn / 12);
      const edgeCuFt = mono ? perim * 1.0 * (8 / 12) : 0;
      const grossCuFt = (baseCuFt + edgeCuFt) * (1 + waste);
      const grossYds = grossCuFt / 27;

      const bags80 = Math.ceil(grossCuFt / 0.60);
      const bags60 = Math.ceil(grossCuFt / 0.45);
      const pallets = (bags80 / 42).toFixed(1);

      const bagCost = Math.round(bags80 * 5.65);
      const orderYds = Math.max(1, Math.ceil(grossYds * 2) / 2);
      const shortFee = orderYds < 9 ? 185 : 0;
      const truckCost = Math.round(orderYds * 168 + shortFee);

      const rebarFt = Math.ceil(((Math.ceil(w / 1.5) + 1) * l + (Math.ceil(l / 1.5) + 1) * w) * 1.15);
      const rebarSticks = Math.ceil(rebarFt / 20);
      const gravelTons = (((area * (4 / 12)) / 27) * 1.15 * 1.40).toFixed(2);

      if (outYards) outYards.textContent = `${grossYds.toFixed(2)} yd³`;
      if (outBags80) outBags80.textContent = `${bags80} bags`;
      if (outBags60) outBags60.textContent = `${bags60} bags`;
      if (outRebar) outRebar.textContent = `${rebarSticks} sticks`;
      if (outGravel) outGravel.textContent = `${gravelTons} Tons`;
      if (outTruckCost) outTruckCost.textContent = `$${truckCost.toLocaleString()}`;
      if (outBagCost) outBagCost.textContent = `$${bagCost.toLocaleString()}`;

      if (outVerdict) {
        if (grossYds >= 1.75) {
          outVerdict.className = 'alert-banner';
          outVerdict.innerHTML = `<strong>Ready-Mix Truck Trap Alert:</strong> This ${l}'×${w}' pour requires <strong>${bags80} × 80 lb bags (${pallets} pallets / ${(bags80 * 80).toLocaleString()} lbs)</strong> costing ~$${bagCost.toLocaleString()}. Ordering <strong>${orderYds} cu yds ready-mix</strong> (~$${truckCost.toLocaleString()} incl. ${shortFee ? '$185 short-load fee' : 'full-load rate'}) prevents cold joints and saves hours of labor.`;
        } else {
          outVerdict.className = 'alert-banner ok';
          outVerdict.innerHTML = `<strong>80 lb Bag Sweet Spot:</strong> At <strong>${grossYds.toFixed(2)} cu yds (${bags80} bags / ~$${bagCost.toLocaleString()})</strong>, bagged concrete beats a ready-mix truck (~$${truckCost.toLocaleString()} with short-load fee) by <strong>$${Math.max(0, truckCost - bagCost).toLocaleString()}</strong>.`;
        }
      }
      if (svgDimText) svgDimText.textContent = `${l}' × ${w}' × ${tIn}"${mono ? ' + 12" Edge' : ''}`;
      if (svgVolText) svgVolText.textContent = `${grossYds.toFixed(2)} yd³ | ${bags80} Bags`;
      if (svgEdgeGroup) svgEdgeGroup.style.display = mono ? 'inline' : 'none';
    };

    [inpL, inpW, inpT, inpCount, inpWaste, chkMono, inpDensity].forEach(el => {
      if (el) el.addEventListener('input', recalc);
      if (el) el.addEventListener('change', recalc);
    });
    recalc();
  }

  // 4. Sortable Tables using Element.prototype.moveBefore() + View Transitions
  document.querySelectorAll('table[data-sortable]').forEach(table => {
    const tbody = table.querySelector('tbody');
    const headers = table.querySelectorAll('th[aria-sort]');
    headers.forEach((th, colIdx) => {
      const btn = th.querySelector('.sort-btn');
      if (!btn || !tbody) return;
      btn.addEventListener('click', () => {
        const curDir = th.getAttribute('aria-sort');
        const nextDir = curDir === 'ascending' ? 'descending' : 'ascending';
        headers.forEach(h => h.setAttribute('aria-sort', 'none'));
        th.setAttribute('aria-sort', nextDir);

        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort((a, b) => {
          const av = a.children[colIdx]?.dataset.sort ?? a.children[colIdx]?.textContent.trim() ?? '';
          const bv = b.children[colIdx]?.dataset.sort ?? b.children[colIdx]?.textContent.trim() ?? '';
          const an = parseFloat(av.replace(/[^0-9.-]/g, ''));
          const bn = parseFloat(bv.replace(/[^0-9.-]/g, ''));
          const cmp = (!Number.isNaN(an) && !Number.isNaN(bn)) ? an - bn : av.localeCompare(bv);
          return nextDir === 'ascending' ? cmp : -cmp;
        });

        const applyOrder = () => {
          rows.forEach(row => {
            if (typeof tbody.moveBefore === 'function') {
              tbody.moveBefore(row, null);
            } else {
              tbody.append(row);
            }
          });
        };

        if (typeof table.startViewTransition === 'function') {
          table.startViewTransition(applyOrder);
        } else {
          applyOrder();
        }
      });
    });
  });

  // 5. 35-Second Active-View Ad Slot Refresh Engine (Zero CLS)
  const adSlots = document.querySelectorAll('.ad-slot[data-refresh="true"]');
  if (adSlots.length && 'IntersectionObserver' in window) {
    const visibleSlots = new Set();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) visibleSlots.add(e.target);
        else visibleSlots.delete(e.target);
      });
    }, { threshold: 0.5 });
    adSlots.forEach(s => io.observe(s));

    setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      visibleSlots.forEach(slot => {
        const count = parseInt(slot.dataset.impressions || '1', 10) + 1;
        slot.dataset.impressions = String(count);
      });
    }, 35000);
  }
})();

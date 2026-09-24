/* Local assets only. No analytics, remote fonts, or third-party scripts. */
(() => {
  'use strict';
  const data = window.PAPER_DATA;
  if (!data) return;
  const precision = [4, 4, 4, 3, 4];
  const ours = mode => data.tables[mode].find(row => row.ours).values;
  const paired = ours('both');

  /* ── improvement cards ── */
  function setBaseline(mode) {
    const baseline = ours(mode);
    document.querySelectorAll('[data-baseline]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.baseline === mode)));
    [{id:'depth',i:0,u:' mm²'},{id:'angle',i:3,u:'°'},{id:'translation',i:4,u:''}].forEach(({id,i,u}) => {
      document.getElementById(`${id}-improvement`).textContent = (100*(1-paired[i]/baseline[i])).toFixed(1);
      document.getElementById(`${id}-detail`).textContent = `${baseline[i].toFixed(precision[i])}${u} → ${paired[i].toFixed(precision[i])}${u}`;
    });
  }
  document.querySelectorAll('[data-baseline]').forEach(b => b.addEventListener('click', () => setBaseline(b.dataset.baseline)));
  setBaseline('tactile');

  /* ── bar chart (replaces table) ── */
  const metrics = [
    {key: 'Depth MSE', unit: 'mm²', idx: 0, prec: 4},
    {key: 'Angular error', unit: 'degrees', idx: 3, prec: 3},
    {key: 'Translation L₁', unit: 'normalized', idx: 4, prec: 4},
  ];
  const OURS_COLOR = '#2a78d6';
  const BASE_COLOR = '#b3b2a9';
  const BAR_H = 14;
  const GAP = 3;
  const LABEL_W = 120;
  const VALUE_W = 60;
  const CHART_W = 160;
  const COL_GAP = 24;

  function buildChart(mode) {
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    const rows = data.tables[mode];
    const container = document.getElementById('chart-container');
    container.innerHTML = '';

    const totalW = LABEL_W + metrics.length * (CHART_W + VALUE_W + COL_GAP);
    const totalH = 28 + rows.length * (BAR_H + GAP) + 4;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
    svg.setAttribute('width', '100%');
    svg.style.maxWidth = totalW + 'px';
    svg.style.display = 'block';
    svg.style.margin = '0 auto';

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const textColor = isDark ? '#e0e0e0' : '#363636';
    const mutedColor = isDark ? '#999' : '#656565';
    const headerColor = isDark ? '#e0e0e0' : '#222';

    // headers
    metrics.forEach((m, mi) => {
      const x = LABEL_W + mi * (CHART_W + VALUE_W + COL_GAP);
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', x + CHART_W / 2);
      t.setAttribute('y', 10);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '11');
      t.setAttribute('font-weight', '600');
      t.setAttribute('fill', headerColor);
      t.textContent = m.key;
      svg.appendChild(t);
      const u = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      u.setAttribute('x', x + CHART_W / 2);
      u.setAttribute('y', 22);
      u.setAttribute('text-anchor', 'middle');
      u.setAttribute('font-size', '9');
      u.setAttribute('fill', mutedColor);
      u.textContent = m.unit;
      svg.appendChild(u);
    });

    // find max per metric for scaling
    const maxes = metrics.map(m => Math.max(...rows.map(r => r.values[m.idx]).filter(v => v !== null)));

    rows.forEach((row, ri) => {
      const y = 28 + ri * (BAR_H + GAP);
      // label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', LABEL_W - 6);
      label.setAttribute('y', y + BAR_H / 2 + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', textColor);
      if (row.ours) label.setAttribute('font-weight', '700');
      label.textContent = row.name;
      svg.appendChild(label);

      metrics.forEach((m, mi) => {
        const x0 = LABEL_W + mi * (CHART_W + VALUE_W + COL_GAP);
        const val = row.values[m.idx];
        if (val === null) {
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', x0 + CHART_W + 4);
          t.setAttribute('y', y + BAR_H / 2 + 4);
          t.setAttribute('font-size', '10');
          t.setAttribute('fill', mutedColor);
          t.textContent = 'n/a';
          svg.appendChild(t);
          return;
        }
        const w = Math.max(1, (val / maxes[mi]) * CHART_W);
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x0);
        rect.setAttribute('y', y);
        rect.setAttribute('width', w);
        rect.setAttribute('height', BAR_H);
        rect.setAttribute('rx', 2);
        rect.setAttribute('fill', row.ours ? OURS_COLOR : BASE_COLOR);
        svg.appendChild(rect);

        const vt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        vt.setAttribute('x', x0 + w + 4);
        vt.setAttribute('y', y + BAR_H / 2 + 4);
        vt.setAttribute('font-size', '10');
        vt.setAttribute('font-variant-numeric', 'tabular-nums');
        vt.setAttribute('fill', row.ours ? OURS_COLOR : textColor);
        if (row.ours) vt.setAttribute('font-weight', '700');
        vt.textContent = val.toFixed(m.prec);
        svg.appendChild(vt);
      });
    });

    container.appendChild(svg);
  }

  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => buildChart(b.dataset.mode)));
  buildChart('both');

  /* ── figure zoom dialog ── */
  const dialog = document.getElementById('figure-dialog');
  let trigger;
  if (typeof dialog.showModal === 'function') {
    document.querySelectorAll('[data-zoom]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault();
      trigger = link;
      const image = document.getElementById('expanded-figure');
      image.src = link.href;
      image.alt = link.querySelector('img').alt;
      document.getElementById('figure-description').textContent = image.alt;
      dialog.showModal();
      dialog.querySelector('.dialog-scroll').scrollTo(0, 0);
      document.body.classList.add('dialog-open');
    }));
    document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (trigger) trigger.focus();
    });
  }
})();

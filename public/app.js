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

  /* ── bar chart with grow animation ── */
  const metrics = [
    {key: 'Depth MSE', unit: 'mm²', idx: 0, prec: 4},
    {key: 'Angular error', unit: 'degrees', idx: 3, prec: 3},
    {key: 'Translation L₁', unit: 'normalized', idx: 4, prec: 4},
  ];
  const OURS_COLOR = '#2a78d6';
  const BASE_COLOR = '#b3b2a9';
  const BAR_H = 18;
  const GAP = 8;
  const LABEL_W = 140;
  const VALUE_W = 65;
  const CHART_W = 180;
  const COL_GAP = 36;
  const HEADER_H = 36;
  const ANIM_DUR = '0.5s';

  function buildChart(mode) {
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    const rows = data.tables[mode];
    const container = document.getElementById('chart-container');
    container.innerHTML = '';

    const totalW = LABEL_W + metrics.length * (CHART_W + VALUE_W + COL_GAP) - COL_GAP;
    const totalH = HEADER_H + rows.length * (BAR_H + GAP) - GAP + 8;

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
      t.setAttribute('y', 13);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-size', '12');
      t.setAttribute('font-weight', '600');
      t.setAttribute('fill', headerColor);
      t.textContent = m.key;
      svg.appendChild(t);
      const u = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      u.setAttribute('x', x + CHART_W / 2);
      u.setAttribute('y', 27);
      u.setAttribute('text-anchor', 'middle');
      u.setAttribute('font-size', '10');
      u.setAttribute('fill', mutedColor);
      u.textContent = m.unit;
      svg.appendChild(u);
    });

    const maxes = metrics.map(m => Math.max(...rows.map(r => r.values[m.idx]).filter(v => v !== null)));

    rows.forEach((row, ri) => {
      const y = HEADER_H + ri * (BAR_H + GAP);
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', LABEL_W - 8);
      label.setAttribute('y', y + BAR_H / 2 + 5);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '12');
      label.setAttribute('fill', textColor);
      if (row.ours) label.setAttribute('font-weight', '700');
      label.textContent = row.name;
      svg.appendChild(label);

      metrics.forEach((m, mi) => {
        const x0 = LABEL_W + mi * (CHART_W + VALUE_W + COL_GAP);
        const val = row.values[m.idx];
        if (val === null) {
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          t.setAttribute('x', x0 + CHART_W + 6);
          t.setAttribute('y', y + BAR_H / 2 + 5);
          t.setAttribute('font-size', '11');
          t.setAttribute('fill', mutedColor);
          t.textContent = 'n/a';
          svg.appendChild(t);
          return;
        }
        const targetW = Math.max(2, (val / maxes[mi]) * CHART_W);
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x0);
        rect.setAttribute('y', y);
        rect.setAttribute('width', 0);
        rect.setAttribute('height', BAR_H);
        rect.setAttribute('rx', 3);
        rect.setAttribute('fill', row.ours ? OURS_COLOR : BASE_COLOR);
        svg.appendChild(rect);

        // animate the bar growing
        const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        anim.setAttribute('attributeName', 'width');
        anim.setAttribute('from', '0');
        anim.setAttribute('to', String(targetW));
        anim.setAttribute('dur', ANIM_DUR);
        anim.setAttribute('fill', 'freeze');
        anim.setAttribute('begin', `${ri * 0.04}s`);
        anim.setAttribute('calcMode', 'spline');
        anim.setAttribute('keySplines', '0.25 0.1 0.25 1');
        anim.setAttribute('keyTimes', '0;1');
        rect.appendChild(anim);

        const vt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        vt.setAttribute('x', x0 + targetW + 6);
        vt.setAttribute('y', y + BAR_H / 2 + 5);
        vt.setAttribute('font-size', '11');
        vt.setAttribute('font-variant-numeric', 'tabular-nums');
        vt.setAttribute('fill', row.ours ? OURS_COLOR : textColor);
        if (row.ours) vt.setAttribute('font-weight', '700');
        vt.textContent = val.toFixed(m.prec);
        vt.style.opacity = '0';
        vt.style.animation = `fadeIn 0.3s ${ri * 0.04 + 0.3}s forwards`;
        svg.appendChild(vt);
      });
    });

    // inject the fadeIn keyframe if not already present
    if (!document.getElementById('chart-anim-style')) {
      const style = document.createElement('style');
      style.id = 'chart-anim-style';
      style.textContent = '@keyframes fadeIn { to { opacity: 1; } }';
      document.head.appendChild(style);
    }

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

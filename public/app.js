/* Local assets only. No analytics, remote fonts, or third-party scripts. */
(() => {
  'use strict';
  const data = window.PAPER_DATA;
  if (!data) return;
  const labels = {both: 'Paired visual and tactile input', tactile: 'Tactile-only input', visual: 'Visual-only input'};
  const precision = [4, 4, 4, 3, 4];
  const ours = mode => data.tables[mode].find(row => row.ours).values;
  const paired = ours('both');
  function setBaseline(mode) {
    const baseline = ours(mode);
    document.querySelectorAll('[data-baseline]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.baseline === mode)));
    const metrics = [{id: 'depth', index: 0, unit: ' mm²'}, {id: 'angle', index: 3, unit: '°'}, {id: 'translation', index: 4, unit: ''}];
    metrics.forEach(({id, index, unit}) => {
      document.getElementById(`${id}-improvement`).textContent = (100 * (1 - paired[index] / baseline[index])).toFixed(1);
      document.getElementById(`${id}-detail`).textContent = `${baseline[index].toFixed(precision[index])}${unit} → ${paired[index].toFixed(precision[index])}${unit}`;
    });
  }

  function setTable(mode) {
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    document.getElementById('table-caption').textContent = labels[mode];
    const rows = data.tables[mode];
    const minima = precision.map((_, i) => Math.min(...rows.map(row => row.values[i]).filter(value => value !== null)));
    document.getElementById('results-body').replaceChildren(...rows.map(row => {
      const tr = document.createElement('tr');
      if (row.ours) tr.classList.add('ours');
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = row.name + (row.shared ? ' †' : '');
      tr.append(th);
      row.values.forEach((value, i) => {
        const td = document.createElement('td');
        td.textContent = value === null ? '—' : value.toFixed(precision[i]);
        if (mode === 'both' && value !== null && value === minima[i]) td.classList.add('best');
        tr.append(td);
      });
      return tr;
    }));
  }
  document.querySelectorAll('[data-baseline]').forEach(button => button.addEventListener('click', () => setBaseline(button.dataset.baseline)));
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => setTable(button.dataset.mode)));
  setBaseline('tactile');
  setTable('both');

  const copyBtn = document.querySelector('.copy-bibtex');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = copyBtn.closest('.bibtex-block').querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      });
    });
  }

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
    dialog.addEventListener('click', event => {if (event.target === dialog) dialog.close();});
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (trigger) trigger.focus();
    });
  }
})();

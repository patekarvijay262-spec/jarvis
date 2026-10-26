// Chart helpers. Chart.js is loaded globally from index.html; rings and heatmaps are hand-drawn SVG/HTML.
const charts = new Map();
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

export function palette() {
  return {
    body: css('--body'), brain: css('--brain'), mind: css('--mind'), accent: css('--accent'),
    fg: css('--fg'), muted: css('--muted'), grid: css('--grid'), surface: css('--surface'), warn: css('--warn')
  };
}

function base(type, el, data, options = {}) {
  if (!window.Chart) return null;
  const p = palette();
  charts.get(el)?.destroy();
  Chart.defaults.font.family = css('--font-body');
  Chart.defaults.color = p.muted;
  const c = new Chart(el, {
    type, data,
    options: {
      responsive: true, maintainAspectRatio: false, animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 500 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: p.surface, titleColor: p.fg, bodyColor: p.fg, borderColor: p.grid, borderWidth: 1, padding: 10, boxPadding: 4, usePointStyle: true }
      },
      ...options
    }
  });
  charts.set(el, c);
  return c;
}

const axes = (p, { max, suffix = '', stacked = false } = {}) => ({
  x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 12 }, stacked },
  y: { grid: { color: p.grid }, border: { display: false }, beginAtZero: true, max, ticks: { callback: v => v + suffix, maxTicksLimit: 5 }, stacked }
});

function fade(ctx, color) {
  const { chartArea, ctx: c } = ctx.chart;
  if (!chartArea) return color + '22';
  const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, hexA(color, 0.28)); g.addColorStop(1, hexA(color, 0));
  return g;
}

export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function lines(el, labels, series, opts = {}) {
  const p = palette();
  return base('line', el, {
    labels,
    datasets: series.map((s, i) => ({
      label: s.name, data: s.data, borderColor: s.color, borderWidth: s.width || 2.2, tension: 0.35,
      pointRadius: ctx => ctx.dataIndex === s.data.length - 1 ? 4 : 0, pointBackgroundColor: s.color, pointHoverRadius: 5,
      fill: s.fill ? { target: 'origin' } : false, backgroundColor: ctx => fade(ctx, s.color), borderDash: s.dash || [], spanGaps: true
    }))
  }, { scales: axes(p, { max: opts.max, suffix: opts.suffix || '' }) });
}

export function barsWithTarget(el, labels, data, target, color, suffix = '') {
  const p = palette();
  return base('bar', el, {
    labels,
    datasets: [
      { type: 'line', label: 'Target', data: labels.map(() => target), borderColor: p.muted, borderDash: [4, 4], borderWidth: 1.2, pointRadius: 0 },
      { label: 'Logged', data, backgroundColor: data.map(v => v >= target ? color : hexA(color, 0.45)), borderRadius: 6, maxBarThickness: 26 }
    ]
  }, { scales: axes(p, { suffix }) });
}

export function stacked(el, labels, series) {
  const p = palette();
  return base('bar', el, {
    labels,
    datasets: series.map(s => ({ label: s.name, data: s.data, backgroundColor: s.color, borderRadius: 4, maxBarThickness: 26 }))
  }, { scales: axes(p, { suffix: 'm', stacked: true }), plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 14 } }, tooltip: { backgroundColor: p.surface, titleColor: p.fg, bodyColor: p.fg, borderColor: p.grid, borderWidth: 1 } } });
}

export function radar(el, labels, sets) {
  const p = palette();
  return base('radar', el, {
    labels,
    datasets: sets.map(s => ({ label: s.name, data: s.data, borderColor: s.color, backgroundColor: hexA(s.color, 0.18), borderWidth: 2, pointRadius: 3, pointBackgroundColor: s.color, borderDash: s.dash || [] }))
  }, {
    interaction: { mode: 'nearest', intersect: false },
    scales: { r: { min: 0, max: 100, angleLines: { color: p.grid }, grid: { color: p.grid }, pointLabels: { color: p.fg, font: { size: 12, weight: '600' } }, ticks: { display: false, stepSize: 25 } } },
    plugins: { legend: { display: true, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 14 } } }
  });
}

// SVG score ring.
export function ring(value, color, size = 120, stroke = 10, label = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${label} ${value} out of 100">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
      stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})" class="ring-arc"/>
  </svg>`;
}

// GitHub-style habit heatmap (weeks as columns).
export function heatmap(keys, valueFor, color) {
  const cells = keys.map(k => {
    const v = valueFor(k);
    const a = v <= 0 ? 0 : v < 0.34 ? 0.35 : v < 0.67 ? 0.65 : 1;
    const d = new Date(k + 'T12:00:00');
    return `<i title="${d.toLocaleDateString([], { day: 'numeric', month: 'short' })}${v > 0 ? ' · done' : ''}" style="${a ? `background:${hexA(color, a)}` : ''}"></i>`;
  });
  return `<div class="heat">${cells.join('')}</div>`;
}

export function spark(values, color, w = 96, h = 28) {
  const v = values.map(x => x ?? 0);
  if (v.length < 2) return '';
  const max = Math.max(100, ...v), step = w / (v.length - 1);
  const pts = v.map((x, i) => `${(i * step).toFixed(1)},${(h - 2 - (x / max) * (h - 4)).toFixed(1)}`);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
    <polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts.at(-1).split(',')[0]}" cy="${pts.at(-1).split(',')[1]}" r="2.6" fill="${color}"/></svg>`;
}

export function refreshAll() { charts.forEach(c => c.update()); }

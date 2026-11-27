// HearthLedger charts: small SVG builders drawn from live state.
// One job only — turning category numbers into pictures. No library, no
// images: every chart is inline SVG generated from the figures on the page,
// so when a budget changes in the planner the dashboard chart moves too.

const CHART_COLOURS = [
  '#1e6f5c', '#e8a33d', '#4a7fb5', '#b5542d', '#7a5ea8', '#3d9970',
  '#c9758a', '#5b8c5a', '#8a6d3b', '#546e7a', '#946b00', '#6a8caf', '#a85d7a',
];

// Donut of spending by category. slices: [{label, value}] with value > 0.
// Returns an SVG string with a hole showing the total in the middle.
function donutChart(slices, total) {
  const size = 240, cx = size / 2, cy = size / 2, r = 96, hole = 58;
  const usable = slices.filter((s) => s.value > 0);
  let angle = -Math.PI / 2;
  let paths = '';
  usable.forEach((s, i) => {
    const sweep = (s.value / total) * Math.PI * 2;
    const a0 = angle, a1 = angle + sweep;
    angle = a1;
    const large = sweep > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const hx1 = cx + hole * Math.cos(a1), hy1 = cy + hole * Math.sin(a1);
    const hx0 = cx + hole * Math.cos(a0), hy0 = cy + hole * Math.sin(a0);
    const colour = CHART_COLOURS[i % CHART_COLOURS.length];
    paths += '<path d="M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) +
      ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) +
      ' L ' + hx1.toFixed(1) + ' ' + hy1.toFixed(1) +
      ' A ' + hole + ' ' + hole + ' 0 ' + large + ' 0 ' + hx0.toFixed(1) + ' ' + hy0.toFixed(1) +
      ' Z" fill="' + colour + '"><title>' + s.label + ': ' + formatRp(s.value) + '</title></path>';
  });
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" class="donut" role="img" aria-label="Spending by category">' +
    paths +
    '<text x="' + cx + '" y="' + (cy - 6) + '" class="donut-total">' + formatRpShort(total) + '</text>' +
    '<text x="' + cx + '" y="' + (cy + 16) + '" class="donut-sub">spent so far</text></svg>';
}

// Legend rows matching the donut's colours, with each slice's share.
function donutLegend(slices, total) {
  const usable = slices.filter((s) => s.value > 0);
  return usable.map((s, i) =>
    '<li><span class="swatch" style="background:' + CHART_COLOURS[i % CHART_COLOURS.length] + '"></span>' +
    '<span class="legend-label">' + s.label + '</span>' +
    '<span class="legend-value">' + formatRpShort(s.value) + ' · ' + formatPct(s.value, total) + '</span></li>'
  ).join('');
}

// One spent-vs-budget progress bar. Over 100% turns red and says so.
function progressBar(spent, budget) {
  const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
  const over = spent > budget;
  return '<div class="bar' + (over ? ' bar-over' : '') + '"><span style="width:' + pct.toFixed(1) + '%"></span></div>';
}

// A plain labelled bar used for the 50/30/20 comparison rows.
function splitBar(label, actualPct, targetPct, colour) {
  const w = Math.min(100, actualPct);
  return '<div class="split-row">' +
    '<span class="split-label">' + label + '</span>' +
    '<div class="bar split-bar"><span style="width:' + w.toFixed(1) + '%;background:' + colour + '"></span>' +
    '<i class="split-target" style="left:' + targetPct + '%" title="Target ' + targetPct + '%"></i></div>' +
    '<span class="split-value">' + Math.round(actualPct) + '% <small>of income · target ' + targetPct + '%</small></span></div>';
}

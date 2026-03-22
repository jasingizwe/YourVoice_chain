const fs = require('fs');
const path = require('path');

const outDir = __dirname;

function readCsv(file) {
  const text = fs.readFileSync(path.join(outDir, file), 'utf8').trim();
  const [header, ...rows] = text.split(/\r?\n/);
  const cols = header.split(',');
  return rows.map(line => {
    const parts = line.split(',');
    const obj = {};
    cols.forEach((c, i) => (obj[c] = parts[i]));
    return obj;
  });
}

function svgWrap(width, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
}

function writeSvg(name, svg) {
  fs.writeFileSync(path.join(outDir, name), svg, 'utf8');
}

function barChart({ data, labels, series, colors, width = 720, height = 360, title }) {
  const padding = { top: 40, right: 20, bottom: 60, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const max = Math.max(...data.flatMap(d => series.map(s => Number(d[s]))), 1);
  const groupW = chartW / data.length;
  const barW = Math.max(groupW / series.length - 6, 6);

  let content = '';
  content += `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`;
  content += `<text x="${width / 2}" y="24" text-anchor="middle" font-size="16" fill="#1a202c">${title}</text>`;

  // axes
  content += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="#94a3b8"/>`;
  content += `<line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="#94a3b8"/>`;

  data.forEach((d, i) => {
    series.forEach((s, j) => {
      const val = Number(d[s]);
      const h = (val / max) * chartH;
      const x = padding.left + i * groupW + j * (barW + 6);
      const y = padding.top + chartH - h;
      const color = colors[j % colors.length];
      content += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${color}"/>`;
    });
    const label = labels(d, i);
    content += `<text x="${padding.left + i * groupW + groupW / 2}" y="${padding.top + chartH + 20}" text-anchor="middle" font-size="10" fill="#475569">${label}</text>`;
  });

  // legend
  series.forEach((s, i) => {
    const x = padding.left + i * 140;
    const y = height - 10;
    content += `<rect x="${x}" y="${y - 10}" width="10" height="10" fill="${colors[i % colors.length]}"/>`;
    content += `<text x="${x + 14}" y="${y}" font-size="10" fill="#475569">${s}</text>`;
  });

  return svgWrap(width, height, content);
}

function lineChart({ data, labels, series, colors, width = 720, height = 360, title }) {
  const padding = { top: 40, right: 20, bottom: 60, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const max = Math.max(...data.flatMap(d => series.map(s => Number(d[s]))), 1);

  let content = '';
  content += `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>`;
  content += `<text x="${width / 2}" y="24" text-anchor="middle" font-size="16" fill="#1a202c">${title}</text>`;
  content += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="#94a3b8"/>`;
  content += `<line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="#94a3b8"/>`;

  series.forEach((s, si) => {
    let path = '';
    data.forEach((d, i) => {
      const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
      const val = Number(d[s]);
      const y = padding.top + chartH - (val / max) * chartH;
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      content += `<circle cx="${x}" cy="${y}" r="3" fill="${colors[si % colors.length]}"/>`;
    });
    content += `<path d="${path}" fill="none" stroke="${colors[si % colors.length]}" stroke-width="2"/>`;
  });

  data.forEach((d, i) => {
    const label = labels(d, i);
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    content += `<text x="${x}" y="${padding.top + chartH + 20}" text-anchor="middle" font-size="10" fill="#475569">${label}</text>`;
  });

  series.forEach((s, i) => {
    const x = padding.left + i * 140;
    const y = height - 10;
    content += `<rect x="${x}" y="${y - 10}" width="10" height="10" fill="${colors[i % colors.length]}"/>`;
    content += `<text x="${x + 14}" y="${y}" font-size="10" fill="#475569">${s}</text>`;
  });

  return svgWrap(width, height, content);
}

// Evidence preservation
const evidence = readCsv('evidence_daily.csv');
writeSvg(
  'fig5_2_evidence_preservation.svg',
  barChart({
    data: evidence,
    labels: d => d.day,
    series: ['total', 'ipfs_pinned', 'anchored'],
    colors: ['#c8c3b6', '#5cbf9a', '#5a89c8'],
    title: 'Evidence Preservation per Day',
  }),
);

// Access grants
const grants = readCsv('grants_daily.csv');
writeSvg(
  'fig5_5_access_grants.svg',
  barChart({
    data: grants,
    labels: d => d.day,
    series: ['grants'],
    colors: ['#e0b068'],
    title: 'Survivor Access Grants per Day',
  }),
);

// Notifications
const notifications = readCsv('notifications_daily.csv');
writeSvg(
  'fig5_6_notifications.svg',
  lineChart({
    data: notifications,
    labels: d => d.day,
    series: ['notifications'],
    colors: ['#2d7fb8'],
    title: 'Authority Notifications per Day',
  }),
);

// IPFS status
const ipfsStatus = readCsv('ipfs_status.csv');
writeSvg(
  'fig5_3_ipfs_status.svg',
  barChart({
    data: ipfsStatus,
    labels: d => d.status,
    series: ['count'],
    colors: ['#b66b6b'],
    title: 'IPFS Status Distribution',
  }),
);

console.log('Charts generated in docs/figures');

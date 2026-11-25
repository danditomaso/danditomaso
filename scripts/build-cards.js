// Draws the profile README cards into assets/cards from live GitHub data.
// Run: GITHUB_TOKEN=$(gh auth token) node scripts/build-cards.js
const fs = require("fs");
const path = require("path");
const out = path.join(__dirname, "..", "assets", "cards");
fs.mkdirSync(out, { recursive: true });

const LOGIN = "danditomaso";
const QUERY = `query {
  user(login: "${LOGIN}") {
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
    contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } }
  }
  repository(owner: "meshtastic", name: "web") { stargazerCount }
  search(query: "repo:meshtastic/web author:${LOGIN} is:pr is:merged", type: ISSUE) { issueCount }
}`;

const C = {
  bg: "#0d0b09", line: "#2a241d", text: "#efe9e1", soft: "#e0d8cf", muted: "#b8ada1",
  accent: "#ffb454", dim: "#7a5832", faint: "#221c16",
};
const SANS = "'SF Pro Display',-apple-system,'Segoe UI',Inter,sans-serif";
const MONO = "'SF Mono',Menlo,'JetBrains Mono',monospace";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&#39;");
const fmt = (n) => n.toLocaleString("en-US");

const text = (x, y, s, { size = 14, weight = 400, fill = C.text, font = MONO, anchor = "start", ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}">${esc(s)}</text>`;
const label = (x, y, s, o = {}) => text(x, y, s.toUpperCase(), { size: 12, weight: 600, fill: C.muted, ls: 1.8, ...o });
const spans = (x, y, parts, size = 14) =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="${size}" xml:space="preserve">` +
  parts.map(([s, fill = C.soft, w = 400]) => `<tspan fill="${fill}" font-weight="${w}">${esc(s)}</tspan>`).join("") + `</text>`;
const hline = (y, x1 = 0, x2 = 880) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${C.line}"/>`;
const vline = (x, y1, y2) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${C.line}"/>`;

const panel = (h, title, right, body, alt) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="880" height="${h}" viewBox="0 0 880 ${h}" role="img" aria-label="${esc(alt)}"><title>${esc(alt)}</title>` +
  `<rect x="0.5" y="0.5" width="879" height="${h - 1}" rx="6" fill="${C.bg}" stroke="${C.line}"/>` +
  (title ? `<rect x="28" y="29" width="6" height="6" fill="${C.accent}"/>` + label(44, 36, title, { fill: C.soft }) + label(852, 36, right, { anchor: "end" }) + hline(56) : "") +
  body + `</svg>`;

function hero() {
  const nodes = [[740, 140], [668, 96], [812, 88], [828, 190], [690, 206], [610, 160], [760, 236]];
  const links = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [4, 5], [3, 6], [4, 6], [1, 2]];
  let mesh = links.map(([a, b]) => `<line x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" stroke="${C.dim}" stroke-dasharray="3 4"/>`).join("");
  // Static by default; motion only turns on when the viewer hasn't asked to reduce it.
  // Packets also need offset-path, otherwise they'd render stuck at the SVG origin.
  // Packet and landing flash share a 4s loop and the same delay so they stay in sync.
  mesh += `<style>
.pk,.ring{opacity:0}
@keyframes hop{0%{offset-distance:0%;opacity:1}60%{offset-distance:100%;opacity:1}61%,100%{offset-distance:100%;opacity:0}}
@keyframes fl{0%,59%{fill:${C.bg}}62%{fill:${C.accent}}85%,100%{fill:${C.bg}}}
@keyframes ring{from{transform:scale(.17);opacity:.9}to{transform:scale(1);opacity:0}}
@keyframes blink{50%{opacity:.25}}
@media (prefers-reduced-motion:no-preference){
.ring{transform-origin:740px 140px;animation:ring 3s ease-out infinite}
.blink{animation:blink 2s ease-in-out infinite}
@supports (offset-path:path('M0 0L1 1')){
.pk{animation:hop 4s linear infinite}
.fl{animation:fl 4s linear infinite}
}
}
</style>`;
  mesh += `<circle class="ring" cx="740" cy="140" r="46" fill="none" stroke="${C.accent}" vector-effect="non-scaling-stroke"/>`;
  const routes = [[0, 2], [0, 1, 5], [0, 3, 6], [0, 4]];
  const delay = {};
  routes.forEach((r, i) => {
    const d = "M" + r.map((n) => nodes[n].join(" ")).join(" L");
    mesh += `<circle class="pk" r="3" fill="${C.accent}" style="offset-path:path('${d}');animation-delay:${i}s"/>`;
    delay[r[r.length - 1]] = i;
  });
  mesh += nodes.map(([x, y], i) => (i ? `<circle${i in delay ? ` class="fl" style="animation-delay:${delay[i]}s"` : ""} cx="${x}" cy="${y}" r="4" fill="${C.bg}" stroke="${C.muted}" stroke-width="1.5"/>` : `<circle cx="${x}" cy="${y}" r="7" fill="${C.accent}"/>`)).join("");

  mesh += `<rect x="750" y="115" width="104" height="19" rx="3" fill="${C.bg}"/>` + label(754, 129, "you are here", { size: 11, fill: C.accent, ls: 1.2 });
  let body = mesh;
  body += `<circle class="blink" cx="34" cy="32" r="4" fill="${C.accent}"/>`;
  body += label(46, 36, "online  ·  Toronto, CA  ·  43.65N 79.38W") + label(852, 36, "danditomaso.com ↗", { anchor: "end", fill: C.accent });
  body += hline(56);
  body += text(32, 132, "Dan Ditomaso", { size: 54, weight: 700, font: SANS, ls: -1 });
  body += text(32, 170, "Senior full-stack engineer. I lead the Meshtastic web client.", { size: 18, font: SANS, fill: C.soft });
  body += label(32, 222, "stack") + spans(100, 223, [["React + TypeScript", C.text], ["  /  ", C.accent], ["Python", C.text], ["  /  ", C.accent], ["Effect", C.text]], 15);
  return panel(260, null, null, body, "Dan Ditomaso, senior full-stack engineer in Toronto, Canada. I lead the Meshtastic web client. Stack: React + TypeScript, Python, Effect. Website: danditomaso.com.");
}

function telemetry(s, days) {
  const cols = [
    ["contributions", fmt(s.year)],
    ["current streak", `${s.streak}d`],
    ["longest streak", `${s.longest}d`],
    ["merged PRs", fmt(s.prs)],
  ];
  let body = "";
  cols.forEach(([l, v], i) => {
    const x = 32 + i * 212;
    if (i) body += vline(x - 20, 76, 176);
    body += label(x, 88, l) + text(x, 136, v, { size: 40, weight: 700, font: SANS, ls: -1 });
  });
  // Weekly totals sparkline under the first column, last 14 days as dots under the streak.
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7).reduce((a, d) => a + d.contributionCount, 0));
  const max = Math.max(...weeks);
  const pts = weeks.map((w, i) => `${32 + (i * 172) / (weeks.length - 1)},${172 - (w / max) * 22}`).join(" ");
  body += `<polyline points="${pts}" fill="none" stroke="${C.accent}" stroke-width="1.5" stroke-linejoin="round"/>`;
  days.slice(-14).forEach((d, i) => (body += `<rect x="${244 + i * 12}" y="160" width="8" height="12" rx="1" fill="${d.contributionCount ? C.accent : "none"}" stroke="${d.contributionCount ? C.accent : C.muted}" stroke-opacity="${d.contributionCount ? 1 : 0.6}"/>`));
  body += text(456, 170, "in the last 12 mo", { size: 13, weight: 500, fill: C.muted }) + text(668, 170, "#1 contributor", { size: 13, weight: 600, fill: C.accent });
  body += hline(196);
  body += spans(32, 228, [[String(s.repos), C.text, 700], [" public repos", C.muted, 500], ["    ·    ", C.dim], [fmt(s.meshStars), C.text, 700], [" stars on meshtastic/web", C.muted, 500], ["    ·    ", C.dim], [String(s.followers), C.text, 700], [" followers", C.muted, 500]], 13);
  return panel(252, "telemetry", "updated " + s.date, body,
    `GitHub telemetry, updated ${s.date}: ${fmt(s.year)} contributions in the last year, a ${s.streak}-day current streak (contributed on ${s.recent} of the last 14 days), longest streak ${s.longest} days, ${s.prs} merged PRs in meshtastic/web as its #1 contributor, ${s.repos} public repos, ${s.meshStars} stars on meshtastic/web, ${s.followers} followers.`);
}

function activity(days) {
  const total = days.reduce((a, d) => a + d.contributionCount, 0);
  const max = Math.max(...days.map((d) => d.contributionCount));
  const x0 = 32, w = 816, base = 210, hmax = 120, step = w / days.length;
  let body = "";
  [0.33, 0.66, 1].forEach((f) => (body += `<line x1="${x0}" y1="${base - f * hmax}" x2="${x0 + w}" y2="${base - f * hmax}" stroke="${C.faint}"/>`));
  let peak = null, lastMonth = "";
  days.forEach((d, i) => {
    const n = d.contributionCount, x = x0 + i * step;
    // sqrt scale so one 190-commit day doesn't flatten everything else
    const h = n ? Math.max(3, Math.sqrt(n / max) * hmax) : 1;
    body += `<rect x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${(step * 0.62).toFixed(1)}" height="${h.toFixed(1)}" fill="${n ? (n >= max * 0.25 ? C.accent : "#c98a3e") : C.line}"/>`;
    if (n === max) peak = { x, h, d };
    const m = new Date(d.date).toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    if (m !== lastMonth && new Date(d.date).getUTCDate() <= 7) { body += `<line x1="${x}" y1="${base + 4}" x2="${x}" y2="${base + 10}" stroke="${C.muted}"/>` + label(x + 4, base + 24, m, { size: 11 }); lastMonth = m; }
  });
  const pd = new Date(peak.d.date).toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  body += `<line x1="${peak.x + 1}" y1="${base - peak.h - 6}" x2="${peak.x + 1}" y2="${base - hmax - 4}" stroke="${C.accent}" stroke-dasharray="2 2"/>`;
  body += text(peak.x - 6, base - hmax - 8, `peak ${max} · ${pd}`, { size: 12, weight: 600, fill: C.accent, anchor: "end" });
  body += hline(base);
  return panel(252, "activity / 6 mo", `${fmt(total)} contributions`, body, `Daily contributions over the last 6 months: ${fmt(total)} in total, peaking at ${max} on ${pd}.`);
}

function now() {
  const rows = [
    ["leading", "Meshtastic web client, #1 contributor"],
    ["building", "meshd: finding nearby radios over Bluetooth + mDNS"],
    ["learning", "Effect, for typed errors and services end to end"],
    ["shipping with", "Claude Code, with every PR typed, tested and reviewed"],
  ];
  let body = "";
  rows.forEach(([k, v], i) => {
    const y = 92 + i * 44;
    body += label(32, y, k, { fill: C.accent }) + text(190, y, v, { size: 15, font: SANS, fill: C.text });
    if (i < rows.length - 1) body += hline(y + 20, 32, 848);
  });
  return panel(252, "now", "", body, "Now. Leading: Meshtastic web client, #1 contributor. Building: meshd, finding nearby radios over Bluetooth and mDNS. Learning: Effect, for typed errors and services end to end. Shipping with: Claude Code, with every PR typed, tested and reviewed.");
}

function projects(s) {
  const list = [
    { name: "Meshtastic Web", role: "lead maintainer", desc: "Off-grid, encrypted messaging over LoRa radios, straight from the browser.", tags: "React / TypeScript / Web Serial / Web Bluetooth", stats: [[fmt(s.meshStars), "stars"], [fmt(s.prs), "merged PRs"]] },
    { name: "meshd", role: "experimental", desc: "Lets the web client discover nearby radios over Bluetooth and mDNS.", tags: "mDNS / Bluetooth", stats: [] },
  ];
  let body = "";
  list.forEach((p, i) => {
    const y = 76 + i * 118;
    body += `<rect x="32" y="${y}" width="3" height="88" fill="${i ? C.dim : C.accent}"/>`;
    body += spans(52, y + 26, [[p.name, C.text, 700]], 24).replace(MONO, SANS) + label(52 + p.name.length * 15 + 18, y + 24, p.role, { fill: C.accent, size: 11 });
    body += text(52, y + 56, p.desc, { size: 15, font: SANS, fill: C.soft }) + text(52, y + 82, p.tags, { size: 13, weight: 500, fill: C.muted });
    p.stats.forEach(([v, l], j) => {
      const x = 848 - j * 110;
      body += text(x, y + 34, v, { size: 28, weight: 700, font: SANS, anchor: "end" }) + label(x, y + 54, l, { anchor: "end", size: 11 });
    });
    if (!i) body += hline(y + 104, 32, 848);
  });
  return panel(308, "projects", "2 active", body, `Projects. Meshtastic Web (lead maintainer): off-grid, encrypted messaging over LoRa radios, straight from the browser. Built with React, TypeScript, Web Serial and Web Bluetooth; ${fmt(s.prs)} merged PRs, ${fmt(s.meshStars)} stars. meshd (experimental): lets the web client discover nearby radios over Bluetooth and mDNS.`);
}

async function main() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY }),
  });
  const { data, errors } = await res.json();
  if (errors || !data) throw new Error(JSON.stringify(errors));
  const me = data.user;
  const cal = me.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) => w.contributionDays);
  let streak = 0;
  // Today not having a contribution yet shouldn't break the streak.
  for (let i = days.length - 1; i >= 0; i--) { if (days[i].contributionCount) streak++; else if (i < days.length - 1) break; }
  let longest = 0, run = 0;
  for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }

  const s = {
    year: cal.totalContributions, streak, longest,
    recent: days.slice(-14).filter((d) => d.contributionCount).length,
    prs: data.search.issueCount, meshStars: data.repository.stargazerCount,
    repos: me.repositories.totalCount, followers: me.followers.totalCount,
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }),
  };
  const files = {
    "hero.svg": hero(),
    "telemetry.svg": telemetry(s, days),
    "activity.svg": activity(days.slice(-182)),
    "now.svg": now(),
    "projects.svg": projects(s),
  };
  // Screen readers read the README's <img alt>, not the SVG <title>, so keep the alts in step with the numbers.
  const readmePath = path.join(__dirname, "..", "README.md");
  let readme = fs.readFileSync(readmePath, "utf8");
  for (const [f, svg] of Object.entries(files)) {
    fs.writeFileSync(path.join(out, f), svg);
    const alt = svg.match(/aria-label="([^"]*)"/)[1];
    readme = readme.replace(new RegExp(`(src="assets/cards/${f}" alt=")[^"]*`), (_, pre) => pre + alt);
  }
  fs.writeFileSync(readmePath, readme);
  console.log(`wrote ${Object.keys(files).length} cards`);
}

main().catch((e) => { console.error(e); process.exit(1); });

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (f) => join(root, "pages", f);

const icon = (n, size = "") => `<svg class="mpn-icon${size ? " mpn-icon-" + size : ""}"><use href="#i-${n}"/></svg>`;
const il = (n, size = "") => `<svg class="mpn-il${size ? " mpn-il-" + size : ""}"><use href="#il-${n}"/></svg>`;
const pill = (state, label) => `<span class="mpn-pill mpn-is-${state}">${label}</span>`;

const NAV = [
  { label: "Overview" },
  { href: "dashboard.html", icon: "grid", text: "Dashboard" },
  { href: "notifications.html", icon: "bell", text: "Notifications", badge: "3" },
  { label: "Infrastructure" },
  {
    icon: "server",
    text: "Compute",
    children: [
      { href: "instances.html", text: "Instances" },
      { href: "instance-detail.html", text: "Instance detail" },
      { href: "nodes.html", text: "Nodes" },
      { href: "images.html", text: "Images" }
    ]
  },
  {
    icon: "hard-drive",
    text: "Storage",
    children: [
      { href: "volumes.html", text: "Volumes" },
      { href: "files.html", text: "File browser" }
    ]
  },
  { label: "Work" },
  { href: "board.html", icon: "columns", text: "Board" },
  { href: "calendar.html", icon: "calendar", text: "Calendar" },
  { href: "chat.html", icon: "message", text: "Chat" },
  { href: "timeline.html", icon: "history", text: "Timeline" },
  { label: "Account" },
  {
    icon: "settings",
    text: "Settings",
    children: [
      { href: "settings-profile.html", text: "Profile" },
      { href: "settings-security.html", text: "Security" },
      { href: "settings-api-keys.html", text: "API keys" },
      { href: "settings-notifications.html", text: "Notifications" },
      { href: "settings-billing.html", text: "Billing" }
    ]
  },
  { href: "invoice.html", icon: "file-text", text: "Invoice" },
  { href: "pricing.html", icon: "dollar", text: "Pricing" },
  { href: "audit-log.html", icon: "shield", text: "Audit log" },
  { label: "Reference" },
  { href: "components.html", icon: "layers", text: "Components" },
  { href: "icons.html", icon: "star", text: "Icons" },
  { href: "faq.html", icon: "help", text: "Help" },
  { href: "blank.html", icon: "file", text: "Blank page" }
];

function renderNav(active) {
  return NAV.map((n) => {
    if (n.label) return `    <div class="mpn-nav-label">${n.label}</div>`;
    if (n.children) {
      const open = n.children.some((c) => c.href === active);
      const sub = n.children
        .map(
          (c) =>
            `      <a class="mpn-nav-item" href="${c.href}"${c.href === active ? ' aria-current="page"' : ""}><span>${c.text}</span></a>`
        )
        .join("\n");
      return `    <button class="mpn-nav-item" data-mpn-nav-group aria-expanded="${open}">${icon(n.icon)}<span>${n.text}</span><svg class="mpn-nav-caret"><use href="#i-chevron-right"/></svg></button>
    <div class="mpn-nav-sub"${open ? "" : " hidden"}>
${sub}
    </div>`;
    }
    const badge = n.badge ? `<span class="mpn-nav-badge">${n.badge}</span>` : "";
    return `    <a class="mpn-nav-item" href="${n.href}"${n.href === active ? ' aria-current="page"' : ""}>${icon(n.icon)}<span>${n.text}</span>${badge}</a>`;
  }).join("\n");
}

const OVERLAYS = `
<div class="mpn-palette" id="palette" hidden>
  <input class="mpn-palette-field" placeholder="Type a command or search…" aria-label="Command palette">
  <div class="mpn-palette-list">
    <div class="mpn-palette-group">Actions</div>
    <button class="mpn-palette-item" aria-selected="true">${icon("plus", "sm")}Create instance</button>
    <button class="mpn-palette-item">${icon("camera", "sm")}Take snapshot</button>
    <button class="mpn-palette-item">${icon("download", "sm")}Export instance list</button>
    <div class="mpn-palette-group">Go to</div>
    <button class="mpn-palette-item">${icon("server", "sm")}Instances</button>
    <button class="mpn-palette-item">${icon("shield", "sm")}Audit log</button>
    <button class="mpn-palette-item">${icon("settings", "sm")}Settings</button>
  </div>
</div>

<div class="mpn-menu" id="user-menu" hidden>
  <button class="mpn-menu-item">${icon("user", "sm")}Profile</button>
  <button class="mpn-menu-item">${icon("settings", "sm")}Preferences</button>
  <button class="mpn-menu-item" data-mpn-dir-toggle>${icon("align-left", "sm")}Flip direction (RTL)</button>
  <div class="mpn-menu-sep"></div>
  <button class="mpn-menu-item is-danger">${icon("log-out", "sm")}Sign out</button>
</div>`.replace(`${icon("align-left", "sm")}`, icon("code", "sm"));

function shell({ file, title, active, head = "", body, extra = "" }) {
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — marspanel</title>
<link rel="stylesheet" href="../dist/marspanel.min.css">
<script src="../dist/marspanel-theme.js"></script>${head}
</head>
<body class="mpn-root">
<script src="../dist/sprites.js"></script>

<div class="mpn-app">
  <aside class="mpn-sidebar">
    <div class="mpn-brand">
      <div class="mpn-brand-mark">M</div>
      <div class="mpn-brand-name">marspanel</div>
    </div>
${renderNav(active)}
    <div class="mpn-nav-foot">
      <button class="mpn-nav-item" data-mpn-sidebar-lock aria-pressed="false">${icon("sidebar")}<span>Collapse</span></button>
    </div>
  </aside>

  <div class="mpn-main">
    <header class="mpn-topbar">
      <button class="mpn-icon-btn mpn-nav-toggle" data-mpn-nav-toggle aria-label="Toggle navigation">${icon("menu")}</button>
      <span class="mpn-env"><span class="mpn-dot mpn-is-ok"></span>jkt-01</span>
      <button class="mpn-search" data-mpn-open="palette">${icon("search", "sm")}Search…<kbd class="mpn-kbd">⌘K</kbd></button>
      <div class="mpn-topbar-end">
        <button class="mpn-icon-btn mpn-icon-btn-bare" data-mpn-tip="Toggle theme" data-mpn-theme-toggle aria-label="Toggle theme">${icon("contrast")}</button>
        <button class="mpn-icon-btn mpn-icon-btn-bare" data-mpn-tip="Left-to-right / right-to-left" data-mpn-dir-toggle aria-label="Toggle direction">${icon("code")}</button>
        <a class="mpn-icon-btn mpn-icon-btn-bare" data-mpn-tip="3 unread" href="notifications.html" aria-label="Notifications">${icon("bell")}</a>
        <button class="mpn-avatar" data-mpn-menu="user-menu" aria-label="Account">UM</button>
      </div>
    </header>

    <main class="mpn-page">
${body}
    </main>
  </div>
</div>
${OVERLAYS}${extra}

<script src="../dist/marspanel.js"></script>
</body>
</html>
`;
}

function pageHead(eyebrow, title, sub, actions = "") {
  return `      <div class="mpn-page-head">
        <div>
          <div class="mpn-eyebrow">${eyebrow}</div>
          <h1 class="mpn-page-title">${title}</h1>
          <p class="mpn-page-sub">${sub}</p>
        </div>
        ${actions ? `<div class="mpn-page-actions">${actions}</div>` : ""}
      </div>`;
}

function card(title, inner, { act = "", flush = false, sub = "" } = {}) {
  const head = title
    ? `        <div class="mpn-card-head"><div><h2 class="mpn-card-title">${title}</h2>${sub ? `<div class="mpn-card-sub">${sub}</div>` : ""}</div>${act}</div>\n`
    : "";
  return `      <section class="mpn-card">
${head}${flush ? inner : `        <div class="mpn-card-body">\n${inner}\n        </div>`}
      </section>`;
}

function stateShell(code, title, body, art, actions) {
  return `      <div class="mpn-state-page">
        ${il(art, "lg")}
        <div class="mpn-state-code">${code}</div>
        <h1 class="mpn-state-title">${title}</h1>
        <p class="mpn-state-body">${body}</p>
        <div class="mpn-row" style="justify-content:center">${actions}</div>
      </div>`;
}

const AUTH_CSS = `
<style>
.auth { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); min-height: 100vh; }
.auth-art { display: flex; flex-direction: column; justify-content: space-between; gap: 32px; padding: 48px; border-inline-end: 1px solid var(--mpn-line); }
.auth-quote { max-width: 34ch; font-size: var(--mpn-fs-lg); line-height: 1.6; color: var(--mpn-fg-muted); }
.auth-quote strong { color: var(--mpn-fg); font-weight: 600; }
.auth-form { display: flex; align-items: center; justify-content: center; padding: 48px 24px; }
.auth-box { width: min(380px,100%); display: flex; flex-direction: column; gap: 18px; }
.auth-sep { display: flex; align-items: center; gap: 12px; color: var(--mpn-fg-faint); font-size: var(--mpn-fs-xs); }
.auth-sep::before, .auth-sep::after { content: ""; flex: 1; height: 1px; background: var(--mpn-line); }
@media (max-width: 900px) { .auth { grid-template-columns: minmax(0,1fr); } .auth-art { display: none; } }
</style>`;

function authPage({ file, title, heading, sub, body, footer }) {
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — marspanel</title>
<link rel="stylesheet" href="../dist/marspanel.min.css">
<script src="../dist/marspanel-theme.js"></script>${AUTH_CSS}
</head>
<body class="mpn-root">
<script src="../dist/sprites.js"></script>

<div class="auth">
  <div class="auth-art">
    <div class="mpn-brand" style="padding:0"><div class="mpn-brand-mark">M</div><div class="mpn-brand-name">marspanel</div></div>
    ${il("plate", "lg")}
    <div>
      <p class="auth-quote">A console that fetches nothing renders identically when it is served from <strong>a single binary on an air-gapped node</strong>.</p>
      <div class="mpn-row" style="margin-top:20px">${pill("ok", "ok")}${pill("pending", "pending")}${pill("danger", "danger")}</div>
    </div>
  </div>
  <div class="auth-form">
    <div class="auth-box">
      <div>
        <div class="mpn-eyebrow">Control plane</div>
        <h1 class="mpn-page-title" style="margin-top:6px">${heading}</h1>
        <p class="mpn-page-sub">${sub}</p>
      </div>
${body}
${footer}
    </div>
  </div>
</div>

<script src="../dist/marspanel.js"></script>
</body>
</html>
`;
}

const INSTANCES = [
  ["web-01", "ok", "running", "c2.4x · 4 vCPU / 16 GiB", "10.20.4.17", "node-jkt-01", "14d", 14],
  ["web-02", "ok", "running", "c2.4x · 4 vCPU / 16 GiB", "10.20.4.18", "node-jkt-02", "14d", 14],
  ["db-02", "pending", "provisioning", "m4.2x · 8 vCPU / 64 GiB", "—", "node-jkt-01", "2m", 0],
  ["cache-01", "danger", "failed", "b1.1x · 1 vCPU / 2 GiB", "10.20.4.51", "node-jkt-03", "6h", 0],
  ["queue-03", "warn", "draining", "c2.2x · 2 vCPU / 8 GiB", "10.20.4.33", "node-jkt-02", "31d", 31],
  ["edge-01", "ok", "running", "b1.2x · 2 vCPU / 4 GiB", "10.30.1.4", "node-sgp-01", "92d", 92],
  ["batch-07", "idle", "stopped", "m4.1x · 4 vCPU / 32 GiB", "10.20.4.62", "node-jkt-01", "3d", 3],
  ["api-04", "info", "degraded", "c2.4x · 4 vCPU / 16 GiB", "10.20.4.24", "node-jkt-02", "8d", 8]
];

function instanceRows() {
  return INSTANCES.map(
    ([name, state, label, shape, addr, node, age, ageNum]) => `              <tr${state === "danger" ? ' class="mpn-row-danger"' : ""}>
                <td class="mpn-cell-check"><label class="mpn-check"><input type="checkbox" data-mpn-row-check aria-label="Select ${name}"></label></td>
                <td class="mpn-cell-key"><a href="instance-detail.html">${name}</a></td>
                <td data-value="${label}">${pill(state, label)}</td>
                <td class="mpn-cell-mono">${shape}</td>
                <td class="mpn-cell-mono">${addr}</td>
                <td class="mpn-cell-mono">${node}</td>
                <td class="mpn-cell-num" data-value="${ageNum}">${age}</td>
                <td class="mpn-cell-act"><button class="mpn-icon-btn mpn-icon-btn-bare" data-mpn-menu="user-menu" aria-label="Actions">${icon("more", "sm")}</button></td>
              </tr>`
  ).join("\n");
}

const pages = [];

pages.push([
  "instances.html",
  shell({
    title: "Instances",
    active: "instances.html",
    body: `${pageHead("Compute", "Instances", '<span class="mpn-mono" data-mpn-filter-count>8</span> of 32 shown · sortable columns', `<button class="mpn-btn">${icon("download", "sm")}Export</button><button class="mpn-btn mpn-btn-primary">${icon("plus", "sm")}New instance</button>`)}

      <section class="mpn-card">
        <div class="mpn-toolbar">
          <input class="mpn-input" style="width:220px" placeholder="Filter rows…" data-mpn-filter="inst-table">
          <button class="mpn-chip">runtime: all ${icon("chevron-down", "sm")}</button>
          <button class="mpn-chip" aria-pressed="true">region: jkt-01 ${icon("chevron-down", "sm")}</button>
          <span class="mpn-spacer"></span>
          <span class="mpn-btn-group">
            <button class="mpn-btn mpn-btn-sm" aria-pressed="true">Table</button>
            <button class="mpn-btn mpn-btn-sm" aria-pressed="false">Cards</button>
          </span>
        </div>
        <div class="mpn-bulkbar" data-mpn-bulkbar hidden>
          <strong data-mpn-bulk-count>0</strong> selected
          <button class="mpn-btn mpn-btn-sm">Stop</button>
          <button class="mpn-btn mpn-btn-sm">Snapshot</button>
          <button class="mpn-btn mpn-btn-sm mpn-btn-danger">Delete</button>
        </div>
        <div class="mpn-table-wrap">
          <table class="mpn-table mpn-table-stack" id="inst-table" data-mpn-sort>
            <thead><tr>
              <th class="mpn-cell-check"><label class="mpn-check"><input type="checkbox" data-mpn-select-all aria-label="Select all"></label></th>
              <th data-sort="text">Name</th><th data-sort="text">State</th><th data-sort="text">Shape</th>
              <th data-sort="text">Address</th><th data-sort="text">Node</th><th data-sort="num" class="mpn-cell-num">Age</th><th class="mpn-cell-act"></th>
            </tr></thead>
            <tbody>
${instanceRows()}
            </tbody>
          </table>
        </div>
        <div class="mpn-pager">
          <span>Page <strong class="mpn-mono">1</strong> of <strong class="mpn-mono">4</strong></span>
          <span class="mpn-spacer"></span>
          <nav class="mpn-pagination">
            <button class="mpn-page-btn" disabled>${icon("chevrons-left", "sm")}</button>
            <button class="mpn-page-btn" aria-current="page">1</button>
            <button class="mpn-page-btn">2</button>
            <button class="mpn-page-btn">3</button>
            <span class="mpn-page-gap">…</span>
            <button class="mpn-page-btn">4</button>
            <button class="mpn-page-btn">${icon("chevrons-right", "sm")}</button>
          </nav>
        </div>
      </section>`
  })
]);

pages.push([
  "instance-detail.html",
  shell({
    title: "web-01",
    active: "instance-detail.html",
    body: `      <nav class="mpn-crumbs"><a href="instances.html">Instances</a><span class="mpn-crumb-sep">/</span><span class="mpn-mono">web-01</span></nav>
${pageHead("Instance", `web-01 ${pill("ok", "running")}`, "c2.4x · node-jkt-01 · created 2026-08-31", `<button class="mpn-btn">${icon("refresh", "sm")}Restart</button><button class="mpn-btn">${icon("camera", "sm")}Snapshot</button><button class="mpn-btn mpn-btn-danger">${icon("stop", "sm")}Stop</button>`)}

      <section class="mpn-card">
        <div class="mpn-card-body" style="padding-bottom:0">
          <div class="mpn-tabs" data-mpn-tabs>
            <a class="mpn-tab" role="tab" aria-selected="true" aria-controls="t-ov" href="#">Overview</a>
            <a class="mpn-tab" role="tab" aria-selected="false" aria-controls="t-lg" href="#">Logs</a>
            <a class="mpn-tab" role="tab" aria-selected="false" aria-controls="t-mt" href="#">Metrics</a>
            <a class="mpn-tab" role="tab" aria-selected="false" aria-controls="t-tl" href="#">Timeline</a>
            <a class="mpn-tab" role="tab" aria-selected="false" aria-controls="t-sp" href="#">Spec</a>
          </div>
        </div>
        <div class="mpn-card-body" id="t-ov">
          <div class="mpn-grid mpn-g-2">
            <dl class="mpn-kv">
              <dt>Instance ID</dt><dd>i-9f2ae41c7b03d8</dd>
              <dt>Image digest</dt><dd>sha256:9f2ae41c7b03d8</dd>
              <dt>Private address</dt><dd>10.20.4.17/22</dd>
              <dt>Node</dt><dd>node-jkt-01</dd>
              <dt>Created</dt><dd>2026-08-31 09:14 UTC</dd>
            </dl>
            <div>
              <div class="mpn-meter-row"><span>CPU</span><span class="mpn-meter"><span class="mpn-meter-fill" style="width:41%"></span></span><output>41%</output></div>
              <div class="mpn-meter-row"><span>Memory</span><span class="mpn-meter"><span class="mpn-meter-fill" style="width:77%"></span></span><output>77%</output></div>
              <div class="mpn-meter-row"><span>Disk</span><span class="mpn-meter"><span class="mpn-meter-fill" style="width:23%"></span></span><output>23%</output></div>
              <div class="mpn-meter-row"><span>Network</span><span class="mpn-meter"><span class="mpn-meter-fill" style="width:58%"></span></span><output>58%</output></div>
            </div>
          </div>
        </div>
        <div class="mpn-card-body" id="t-lg" hidden>
          <div class="mpn-log">
            <div class="mpn-log-line mpn-is-idle"><span class="mpn-log-time">09:12:01</span><span class="mpn-log-level">INFO</span><span class="mpn-log-msg">listening on 0.0.0.0:8080</span></div>
            <div class="mpn-log-line mpn-is-idle"><span class="mpn-log-time">09:12:09</span><span class="mpn-log-level">INFO</span><span class="mpn-log-msg">connected to db-02:5432</span></div>
            <div class="mpn-log-line mpn-is-warn"><span class="mpn-log-time">09:12:44</span><span class="mpn-log-level">WARN</span><span class="mpn-log-msg">readiness probe exceeded 1s budget (1.41s)</span></div>
            <div class="mpn-log-line mpn-is-danger"><span class="mpn-log-time">09:13:02</span><span class="mpn-log-level">ERROR</span><span class="mpn-log-msg">removed from load balancer rotation</span></div>
            <div class="mpn-log-line mpn-is-ok"><span class="mpn-log-time">09:15:30</span><span class="mpn-log-level">INFO</span><span class="mpn-log-msg">back in rotation after threshold raised to 3</span></div>
          </div>
        </div>
        <div class="mpn-card-body" id="t-mt" hidden>
          <svg class="mpn-chart" viewBox="0 0 600 180" preserveAspectRatio="none">
            <defs><linearGradient id="d-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--mpn-accent)" stop-opacity=".28"/><stop offset="100%" stop-color="var(--mpn-accent)" stop-opacity="0"/></linearGradient></defs>
            <g class="mpn-chart-grid"><line x1="0" y1="45" x2="600" y2="45"/><line x1="0" y1="90" x2="600" y2="90"/><line x1="0" y1="135" x2="600" y2="135"/></g>
            <path class="mpn-chart-area" fill="url(#d-fill)" d="M0 120 L60 108 L120 116 L180 92 L240 100 L300 74 L360 84 L420 60 L480 68 L540 46 L600 54 L600 180 L0 180 Z"/>
            <path class="mpn-chart-line" d="M0 120 L60 108 L120 116 L180 92 L240 100 L300 74 L360 84 L420 60 L480 68 L540 46 L600 54"/>
          </svg>
        </div>
        <div class="mpn-card-body" id="t-tl" hidden>
          <div class="mpn-timeline">
            <div class="mpn-timeline-item mpn-is-ok"><strong class="mpn-mono">09:02</strong> — scheduled onto node-jkt-01</div>
            <div class="mpn-timeline-item mpn-is-pending"><strong class="mpn-mono">09:04</strong> — pulling image sha256:9f2ae41c</div>
            <div class="mpn-timeline-item mpn-is-warn"><strong class="mpn-mono">09:12</strong> — readiness degraded</div>
            <div class="mpn-timeline-item mpn-is-danger"><strong class="mpn-mono">09:13</strong> — removed from rotation</div>
            <div class="mpn-timeline-item mpn-is-ok"><strong class="mpn-mono">09:15</strong> — recovered</div>
          </div>
        </div>
        <div class="mpn-card-body" id="t-sp" hidden>
          <pre class="mpn-code"><span class="mpn-tok-key">name</span>: <span class="mpn-tok-str">web-01</span>
<span class="mpn-tok-key">shape</span>: <span class="mpn-tok-str">c2.4x</span>
<span class="mpn-tok-key">readinessProbe</span>:
  <span class="mpn-tok-key">timeoutSeconds</span>: <span class="mpn-tok-num">1</span>
  <span class="mpn-tok-key">failureThreshold</span>: <span class="mpn-tok-num">3</span></pre>
        </div>
      </section>`
  })
]);

const NODES = [
  ["node-jkt-01", "ok", "ready", 74, 61, "12 / 16"],
  ["node-jkt-02", "ok", "ready", 58, 44, "9 / 16"],
  ["node-jkt-03", "warn", "pressure", 96, 92, "15 / 16"],
  ["node-sgp-01", "idle", "cordoned", 12, 8, "1 / 16"]
];

pages.push([
  "nodes.html",
  shell({
    title: "Nodes",
    active: "nodes.html",
    body: `${pageHead("Operations", "Nodes", "4 nodes · 1 under memory pressure · cluster is no longer N+1")}

      <div class="mpn-banner mpn-is-warn">${icon("alert-triangle")}<span>Losing <strong class="mpn-mono">node-jkt-01</strong> would leave 6 workloads unschedulable.</span><button class="mpn-btn mpn-btn-sm mpn-banner-act">Plan capacity</button></div>

      <div class="mpn-grid mpn-g-2">
${NODES.map(
  ([name, state, label, cpu, mem, pods]) => `        <section class="mpn-card mpn-card-state mpn-is-${state}">
          <div class="mpn-card-head"><h2 class="mpn-card-title mpn-mono">${name}</h2>${pill(state, label)}</div>
          <div class="mpn-card-body">
            <div class="mpn-meter-row"><span>CPU</span><span class="mpn-meter"><span class="mpn-meter-fill${cpu > 90 ? " is-danger" : ""}" style="width:${cpu}%"></span></span><output>${cpu}%</output></div>
            <div class="mpn-meter-row"><span>Memory</span><span class="mpn-meter"><span class="mpn-meter-fill${mem > 90 ? " is-danger" : ""}" style="width:${mem}%"></span></span><output>${mem}%</output></div>
            <div class="mpn-stat-meta" style="margin-top:10px">Workloads <strong class="mpn-mono">${pods}</strong></div>
          </div>
        </section>`
).join("\n")}
      </div>`
  })
]);

pages.push([
  "volumes.html",
  shell({
    title: "Volumes",
    active: "volumes.html",
    body: `${pageHead("Storage", "Volumes", "14 volumes · 1 stuck detaching for 1h", `<button class="mpn-btn mpn-btn-primary">${icon("plus", "sm")}New volume</button>`)}
      <section class="mpn-card">
        <div class="mpn-table-wrap">
          <table class="mpn-table" data-mpn-sort>
            <thead><tr><th data-sort="text">Name</th><th data-sort="text">State</th><th data-sort="num" class="mpn-cell-num">Size</th><th data-sort="text">Attached to</th><th data-sort="text">Node</th></tr></thead>
            <tbody>
              <tr><td class="mpn-cell-key">vol-web-data</td><td>${pill("ok", "attached")}</td><td class="mpn-cell-num" data-value="100">100 GiB</td><td class="mpn-cell-mono">web-01</td><td class="mpn-cell-mono">node-jkt-01</td></tr>
              <tr><td class="mpn-cell-key">vol-db-primary</td><td>${pill("ok", "attached")}</td><td class="mpn-cell-num" data-value="500">500 GiB</td><td class="mpn-cell-mono">db-02</td><td class="mpn-cell-mono">node-jkt-01</td></tr>
              <tr class="mpn-row-warn"><td class="mpn-cell-key">vol-cache-scratch</td><td>${pill("warn", "detaching")}</td><td class="mpn-cell-num" data-value="20">20 GiB</td><td class="mpn-cell-mono">cache-01</td><td class="mpn-cell-mono">node-jkt-03</td></tr>
              <tr><td class="mpn-cell-key">vol-backup-stage</td><td>${pill("idle", "available")}</td><td class="mpn-cell-num" data-value="1024">1 TiB</td><td class="mpn-cell-mono">—</td><td class="mpn-cell-mono">—</td></tr>
            </tbody>
          </table>
        </div>
      </section>
${card("Stuck operation", `          <div class="mpn-row" style="gap:16px">
            ${il("maintenance", "sm")}
            <div><strong>vol-cache-scratch has been detaching for 1h 04m</strong>
            <p class="mpn-muted" style="margin-top:6px;max-width:52ch">The node holding it stopped reporting before the unmount finished. Force-detach is safe only once you have confirmed no writer is alive.</p>
            <div class="mpn-row" style="margin-top:12px"><button class="mpn-btn mpn-btn-sm">Inspect node</button><button class="mpn-btn mpn-btn-sm mpn-btn-danger">Force detach</button></div></div>
          </div>`)}`
  })
]);

pages.push([
  "images.html",
  shell({
    title: "Images",
    active: "images.html",
    body: `${pageHead("Compute", "Images", "6 images · 2 unsigned", `<button class="mpn-btn mpn-btn-primary">${icon("upload", "sm")}Upload image</button>`)}
      <section class="mpn-card">
        <div class="mpn-list">
${[
  ["api", "ok", "signed", "4.2 GiB", "12 tags"],
  ["web", "ok", "signed", "1.8 GiB", "8 tags"],
  ["worker", "warn", "unsigned", "2.1 GiB", "3 tags"],
  ["legacy-batch", "warn", "unsigned", "6.4 GiB", "1 tag"]
].map(
  ([name, state, label, size, tags]) => `          <div class="mpn-list-item">
            <span class="mpn-media-thumb is-accent">${icon("package")}</span>
            <div class="mpn-list-body"><div class="mpn-list-title mpn-mono">registry.marspanel.dev/${name}</div><div class="mpn-list-sub">${tags} · ${size}</div></div>
            <div class="mpn-list-end">${pill(state, label)}<button class="mpn-btn mpn-btn-sm">Pull</button></div>
          </div>`
).join("\n")}
        </div>
      </section>`
  })
]);

pages.push([
  "audit-log.html",
  shell({
    title: "Audit log",
    active: "audit-log.html",
    body: `${pageHead("Governance", "Audit log", "Immutable. Retained 400 days.", `<button class="mpn-btn">${icon("download", "sm")}Export CSV</button>`)}
      <section class="mpn-card">
        <div class="mpn-toolbar">
          <input class="mpn-input" style="width:200px" data-mpn-datepicker placeholder="YYYY-MM-DD" value="2026-09-14">
          <div class="mpn-combo" data-mpn-combo style="width:200px">
            <input class="mpn-combo-field" placeholder="Any actor" aria-label="Actor">
            <div class="mpn-combo-list" hidden>
              <button class="mpn-combo-option" data-value="umar">umar@marspanel.dev</button>
              <button class="mpn-combo-option" data-value="rania">rania@marspanel.dev</button>
              <button class="mpn-combo-option" data-value="kadek">kadek@marspanel.dev</button>
              <button class="mpn-combo-option" data-value="ci">ci-deploy (service)</button>
              <div class="mpn-combo-empty" hidden>No actor matches</div>
            </div>
          </div>
          <input class="mpn-input" style="width:200px" placeholder="Filter events…" data-mpn-filter="audit-table">
        </div>
        <div class="mpn-table-wrap">
          <table class="mpn-table mpn-table-compact" id="audit-table" data-mpn-sort>
            <thead><tr><th data-sort="text">Time</th><th data-sort="text">Actor</th><th data-sort="text">Action</th><th data-sort="text">Target</th><th data-sort="text">Result</th></tr></thead>
            <tbody>
              <tr><td class="mpn-cell-mono">09:04:11</td><td class="mpn-cell-mono">umar</td><td>apikey.create</td><td class="mpn-cell-mono">ci-deploy-key</td><td>${pill("ok", "allowed")}</td></tr>
              <tr><td class="mpn-cell-mono">08:58:02</td><td class="mpn-cell-mono">kadek</td><td>instance.delete</td><td class="mpn-cell-mono">batch-06</td><td>${pill("danger", "denied")}</td></tr>
              <tr><td class="mpn-cell-mono">08:51:47</td><td class="mpn-cell-mono">ci-deploy</td><td>instance.create</td><td class="mpn-cell-mono">db-02</td><td>${pill("ok", "allowed")}</td></tr>
              <tr><td class="mpn-cell-mono">08:30:00</td><td class="mpn-cell-mono">system</td><td>backup.run</td><td class="mpn-cell-mono">backup-nightly</td><td>${pill("danger", "failed")}</td></tr>
              <tr><td class="mpn-cell-mono">07:58:19</td><td class="mpn-cell-mono">rania</td><td>node.cordon</td><td class="mpn-cell-mono">node-sgp-01</td><td>${pill("ok", "allowed")}</td></tr>
            </tbody>
          </table>
        </div>
      </section>`
  })
]);

pages.push([
  "notifications.html",
  shell({
    title: "Notifications",
    active: "notifications.html",
    body: `${pageHead("Account", "Notifications", "3 unread", `<button class="mpn-btn">Mark all read</button>`)}
      <section class="mpn-card">
        <div class="mpn-list">
${[
  ["danger", "x-circle", "cache-01 failed to start", "Image pull backoff on node-jkt-03.", "6h"],
  ["warn", "alert-triangle", "Memory quota at 92%", "jkt-01 is no longer N+1.", "1h"],
  ["warn", "key", "API key has no expiry", "ci-deploy-key was created without a TTL.", "2h"],
  ["ok", "check-circle", "Snapshot completed", "snap-4471 finished in 38s.", "1d"],
  ["info", "info", "Maintenance scheduled", "node-jkt-03 reboots Sunday 02:00 UTC.", "2d"]
].map(
  ([state, ic, title, body, ago]) => `          <div class="mpn-list-item">
            <span class="mpn-media-thumb mpn-is-${state} is-state">${icon(ic)}</span>
            <div class="mpn-list-body"><div class="mpn-list-title">${title}</div><div class="mpn-list-sub">${body}</div></div>
            <div class="mpn-list-end"><span class="mpn-mono mpn-faint">${ago}</span><button class="mpn-icon-btn mpn-icon-btn-bare" aria-label="Dismiss">${icon("x", "sm")}</button></div>
          </div>`
).join("\n")}
        </div>
      </section>`
  })
]);

pages.push([
  "calendar.html",
  shell({
    title: "Calendar",
    active: "calendar.html",
    body: `${pageHead("Work", "Calendar", "Maintenance windows, certificate expiry, backup runs", `<button class="mpn-btn mpn-btn-primary">${icon("plus", "sm")}New window</button>`)}
      <section class="mpn-card">
        <div class="mpn-cal">
          <div class="mpn-cal-head">
            <button class="mpn-icon-btn mpn-icon-btn-bare">${icon("chevron-left")}</button>
            <span class="mpn-cal-month">September 2026</span>
            <button class="mpn-icon-btn mpn-icon-btn-bare">${icon("chevron-right")}</button>
            <span class="mpn-spacer"></span>
            <span class="mpn-btn-group"><button class="mpn-btn mpn-btn-sm" aria-pressed="true">Month</button><button class="mpn-btn mpn-btn-sm" aria-pressed="false">Week</button></span>
          </div>
          <div class="mpn-cal-grid">
${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `            <div class="mpn-cal-dow">${d}</div>`).join("\n")}
${Array.from({ length: 35 }, (_, i) => {
  const day = i - 0;
  const outside = day < 1 || day > 30;
  const n = outside ? (day < 1 ? 31 + day : day - 30) : day;
  const events = {
    2: `<span class="mpn-cal-event mpn-is-info">Patch window</span>`,
    4: `<span class="mpn-cal-event mpn-is-ok">Backup verified</span>`,
    8: `<span class="mpn-cal-event mpn-is-warn">Cert expires</span>`,
    11: `<span class="mpn-cal-event mpn-is-pending">Migration</span><span class="mpn-cal-more">+2 more</span>`,
    14: `<span class="mpn-cal-event mpn-is-danger">cache-01 down</span>`,
    21: `<span class="mpn-cal-event mpn-is-info">Reboot jkt-03</span>`,
    28: `<span class="mpn-cal-event mpn-is-ok">Quota review</span>`
  };
  return `            <div class="mpn-cal-day${outside ? " is-outside" : ""}${day === 14 ? " is-today" : ""}"><span class="mpn-cal-num">${n}</span>${(!outside && events[day]) || ""}</div>`;
}).join("\n")}
          </div>
        </div>
      </section>`
  })
]);

pages.push([
  "board.html",
  shell({
    title: "Board",
    active: "board.html",
    body: `${pageHead("Work", "Board", "Incidents and changes, three columns")}
      <section class="mpn-card">
        <div class="mpn-board">
${[
  ["Triage", 3, [["cache-01 image pull backoff", "danger", "p1", "6h"], ["Bucket quota alert is noisy", "idle", "p3", "2d"], ["Audit export times out", "warn", "p2", "4d"]]],
  ["In progress", 2, [["Raise readiness failureThreshold", "warn", "p2", "KD"], ["Add memory headroom to jkt-03", "danger", "p1", "RA"]]],
  ["Review", 1, [["Document snapshot vs backup", "idle", "p3", "UM"]]],
  ["Done", 7, [["Add N+1 capacity check", "ok", "shipped", ""], ["Rotate ci-deploy-key", "ok", "shipped", ""]]]
].map(
  ([title, count, cards]) => `          <div class="mpn-board-col">
            <div class="mpn-board-head"><span class="mpn-board-title">${title}</span><span class="mpn-board-count">${count}</span></div>
${cards.map(([t, s, p, meta]) => `            <div class="mpn-board-card"><span class="mpn-board-card-title">${t}</span><div class="mpn-board-meta">${pill(s, p)}${meta ? `<span class="mpn-mono">${meta}</span>` : ""}</div></div>`).join("\n")}
            <div class="mpn-board-drop"></div>
          </div>`
).join("\n")}
        </div>
      </section>`
  })
]);

pages.push([
  "chat.html",
  shell({
    title: "Chat",
    active: "chat.html",
    body: `${pageHead("Work", "Chat", "Incident channel and direct messages")}
      <section class="mpn-card">
        <div class="mpn-chat">
          <div class="mpn-chat-aside">
${[
  ["KD", "Kadek", "That is the whole bug.", true],
  ["RA", "Rania", "Quota bumped, try again.", false],
  ["#", "#incidents", "cache-01 is still failing.", false],
  ["#", "#deploys", "ci-deploy pushed api:1.44.", false]
].map(
  ([av, name, last, sel]) => `            <div class="mpn-chat-thread"${sel ? ' aria-selected="true"' : ""}>
              <span class="mpn-avatar">${av}</span>
              <div class="mpn-chat-thread-body"><div class="mpn-chat-thread-name">${name}</div><div class="mpn-chat-thread-last">${last}</div></div>
            </div>`
).join("\n")}
          </div>
          <div class="mpn-chat-main">
            <div class="mpn-chat-head"><span class="mpn-avatar">KD</span><strong>Kadek</strong><span class="mpn-hint">typing</span><span class="mpn-dots"><i></i><i></i><i></i></span></div>
            <div class="mpn-chat-log">
              <span class="mpn-chat-day">Today</span>
              <div class="mpn-msg"><span class="mpn-avatar">KD</span><div><div class="mpn-msg-bubble">Readiness timeout is 1s but warmup takes 1.4s.</div><div class="mpn-msg-time">09:41</div></div></div>
              <div class="mpn-msg mpn-msg-self"><div><div class="mpn-msg-bubble">So it never passes. Raising failureThreshold to 3.</div><div class="mpn-msg-time">09:43</div></div></div>
              <div class="mpn-msg"><span class="mpn-avatar">KD</span><div><div class="mpn-msg-bubble">That is the whole bug.</div><div class="mpn-msg-time">09:44</div></div></div>
              <div class="mpn-msg mpn-msg-self"><div><div class="mpn-msg-bubble">Rolling it out to web and api now.</div><div class="mpn-msg-time">09:46</div></div></div>
            </div>
            <div class="mpn-chat-compose">
              <input class="mpn-input" placeholder="Write a message…">
              <button class="mpn-btn mpn-btn-primary">${icon("send", "sm")}Send</button>
            </div>
          </div>
        </div>
      </section>`
  })
]);

pages.push([
  "files.html",
  shell({
    title: "File browser",
    active: "files.html",
    body: `${pageHead("Storage", "File browser", "Object bucket backups-jkt-01 · resizable tree", `<button class="mpn-btn mpn-btn-primary">${icon("upload", "sm")}Upload</button>`)}
      <section class="mpn-card">
        <div class="mpn-split">
          <div class="mpn-split-pane" style="padding:14px">
            <div class="mpn-tree">
              <div class="mpn-tree-branch" data-open>
                <button class="mpn-tree-node" data-mpn-tree-toggle aria-expanded="true"><svg class="mpn-tree-caret"><use href="#i-chevron-right"/></svg>${icon("folder", "sm")}backups-jkt-01</button>
                <div class="mpn-tree-children">
                  <div class="mpn-tree-branch" data-open>
                    <button class="mpn-tree-node" data-mpn-tree-toggle aria-expanded="true"><svg class="mpn-tree-caret"><use href="#i-chevron-right"/></svg>${icon("folder", "sm")}2026-09</button>
                    <div class="mpn-tree-children">
                      <button class="mpn-tree-node mpn-tree-leaf" aria-current="true">${icon("file", "sm")}14-full.tar.zst</button>
                      <button class="mpn-tree-node mpn-tree-leaf">${icon("file", "sm")}13-full.tar.zst</button>
                      <button class="mpn-tree-node mpn-tree-leaf">${icon("file", "sm")}12-full.tar.zst</button>
                    </div>
                  </div>
                  <div class="mpn-tree-branch">
                    <button class="mpn-tree-node" data-mpn-tree-toggle aria-expanded="false"><svg class="mpn-tree-caret"><use href="#i-chevron-right"/></svg>${icon("folder", "sm")}2026-08</button>
                    <div class="mpn-tree-children">
                      <button class="mpn-tree-node mpn-tree-leaf">${icon("file", "sm")}31-full.tar.zst</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mpn-split-handle" data-mpn-split></div>
          <div class="mpn-split-pane" style="padding:18px">
            <dl class="mpn-kv">
              <dt>Object</dt><dd>2026-09/14-full.tar.zst</dd>
              <dt>Size</dt><dd>1.8 GiB</dd>
              <dt>Checksum</dt><dd>sha256:9f2ae41c7b03d8</dd>
              <dt>Storage class</dt><dd>standard</dd>
              <dt>Written</dt><dd>2026-09-14 02:14 UTC</dd>
            </dl>
            <div class="mpn-row" style="margin-top:18px"><button class="mpn-btn mpn-btn-sm">${icon("download", "sm")}Download</button><button class="mpn-btn mpn-btn-sm">Restore</button><button class="mpn-btn mpn-btn-sm mpn-btn-danger">Delete</button></div>
            <div class="mpn-file-row" style="margin-top:18px">${icon("file-text")}<span class="mpn-file-name">manifest.json</span><span class="mpn-file-size">4.1 KiB</span></div>
          </div>
        </div>
      </section>`
  })
]);

pages.push([
  "timeline.html",
  shell({
    title: "Timeline",
    active: "timeline.html",
    body: `${pageHead("Work", "Timeline", "Everything that happened in jkt-01 today")}
${card("2026-09-14", `          <div class="mpn-timeline">
${[
  ["ok", "07:02", "Nightly backup started", "backup-nightly picked up 14 volumes."],
  ["danger", "08:30", "Backup failed", "Bucket quota full. 3 of 14 volumes written."],
  ["pending", "08:51", "db-02 provisioning", "Waiting on volume attach."],
  ["ok", "09:04", "API key created", "ci-deploy-key by umar — no expiry set."],
  ["warn", "09:12", "api-04 readiness degraded", "Probe exceeded its 1s budget three times."],
  ["danger", "09:13", "api-04 removed from rotation", "Load balancer dropped the last healthy replica in az-b."],
  ["ok", "09:15", "api-04 recovered", "failureThreshold raised to 3."]
].map(([s, t, title, body]) => `            <div class="mpn-timeline-item mpn-is-${s}"><strong class="mpn-mono">${t}</strong> — ${title}<div class="mpn-hint" style="margin-top:2px">${body}</div></div>`).join("\n")}
          </div>`)}`
  })
]);

const SETTINGS_TABS = [
  ["settings-profile.html", "Profile"],
  ["settings-security.html", "Security"],
  ["settings-api-keys.html", "API keys"],
  ["settings-notifications.html", "Notifications"],
  ["settings-billing.html", "Billing"]
];

const settingsTabs = (active) =>
  `      <div class="mpn-tabs">
${SETTINGS_TABS.map(([href, label]) => `        <a class="mpn-tab" href="${href}" aria-selected="${href === active}">${label}</a>`).join("\n")}
      </div>`;

pages.push([
  "settings-profile.html",
  shell({
    title: "Profile",
    active: "settings-profile.html",
    body: `${pageHead("Settings", "Profile", "How you appear to the rest of the project")}
${settingsTabs("settings-profile.html")}
${card("Identity", `          <div class="mpn-form-h">
            <label class="mpn-label" for="p-avatar">Avatar</label>
            <div class="mpn-row"><span class="mpn-avatar" style="width:52px;height:52px;font-size:16px">UM</span><button class="mpn-btn mpn-btn-sm" id="p-avatar">Upload</button><button class="mpn-btn mpn-btn-sm mpn-btn-ghost">Remove</button></div>
            <label class="mpn-label" for="p-name">Display name</label>
            <div class="mpn-field"><input class="mpn-input" id="p-name" value="Umar"><span class="mpn-hint">Shown on audit events and comments.</span></div>
            <label class="mpn-label" for="p-email">Email</label>
            <div class="mpn-field"><input class="mpn-input" id="p-email" value="umar@marspanel.dev"><span class="mpn-hint">Changing this requires re-verification.</span></div>
            <label class="mpn-label" for="p-tz">Time zone</label>
            <div class="mpn-combo" data-mpn-combo id="p-tz">
              <input class="mpn-combo-field" value="Asia/Jakarta" aria-label="Time zone">
              <div class="mpn-combo-list" hidden>
                <button class="mpn-combo-option" data-chosen>Asia/Jakarta</button>
                <button class="mpn-combo-option">Asia/Singapore</button>
                <button class="mpn-combo-option">Europe/Amsterdam</button>
                <button class="mpn-combo-option">UTC</button>
                <div class="mpn-combo-empty" hidden>No zone matches</div>
              </div>
            </div>
            <label class="mpn-label" for="p-colour">Accent</label>
            <input class="mpn-input" data-mpn-colorpicker id="p-colour" value="#6366f1" style="width:140px">
          </div>`)}
${card("Preferences", `          <div class="mpn-stack">
            <label class="mpn-check"><input type="checkbox" class="mpn-switch" checked> Use compact table density</label>
            <label class="mpn-check"><input type="checkbox" class="mpn-switch"> Show relative timestamps</label>
            <label class="mpn-check"><input type="checkbox" class="mpn-switch" checked> Confirm before destructive actions</label>
          </div>`)}
      <div class="mpn-row"><span class="mpn-spacer"></span><button class="mpn-btn">Discard</button><button class="mpn-btn mpn-btn-primary" onclick="mpnUI.toast({title:'Profile saved',state:'ok'})">Save changes</button></div>`
  })
]);

pages.push([
  "settings-security.html",
  shell({
    title: "Security",
    active: "settings-security.html",
    body: `${pageHead("Settings", "Security", "Sign-in, sessions and recovery")}
${settingsTabs("settings-security.html")}
      <div class="mpn-banner mpn-is-ok">${icon("shield-check")}<span>Two-factor authentication is enforced for every owner in this project.</span></div>
${card("Password", `          <div class="mpn-form-h">
            <label class="mpn-label" for="s-old">Current password</label>
            <input class="mpn-input" id="s-old" type="password" value="············">
            <label class="mpn-label" for="s-new">New password</label>
            <div class="mpn-field"><input class="mpn-input" id="s-new" type="password"><div class="mpn-progress" style="margin-top:6px"><span class="mpn-progress-fill" style="width:35%"></span></div><span class="mpn-hint">Minimum 14 characters. A passphrase beats complexity rules.</span></div>
          </div>`)}
${card("Active sessions", `          <div class="mpn-list mpn-list-flush">
${[
  ["macOS · Chrome", "Jakarta, ID · current session", "ok", "now"],
  ["iOS · Safari", "Jakarta, ID", "idle", "2h"],
  ["Linux · Firefox", "Amsterdam, NL", "warn", "6d"]
].map(
  ([dev, loc, state, ago]) => `            <div class="mpn-list-item"><span class="mpn-media-thumb">${icon("globe")}</span><div class="mpn-list-body"><div class="mpn-list-title">${dev}</div><div class="mpn-list-sub">${loc}</div></div><div class="mpn-list-end">${pill(state, ago)}<button class="mpn-btn mpn-btn-sm">Revoke</button></div></div>`
).join("\n")}
          </div>`)}
${card("Recovery codes", `          <div class="mpn-row" style="gap:16px">${il("403", "sm")}<div><strong>8 of 10 codes remaining</strong><p class="mpn-muted" style="margin-top:6px;max-width:50ch">Recovery codes are the only way back in if you lose every registered device. They are shown once.</p><button class="mpn-btn mpn-btn-sm" style="margin-top:12px">Regenerate codes</button></div></div>`)}`
  })
]);

pages.push([
  "settings-api-keys.html",
  shell({
    title: "API keys",
    active: "settings-api-keys.html",
    body: `${pageHead("Settings", "API keys", "4 keys · 1 without an expiry", `<button class="mpn-btn mpn-btn-primary">${icon("plus", "sm")}Create key</button>`)}
${settingsTabs("settings-api-keys.html")}
      <div class="mpn-banner mpn-is-warn">${icon("key")}<span><strong class="mpn-mono">ci-deploy-key</strong> has no expiry. A key that never expires is a key you will forget to rotate.</span><button class="mpn-btn mpn-btn-sm mpn-banner-act">Set expiry</button></div>
      <section class="mpn-card">
        <div class="mpn-table-wrap">
          <table class="mpn-table" data-mpn-sort>
            <thead><tr><th data-sort="text">Name</th><th data-sort="text">Prefix</th><th data-sort="text">Scope</th><th data-sort="text">Expires</th><th data-sort="text">Last used</th><th class="mpn-cell-act"></th></tr></thead>
            <tbody>
              <tr class="mpn-row-warn"><td class="mpn-cell-key">ci-deploy-key</td><td class="mpn-cell-mono">mpk_7f2a…</td><td>${pill("danger", "write")}</td><td class="mpn-cell-mono">never</td><td class="mpn-cell-mono">4m ago</td><td class="mpn-cell-act"><button class="mpn-icon-btn mpn-icon-btn-bare">${icon("more", "sm")}</button></td></tr>
              <tr><td class="mpn-cell-key">grafana-scrape</td><td class="mpn-cell-mono">mpk_91cd…</td><td>${pill("ok", "read")}</td><td class="mpn-cell-mono">2026-12-01</td><td class="mpn-cell-mono">12s ago</td><td class="mpn-cell-act"><button class="mpn-icon-btn mpn-icon-btn-bare">${icon("more", "sm")}</button></td></tr>
              <tr><td class="mpn-cell-key">laptop-cli</td><td class="mpn-cell-mono">mpk_3b84…</td><td>${pill("warn", "admin")}</td><td class="mpn-cell-mono">2026-10-02</td><td class="mpn-cell-mono">2d ago</td><td class="mpn-cell-act"><button class="mpn-icon-btn mpn-icon-btn-bare">${icon("more", "sm")}</button></td></tr>
              <tr><td class="mpn-cell-key">old-runner</td><td class="mpn-cell-mono">mpk_c410…</td><td>${pill("idle", "revoked")}</td><td class="mpn-cell-mono">2026-06-30</td><td class="mpn-cell-mono">89d ago</td><td class="mpn-cell-act"><button class="mpn-icon-btn mpn-icon-btn-bare">${icon("more", "sm")}</button></td></tr>
            </tbody>
          </table>
        </div>
      </section>
${card("Create a key", `          <div class="mpn-grid mpn-g-2">
            <div class="mpn-field"><label class="mpn-label" for="k-name">Name</label><input class="mpn-input mpn-input-mono" id="k-name" placeholder="ci-deploy-key-2"></div>
            <div class="mpn-field"><label class="mpn-label" for="k-exp">Expires</label><input class="mpn-input" id="k-exp" data-mpn-datepicker placeholder="YYYY-MM-DD"></div>
          </div>
          <div class="mpn-choice-grid" style="margin-top:16px">
            <label class="mpn-choice"><input type="radio" name="scope" class="mpn-sr" checked><div><div class="mpn-label">Read</div><div class="mpn-hint">List and describe only.</div></div></label>
            <label class="mpn-choice"><input type="radio" name="scope" class="mpn-sr"><div><div class="mpn-label">Write</div><div class="mpn-hint">Create and mutate resources.</div></div></label>
            <label class="mpn-choice"><input type="radio" name="scope" class="mpn-sr"><div><div class="mpn-label">Admin</div><div class="mpn-hint">Everything, including IAM.</div></div></label>
          </div>`)}`
  })
]);

pages.push([
  "settings-notifications.html",
  shell({
    title: "Notification settings",
    active: "settings-notifications.html",
    body: `${pageHead("Settings", "Notifications", "Which events reach you, and where")}
${settingsTabs("settings-notifications.html")}
      <section class="mpn-card">
        <div class="mpn-table-wrap">
          <table class="mpn-table">
            <thead><tr><th>Event</th><th>Email</th><th>Push</th><th>Webhook</th></tr></thead>
            <tbody>
${[
  ["Instance failed", true, true, true],
  ["Quota above 90%", true, true, false],
  ["Backup failed", true, true, true],
  ["Certificate expiring", true, false, false],
  ["Node cordoned", false, false, true],
  ["Weekly cost digest", true, false, false]
].map(
  ([label, a, b, c]) => `              <tr><td style="color:var(--mpn-fg)">${label}</td>
                <td><input type="checkbox" class="mpn-switch"${a ? " checked" : ""} aria-label="Email"></td>
                <td><input type="checkbox" class="mpn-switch"${b ? " checked" : ""} aria-label="Push"></td>
                <td><input type="checkbox" class="mpn-switch"${c ? " checked" : ""} aria-label="Webhook"></td></tr>`
).join("\n")}
            </tbody>
          </table>
        </div>
      </section>
${card("Quiet hours", `          <div class="mpn-form-inline">
            <div class="mpn-field"><label class="mpn-label" for="q-from">From</label><input class="mpn-input" id="q-from" type="time" value="22:00" style="width:130px"></div>
            <div class="mpn-field"><label class="mpn-label" for="q-to">To</label><input class="mpn-input" id="q-to" type="time" value="07:00" style="width:130px"></div>
            <label class="mpn-check"><input type="checkbox" class="mpn-switch" checked> Still page me for <strong style="margin-inline-start:4px">danger</strong></label>
          </div>`)}`
  })
]);

pages.push([
  "settings-billing.html",
  shell({
    title: "Billing",
    active: "settings-billing.html",
    body: `${pageHead("Settings", "Billing", "Usage this cycle and payment method", `<a class="mpn-btn" href="invoice.html">${icon("file-text", "sm")}View invoice</a>`)}
${settingsTabs("settings-billing.html")}
      <div class="mpn-grid mpn-g-4">
        <div class="mpn-card"><div class="mpn-card-body"><div class="mpn-stat-label">This cycle</div><div class="mpn-stat-value">$12,480</div><div class="mpn-stat-meta"><span class="mpn-delta mpn-delta-up">▲ 12.4%</span> vs last</div></div></div>
        <div class="mpn-card"><div class="mpn-card-body"><div class="mpn-stat-label">Forecast</div><div class="mpn-stat-value">$18,220</div><div class="mpn-stat-meta">by 2026-09-30</div></div></div>
        <div class="mpn-card"><div class="mpn-card-body"><div class="mpn-stat-label">Budget</div><div class="mpn-stat-value">68%</div><div class="mpn-meter"><span class="mpn-meter-fill" style="width:68%"></span></div></div></div>
        <div class="mpn-card"><div class="mpn-card-body"><div class="mpn-stat-label">Credits</div><div class="mpn-stat-value">$2,000</div><div class="mpn-stat-meta">expires 2026-12-31</div></div></div>
      </div>
${card("Cost by service", `          <div class="mpn-stack-bar"><span class="mpn-stack-seg mpn-is-info" style="width:46%"></span><span class="mpn-stack-seg mpn-is-pending" style="width:24%"></span><span class="mpn-stack-seg mpn-is-ok" style="width:18%"></span><span class="mpn-stack-seg mpn-is-warn" style="width:12%"></span></div>
          <div class="mpn-legend" style="padding:14px 0 0">
            <span class="mpn-legend-item"><i class="mpn-legend-swatch" style="background:var(--mpn-info)"></i>Compute $5,740</span>
            <span class="mpn-legend-item"><i class="mpn-legend-swatch" style="background:var(--mpn-pending)"></i>Storage $2,995</span>
            <span class="mpn-legend-item"><i class="mpn-legend-swatch" style="background:var(--mpn-ok)"></i>Network $2,246</span>
            <span class="mpn-legend-item"><i class="mpn-legend-swatch" style="background:var(--mpn-warn)"></i>Support $1,499</span>
          </div>`)}
${card("Payment method", `          <div class="mpn-row" style="gap:16px"><span class="mpn-media-thumb is-accent">${icon("credit-card")}</span><div><strong class="mpn-mono">•••• •••• •••• 4471</strong><div class="mpn-hint">Expires 07/2029 · billed monthly in USD</div></div><span class="mpn-spacer"></span><button class="mpn-btn mpn-btn-sm">Update</button></div>`)}`
  })
]);

pages.push([
  "invoice.html",
  shell({
    title: "Invoice",
    active: "invoice.html",
    body: `${pageHead("Billing", "Invoice MPN-2026-0914", "Issued 2026-09-14 · due 2026-09-28", `<button class="mpn-btn">${icon("download", "sm")}PDF</button><button class="mpn-btn mpn-btn-primary" onclick="window.print()">${icon("printer", "sm")}Print</button>`)}
      <section class="mpn-card">
        <div class="mpn-card-body">
          <div class="mpn-grid mpn-g-2" style="margin-bottom:24px">
            <div><div class="mpn-eyebrow">From</div><p style="margin-top:8px;line-height:1.7">marspanel Cloud<br><span class="mpn-muted">Jl. Jend. Sudirman 52<br>Jakarta 12190, Indonesia</span></p></div>
            <div><div class="mpn-eyebrow">Billed to</div><p style="margin-top:8px;line-height:1.7">Umar Sabirin<br><span class="mpn-muted">umar@marspanel.dev<br>Project jkt-prod</span></p></div>
          </div>
          <div class="mpn-table-wrap">
            <table class="mpn-table mpn-table-bordered">
              <thead><tr><th>Description</th><th class="mpn-cell-num">Qty</th><th class="mpn-cell-num">Unit</th><th class="mpn-cell-num">Amount</th></tr></thead>
              <tbody>
                <tr><td>Compute · c2.4x instance-hours</td><td class="mpn-cell-num">5,760</td><td class="mpn-cell-num">$0.62</td><td class="mpn-cell-num">$3,571.20</td></tr>
                <tr><td>Compute · m4.2x instance-hours</td><td class="mpn-cell-num">1,440</td><td class="mpn-cell-num">$1.51</td><td class="mpn-cell-num">$2,174.40</td></tr>
                <tr><td>Block storage · GiB-month</td><td class="mpn-cell-num">11,980</td><td class="mpn-cell-num">$0.25</td><td class="mpn-cell-num">$2,995.00</td></tr>
                <tr><td>Egress · GiB</td><td class="mpn-cell-num">24,955</td><td class="mpn-cell-num">$0.09</td><td class="mpn-cell-num">$2,245.95</td></tr>
                <tr><td>Support · business tier</td><td class="mpn-cell-num">1</td><td class="mpn-cell-num">$1,499.00</td><td class="mpn-cell-num">$1,499.00</td></tr>
              </tbody>
            </table>
          </div>
          <dl class="mpn-kv" style="margin-top:20px;margin-inline-start:auto;max-width:320px">
            <dt>Subtotal</dt><dd>$12,485.55</dd>
            <dt>Credits applied</dt><dd>−$2,000.00</dd>
            <dt>VAT 11%</dt><dd>$1,153.41</dd>
            <dt style="color:var(--mpn-fg);font-weight:600">Total due</dt><dd style="font-size:var(--mpn-fs-lg);font-weight:700">$11,638.96</dd>
          </dl>
        </div>
        <div class="mpn-card-foot"><span class="mpn-hint">Payment terms net 14. Late balances accrue 1.5% monthly.</span><span class="mpn-spacer"></span>${pill("warn", "unpaid")}</div>
      </section>`
  })
]);

pages.push([
  "pricing.html",
  shell({
    title: "Pricing",
    active: "pricing.html",
    body: `${pageHead("Billing", "Pricing", "Three tiers. No per-seat charges.")}
      <div class="mpn-grid mpn-g-3">
${[
  ["Starter", "$0", "Single node, no SLA", ["1 node", "5 instances", "7-day logs", "Community support"], false],
  ["Business", "$1,499", "Multi-node with N+1", ["Unlimited nodes", "Unlimited instances", "400-day audit log", "24×7 support", "99.9% SLA"], true],
  ["Air-gapped", "Contact", "On-premise, no egress", ["Everything in Business", "Offline licence", "Signed binaries", "Dedicated engineer"], false]
].map(
  ([name, price, sub, feats, hot]) => `        <section class="mpn-card${hot ? " mpn-card-state mpn-is-info" : ""}">
          <div class="mpn-card-body">
            <div class="mpn-row"><div class="mpn-stat-label">${name}</div>${hot ? pill("info", "popular") : ""}</div>
            <div class="mpn-stat-value">${price}${price.startsWith("$") && price !== "$0" ? '<span class="mpn-stat-unit">/mo</span>' : ""}</div>
            <div class="mpn-stat-meta">${sub}</div>
            <div class="mpn-stack" style="gap:8px;margin-top:18px">
${feats.map((f) => `              <div class="mpn-row" style="gap:8px"><svg class="mpn-icon mpn-icon-sm" style="color:var(--mpn-ok)"><use href="#i-check"/></svg><span class="mpn-muted">${f}</span></div>`).join("\n")}
            </div>
            <button class="mpn-btn ${hot ? "mpn-btn-primary" : ""} mpn-btn-block" style="margin-top:20px">${hot ? "Upgrade" : "Choose"}</button>
          </div>
        </section>`
).join("\n")}
      </div>
${card("Frequently asked", `          <div class="mpn-accordion" style="margin:-18px">
            <details open><summary class="mpn-summary">Do you charge per seat?</summary><div class="mpn-accordion-body">No. Add as many people as you need; you pay for nodes and usage.</div></details>
            <details><summary class="mpn-summary">What happens above the budget?</summary><div class="mpn-accordion-body">Nothing is switched off. You get a danger-level alert at 100% and a second at 120%.</div></details>
            <details><summary class="mpn-summary">Can I run this offline?</summary><div class="mpn-accordion-body">Yes — that is what the air-gapped tier is. One signed binary, no outbound calls, licence checked from a file.</div></details>
          </div>`)}`
  })
]);

pages.push([
  "faq.html",
  shell({
    title: "Help",
    active: "faq.html",
    body: `${pageHead("Support", "Help", "The questions that actually get asked")}
      <div class="mpn-grid mpn-g-side">
        <div class="mpn-stack">
${card("Operations", `          <div class="mpn-accordion" style="margin:-18px">
            <details open><summary class="mpn-summary">Why did my instance restart by itself?</summary><div class="mpn-accordion-body">The liveness probe failed its threshold. Liveness restarts the container; readiness only pulls it out of load balancer rotation. If a slow warmup is the cause, you want readiness, not liveness.</div></details>
            <details><summary class="mpn-summary">Is a snapshot a backup?</summary><div class="mpn-accordion-body">No. A snapshot is copy-on-write on the same node and dies with that node. A backup is written to object storage and survives losing the node entirely.</div></details>
            <details><summary class="mpn-summary">What does N+1 mean here?</summary><div class="mpn-accordion-body">Every workload still fits after losing any single node. At 92% memory quota this cluster no longer does — losing jkt-01 would leave 6 workloads unschedulable.</div></details>
            <details><summary class="mpn-summary">Security group, network ACL, network policy — which one?</summary><div class="mpn-accordion-body">Security group is stateful and attaches to a workload. Network ACL is stateless and attaches to a subnet. Network policy is label-based and governs workload-to-workload traffic. They are three different things, not three names for a firewall.</div></details>
          </div>`)}
${card("Console", `          <div class="mpn-accordion" style="margin:-18px">
            <details><summary class="mpn-summary">Keyboard shortcuts</summary><div class="mpn-accordion-body"><div class="mpn-row"><kbd class="mpn-kbd">⌘K</kbd><span>command palette</span></div><div class="mpn-row" style="margin-top:8px"><kbd class="mpn-kbd">Esc</kbd><span>close any overlay</span></div><div class="mpn-row" style="margin-top:8px"><kbd class="mpn-kbd">←</kbd><kbd class="mpn-kbd">→</kbd><span>move between tabs</span></div></div></details>
            <details><summary class="mpn-summary">Does the console work offline?</summary><div class="mpn-accordion-body">It makes no network requests of its own — no fonts, no icon CDN, no analytics. Only your own API calls leave the page.</div></details>
          </div>`)}
        </div>
        <div class="mpn-stack">
${card("Still stuck?", `          <div class="mpn-empty" style="padding:8px">${il("success", "sm")}<div class="mpn-empty-title">Support responds in under 4h</div><p>Business tier, 24×7.</p><button class="mpn-btn mpn-btn-primary mpn-btn-sm">Open a ticket</button></div>`)}
${card("Status", `          <div class="mpn-stack" style="gap:10px">
            <div class="mpn-row">${pill("ok", "ok")}<span class="mpn-muted">Control plane</span></div>
            <div class="mpn-row">${pill("ok", "ok")}<span class="mpn-muted">Object storage</span></div>
            <div class="mpn-row">${pill("warn", "degraded")}<span class="mpn-muted">Registry (jkt)</span></div>
          </div>`)}
        </div>
      </div>`
  })
]);

pages.push([
  "blank.html",
  shell({
    title: "Blank page",
    active: "blank.html",
    body: `${pageHead("Starter", "Blank page", "Copy this file and start from here", `<button class="mpn-btn">Secondary</button><button class="mpn-btn mpn-btn-primary">${icon("plus", "sm")}Primary</button>`)}
${card("Section title", `          <p class="mpn-muted">Everything above this card is the shell: sidebar, topbar, page head. Replace this body and keep the rest.</p>`, { sub: "Optional subtitle" })}`
  })
]);

pages.push([
  "search.html",
  shell({
    title: "Search",
    active: "",
    body: `${pageHead("Search", 'Results for <span class="mpn-mono">failed</span>', "7 matches across instances, events and audit log")}
      <div class="mpn-row"><button class="mpn-chip" aria-pressed="true">All 7</button><button class="mpn-chip">Instances 2</button><button class="mpn-chip">Events 3</button><button class="mpn-chip">Audit 2</button></div>
      <section class="mpn-card">
        <div class="mpn-list">
${[
  ["server", "cache-01", "Instance · node-jkt-03", "danger", "failed"],
  ["server", "api-04", "Instance · node-jkt-02", "info", "degraded"],
  ["activity", "backup-nightly failed", "Event · 08:30 today", "danger", "event"],
  ["activity", "api-04 readiness failed 3×", "Event · 09:12 today", "warn", "event"],
  ["shield", "instance.delete denied", "Audit · kadek · 08:58", "danger", "audit"]
].map(
  ([ic, title, sub, state, label]) => `          <a class="mpn-list-item" href="instance-detail.html"><span class="mpn-media-thumb">${icon(ic)}</span><div class="mpn-list-body"><div class="mpn-list-title">${title}</div><div class="mpn-list-sub">${sub}</div></div><div class="mpn-list-end">${pill(state, label)}</div></a>`
).join("\n")}
        </div>
      </section>`
  })
]);

const ERRORS = [
  ["403.html", "Forbidden", "error 403", "You are not allowed here", 'Your role <span class="mpn-code-inline">viewer</span> cannot read audit events in project <span class="mpn-mono">jkt-prod</span>. An owner can grant it without a new account.', "403", `<button class="mpn-btn">${icon("arrow-left", "sm")}Go back</button><button class="mpn-btn mpn-btn-primary">Request access</button>`],
  ["500.html", "Server error", "error 500", "The control plane failed", 'The scheduler returned an error while placing your request. The incident is already open — quote <span class="mpn-mono">req-4f21c9</span> if you contact support.', "500", `<button class="mpn-btn">${icon("refresh", "sm")}Retry</button><a class="mpn-btn mpn-btn-primary" href="dashboard.html">Dashboard</a>`],
  ["503.html", "Maintenance", "error 503", "Down for maintenance", 'node-jkt-03 is rebooting as scheduled. Workloads drained first, so running instances elsewhere are unaffected. Expected back at <span class="mpn-mono">02:40 UTC</span>.', "maintenance", `<button class="mpn-btn">${icon("bell", "sm")}Notify me</button><a class="mpn-btn mpn-btn-primary" href="dashboard.html">Dashboard</a>`],
  ["offline.html", "Offline", "connection lost", "Control plane unreachable", 'The console is fine — it makes no requests of its own. It is the API behind it that stopped answering. Last successful poll was 4 minutes ago.', "offline", `<button class="mpn-btn mpn-btn-primary">${icon("refresh", "sm")}Retry now</button>`]
];

for (const [file, title, code, heading, body, art, actions] of ERRORS) {
  pages.push([file, shell({ title, active: "", body: stateShell(code, heading, body, art, actions) })]);
}

pages.push([
  "register.html",
  authPage({
    title: "Create account",
    heading: "Create account",
    sub: "Invitations are project-scoped. You cannot self-serve into jkt-prod.",
    body: `      <div class="mpn-field"><label class="mpn-label" for="r-name">Full name</label><input class="mpn-input" id="r-name" placeholder="Umar Sabirin"></div>
      <div class="mpn-field"><label class="mpn-label" for="r-email">Work email</label><input class="mpn-input" id="r-email" type="email" placeholder="you@company.com"></div>
      <div class="mpn-field"><label class="mpn-label" for="r-pass">Password</label><input class="mpn-input" id="r-pass" type="password"><div class="mpn-progress" style="margin-top:6px"><span class="mpn-progress-fill" style="width:20%"></span></div><span class="mpn-hint">Minimum 14 characters. A passphrase beats complexity rules.</span></div>
      <div class="mpn-field"><label class="mpn-label" for="r-code">Invitation code</label><input class="mpn-input mpn-input-mono" id="r-code" placeholder="MPN-XXXX-XXXX"></div>
      <label class="mpn-check"><input type="checkbox"> I have read the acceptable use policy</label>
      <button class="mpn-btn mpn-btn-primary mpn-btn-lg mpn-btn-block">${icon("user-plus", "sm")}Create account</button>`,
    footer: `      <p class="mpn-hint" style="text-align:center">Already have one? <a class="mpn-link" href="login.html">Sign in</a></p>`
  })
]);

pages.push([
  "forgot-password.html",
  authPage({
    title: "Reset password",
    heading: "Reset password",
    sub: "We send a single-use link that expires in 15 minutes.",
    body: `      <div class="mpn-banner mpn-is-info">${icon("info")}<span>For security we send the same response whether or not the address exists.</span></div>
      <div class="mpn-field"><label class="mpn-label" for="f-email">Email</label><input class="mpn-input" id="f-email" type="email" value="umar@marspanel.dev"></div>
      <button class="mpn-btn mpn-btn-primary mpn-btn-lg mpn-btn-block">${icon("mail", "sm")}Send reset link</button>`,
    footer: `      <p class="mpn-hint" style="text-align:center"><a class="mpn-link" href="login.html">Back to sign in</a></p>`
  })
]);

pages.push([
  "reset-password.html",
  authPage({
    title: "Choose a new password",
    heading: "Choose a new password",
    sub: "This link expires in 11 minutes.",
    body: `      <div class="mpn-field"><label class="mpn-label" for="n-pass">New password</label><input class="mpn-input" id="n-pass" type="password"><div class="mpn-progress" style="margin-top:6px"><span class="mpn-progress-fill" style="width:72%"></span></div><span class="mpn-hint">Strong. Avoid anything you have used on another site.</span></div>
      <div class="mpn-field is-invalid"><label class="mpn-label" for="n-conf">Confirm password</label><input class="mpn-input" id="n-conf" type="password" aria-invalid="true"><span class="mpn-error">The two entries do not match.</span></div>
      <label class="mpn-check"><input type="checkbox" checked> Sign out every other session</label>
      <button class="mpn-btn mpn-btn-primary mpn-btn-lg mpn-btn-block">${icon("check", "sm")}Set password</button>`,
    footer: `      <p class="mpn-hint" style="text-align:center">Link expired? <a class="mpn-link" href="forgot-password.html">Request a new one</a></p>`
  })
]);

pages.push([
  "two-factor.html",
  authPage({
    title: "Two-factor",
    heading: "Verify it is you",
    sub: "Enter the 6-digit code from your authenticator.",
    body: `      <div class="mpn-field"><span class="mpn-label">Verification code</span><div class="mpn-otp"><input value="4" maxlength="1" inputmode="numeric"><input value="1" maxlength="1" inputmode="numeric"><input value="8" maxlength="1" inputmode="numeric"><input maxlength="1" inputmode="numeric"><input maxlength="1" inputmode="numeric"><input maxlength="1" inputmode="numeric"></div><span class="mpn-hint">Code refreshes in <strong class="mpn-mono">18s</strong></span></div>
      <label class="mpn-check"><input type="checkbox"> Trust this device for 30 days</label>
      <button class="mpn-btn mpn-btn-primary mpn-btn-lg mpn-btn-block">${icon("shield-check", "sm")}Verify</button>
      <div class="auth-sep">or</div>
      <button class="mpn-btn mpn-btn-block">${icon("key", "sm")}Use a recovery code</button>`,
    footer: `      <p class="mpn-hint" style="text-align:center">Lost every device? <a class="mpn-link" href="#">Contact an owner</a></p>`
  })
]);

pages.push([
  "verify-email.html",
  authPage({
    title: "Verify email",
    heading: "Check your inbox",
    sub: "We sent a confirmation link to umar@marspanel.dev.",
    body: `      <div style="display:flex;justify-content:center">${il("success")}</div>
      <div class="mpn-banner mpn-is-info">${icon("clock")}<span>The link expires in <strong class="mpn-mono">24h</strong>. Until then the account can sign in but cannot create resources.</span></div>
      <button class="mpn-btn mpn-btn-block">${icon("refresh", "sm")}Resend email</button>`,
    footer: `      <p class="mpn-hint" style="text-align:center">Wrong address? <a class="mpn-link" href="settings-profile.html">Change it</a></p>`
  })
]);

pages.push([
  "lock-screen.html",
  authPage({
    title: "Locked",
    heading: "Session locked",
    sub: "Locked after 15 minutes idle. Your work is still open.",
    body: `      <div class="mpn-row" style="justify-content:center;margin-block:8px"><span class="mpn-avatar" style="width:64px;height:64px;font-size:20px">UM</span></div>
      <p style="text-align:center"><strong>Umar</strong><br><span class="mpn-hint">umar@marspanel.dev</span></p>
      <div class="mpn-field"><label class="mpn-label" for="l-pass">Password</label><input class="mpn-input" id="l-pass" type="password" autofocus></div>
      <button class="mpn-btn mpn-btn-primary mpn-btn-lg mpn-btn-block">${icon("unlock", "sm")}Unlock</button>`,
    footer: `      <p class="mpn-hint" style="text-align:center"><a class="mpn-link" href="login.html">Sign in as someone else</a></p>`
  })
]);

for (const [file, html] of pages) writeFileSync(out(file), html);
console.log(pages.length + " pages written");
for (const [file] of pages) console.log("  pages/" + file);

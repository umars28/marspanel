(function () {
  var root = document.documentElement;
  var FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  var stack = [];
  var scrim = null;

  function rtl() {
    return getComputedStyle(root).direction === "rtl";
  }

  function showScrim() {
    if (scrim) return;
    scrim = document.createElement("div");
    scrim.className = "mpn-scrim";
    scrim.addEventListener("click", function () {
      close(stack[stack.length - 1]);
    });
    document.body.appendChild(scrim);
  }

  function hideScrim() {
    if (scrim && !stack.length) {
      scrim.remove();
      scrim = null;
    }
  }

  function open(el) {
    if (!el || stack.indexOf(el) !== -1) return;
    el.__return = document.activeElement;
    el.hidden = false;
    stack.push(el);
    showScrim();
    var first = el.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function close(el) {
    var i = stack.indexOf(el);
    if (i === -1) return;
    stack.splice(i, 1);
    el.hidden = true;
    hideScrim();
    if (el.__return && el.__return.focus) el.__return.focus();
  }

  function place(pop, anchor, gap) {
    gap = gap == null ? 6 : gap;
    pop.hidden = false;
    pop.style.position = "fixed";
    pop.style.inset = "auto";
    var a = anchor.getBoundingClientRect();
    var p = pop.getBoundingClientRect();
    var top = a.bottom + gap;
    if (top + p.height > window.innerHeight - 8) {
      top = Math.max(8, a.top - p.height - gap);
    }
    var left = rtl() ? a.right - p.width : a.left;
    left = Math.min(Math.max(8, left), window.innerWidth - p.width - 8);
    pop.style.top = top + "px";
    pop.style.left = left + "px";
  }

  function closePops(except) {
    document.querySelectorAll(".mpn-menu:not([hidden]), .mpn-popover:not([hidden])").forEach(function (m) {
      if (m !== except) m.hidden = true;
    });
  }

  document.addEventListener("click", function (e) {
    var t = e.target;

    var navToggle = t.closest("[data-mpn-nav-toggle]");
    if (navToggle) {
      root.setAttribute("data-nav", root.getAttribute("data-nav") === "open" ? "closed" : "open");
      return;
    }

    var lock = t.closest("[data-mpn-sidebar-lock]");
    if (lock) {
      var railed = root.getAttribute("data-sidebar") === "rail";
      root.setAttribute("data-sidebar", railed ? "full" : "rail");
      lock.setAttribute("aria-pressed", String(!railed));
      try {
        localStorage.setItem("mpn-sidebar", railed ? "full" : "rail");
      } catch (err) {}
      return;
    }

    var themeBtn = t.closest("[data-mpn-theme-toggle]");
    if (themeBtn && window.mpnTheme) {
      window.mpnTheme.toggle();
      return;
    }

    var dirBtn = t.closest("[data-mpn-dir-toggle]");
    if (dirBtn) {
      var next = root.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
      root.setAttribute("dir", next);
      try {
        localStorage.setItem("mpn-dir", next);
      } catch (err) {}
      return;
    }

    var group = t.closest("[data-mpn-nav-group]");
    if (group) {
      e.preventDefault();
      var openNow = group.getAttribute("aria-expanded") === "true";
      group.setAttribute("aria-expanded", String(!openNow));
      var sub = group.nextElementSibling;
      if (sub && sub.classList.contains("mpn-nav-sub")) sub.hidden = openNow;
      return;
    }

    var twig = t.closest("[data-mpn-tree-toggle]");
    if (twig) {
      e.preventDefault();
      var branch = twig.closest(".mpn-tree-branch");
      branch.toggleAttribute("data-open");
      twig.setAttribute("aria-expanded", String(branch.hasAttribute("data-open")));
      return;
    }

    var opener = t.closest("[data-mpn-open]");
    if (opener) {
      e.preventDefault();
      open(document.getElementById(opener.getAttribute("data-mpn-open")));
      return;
    }

    var closer = t.closest("[data-mpn-close]");
    if (closer) {
      e.preventDefault();
      close(closer.closest(".mpn-modal, .mpn-drawer, .mpn-palette"));
      return;
    }

    var pop = t.closest("[data-mpn-menu], [data-mpn-popover]");
    if (pop) {
      e.preventDefault();
      var id = pop.getAttribute("data-mpn-menu") || pop.getAttribute("data-mpn-popover");
      var el = document.getElementById(id);
      closePops(el);
      if (el) {
        if (el.hidden) place(el, pop);
        else el.hidden = true;
      }
      return;
    }

    var tab = t.closest('[data-mpn-tabs] [role="tab"]');
    if (tab) {
      e.preventDefault();
      selectTab(tab);
      return;
    }

    var step = t.closest("[data-mpn-steps] .mpn-step");
    if (step) {
      e.preventDefault();
      selectStep(step);
      return;
    }

    var stepNav = t.closest("[data-mpn-step-next], [data-mpn-step-prev]");
    if (stepNav) {
      e.preventDefault();
      var wrap = document.getElementById(
        stepNav.getAttribute("data-mpn-step-next") || stepNav.getAttribute("data-mpn-step-prev")
      );
      var steps = Array.prototype.slice.call(wrap.querySelectorAll(".mpn-step"));
      var cur = wrap.querySelector('.mpn-step[aria-current="step"]');
      var idx = steps.indexOf(cur) + (stepNav.hasAttribute("data-mpn-step-next") ? 1 : -1);
      if (steps[idx]) selectStep(steps[idx]);
      return;
    }

    var sortTh = t.closest("[data-mpn-sort] th[data-sort]");
    if (sortTh) {
      sortTable(sortTh);
      return;
    }

    if (!t.closest(".mpn-menu, .mpn-popover, .mpn-combo")) closePops();
  });

  function selectTab(tab) {
    var group = tab.closest("[data-mpn-tabs]");
    group.querySelectorAll('[role="tab"]').forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
  }

  function selectStep(step) {
    var wrap = step.closest("[data-mpn-steps]");
    var steps = Array.prototype.slice.call(wrap.querySelectorAll(".mpn-step"));
    var idx = steps.indexOf(step);
    steps.forEach(function (s, i) {
      s.removeAttribute("aria-current");
      s.removeAttribute("data-done");
      if (i < idx) s.setAttribute("data-done", "");
      if (i === idx) s.setAttribute("aria-current", "step");
      var panel = document.getElementById(s.getAttribute("aria-controls"));
      if (panel) panel.hidden = i !== idx;
    });
    wrap.dispatchEvent(new CustomEvent("mpn:step", { detail: { index: idx }, bubbles: true }));
  }

  function cellValue(row, index, type) {
    var cell = row.children[index];
    var raw = (cell.getAttribute("data-value") || cell.textContent).trim();
    if (type === "num") return parseFloat(raw.replace(/[^0-9.eE+-]/g, "")) || 0;
    return raw.toLowerCase();
  }

  function sortTable(th) {
    var table = th.closest("table");
    var index = Array.prototype.indexOf.call(th.parentNode.children, th);
    var type = th.getAttribute("data-sort") || "text";
    var dir = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
    var sign = dir === "ascending" ? 1 : -1;
    th.parentNode.querySelectorAll("th").forEach(function (o) {
      o.removeAttribute("aria-sort");
    });
    th.setAttribute("aria-sort", dir);
    var body = table.tBodies[0];
    Array.prototype.slice
      .call(body.rows)
      .sort(function (a, b) {
        var va = cellValue(a, index, type);
        var vb = cellValue(b, index, type);
        return va < vb ? -sign : va > vb ? sign : 0;
      })
      .forEach(function (r) {
        body.appendChild(r);
      });
  }

  document.addEventListener("input", function (e) {
    var filter = e.target.closest("[data-mpn-filter]");
    if (filter) {
      var table = document.getElementById(filter.getAttribute("data-mpn-filter"));
      var q = filter.value.trim().toLowerCase();
      var shown = 0;
      table.tBodies[0].querySelectorAll("tr").forEach(function (row) {
        var hit = !q || row.textContent.toLowerCase().indexOf(q) !== -1;
        row.hidden = !hit;
        if (hit) shown++;
      });
      var out = document.querySelector("[data-mpn-filter-count]");
      if (out) out.textContent = String(shown);
      return;
    }

    var field = e.target.closest(".mpn-palette-field");
    if (field) {
      var q2 = field.value.trim().toLowerCase();
      var list = field.closest(".mpn-palette").querySelector(".mpn-palette-list");
      list.querySelectorAll(".mpn-palette-item").forEach(function (item) {
        item.hidden = q2 !== "" && item.textContent.toLowerCase().indexOf(q2) === -1;
      });
      list.querySelectorAll(".mpn-palette-group").forEach(function (g) {
        var sib = g.nextElementSibling;
        var any = false;
        while (sib && sib.classList.contains("mpn-palette-item")) {
          if (!sib.hidden) any = true;
          sib = sib.nextElementSibling;
        }
        g.hidden = !any;
      });
      return;
    }

    var counted = e.target.closest("[data-mpn-count]");
    if (counted) {
      var target = document.getElementById(counted.getAttribute("data-mpn-count"));
      if (target) target.textContent = counted.value.length + " / " + (counted.maxLength > 0 ? counted.maxLength : "∞");
    }
  });

  document.addEventListener("change", function (e) {
    var all = e.target.closest("[data-mpn-select-all]");
    if (all) {
      var table = all.closest("table");
      table.querySelectorAll("tbody [data-mpn-row-check]").forEach(function (box) {
        box.checked = all.checked;
        box.closest("tr").setAttribute("aria-selected", String(all.checked));
      });
      syncBulk(table);
      return;
    }

    var box = e.target.closest("[data-mpn-row-check]");
    if (box) {
      box.closest("tr").setAttribute("aria-selected", String(box.checked));
      syncBulk(box.closest("table"));
    }
  });

  function syncBulk(table) {
    var wrap = table.closest(".mpn-card") || document;
    var bar = wrap.querySelector("[data-mpn-bulkbar]");
    if (!bar) return;
    var n = table.querySelectorAll("tbody [data-mpn-row-check]:checked").length;
    bar.hidden = n === 0;
    var count = bar.querySelector("[data-mpn-bulk-count]");
    if (count) count.textContent = String(n);
  }

  var tip = null;

  function showTip(anchor) {
    hideTip();
    tip = document.createElement("div");
    tip.className = "mpn-tooltip";
    tip.textContent = anchor.getAttribute("data-mpn-tip");
    document.body.appendChild(tip);
    var a = anchor.getBoundingClientRect();
    var t = tip.getBoundingClientRect();
    var top = a.top - t.height - 7;
    if (top < 8) top = a.bottom + 7;
    var left = Math.min(
      Math.max(8, a.left + a.width / 2 - t.width / 2),
      window.innerWidth - t.width - 8
    );
    tip.style.position = "fixed";
    tip.style.top = top + "px";
    tip.style.left = left + "px";
  }

  function hideTip() {
    if (tip) {
      tip.remove();
      tip = null;
    }
  }

  document.addEventListener("pointerover", function (e) {
    var a = e.target.closest("[data-mpn-tip]");
    if (a) showTip(a);
  });
  document.addEventListener("pointerout", function (e) {
    if (e.target.closest("[data-mpn-tip]")) hideTip();
  });
  document.addEventListener("focusin", function (e) {
    var a = e.target.closest("[data-mpn-tip]");
    if (a) showTip(a);
  });
  document.addEventListener("focusout", hideTip);
  window.addEventListener("scroll", hideTip, true);

  function toastHost() {
    var host = document.querySelector(".mpn-toasts");
    if (!host) {
      host = document.createElement("div");
      host.className = "mpn-toasts";
      document.body.appendChild(host);
    }
    return host;
  }

  function toast(opts) {
    opts = opts || {};
    var el = document.createElement("div");
    el.className = "mpn-toast" + (opts.state ? " mpn-is-" + opts.state : "");
    el.setAttribute("role", "status");
    var icon = opts.state
      ? '<svg class="mpn-icon" style="color:var(--mpn-state)"><use href="#i-' +
        (opts.state === "ok" ? "check-circle" : opts.state === "danger" ? "x-circle" : "info") +
        '"/></svg>'
      : "";
    el.innerHTML =
      icon +
      "<div><strong>" +
      (opts.title || "") +
      "</strong>" +
      (opts.body ? '<div class="mpn-hint">' + opts.body + "</div>" : "") +
      "</div>";
    var closeBtn = document.createElement("button");
    closeBtn.className = "mpn-icon-btn mpn-icon-btn-bare mpn-spacer";
    closeBtn.setAttribute("aria-label", "Dismiss");
    closeBtn.innerHTML = '<svg class="mpn-icon mpn-icon-sm"><use href="#i-x"/></svg>';
    closeBtn.addEventListener("click", function () {
      el.remove();
    });
    el.appendChild(closeBtn);
    toastHost().appendChild(el);
    if (opts.timeout !== 0) {
      setTimeout(function () {
        el.remove();
      }, opts.timeout || 4000);
    }
    return el;
  }

  document.addEventListener("pointerdown", function (e) {
    var handle = e.target.closest("[data-mpn-split]");
    if (!handle) return;
    e.preventDefault();
    var pane = handle.closest(".mpn-split");
    var start = e.clientX;
    var base = parseFloat(getComputedStyle(pane).getPropertyValue("--mpn-split-w")) || 300;
    var sign = rtl() ? -1 : 1;
    function move(ev) {
      var next = Math.min(Math.max(160, base + (ev.clientX - start) * sign), pane.clientWidth - 200);
      pane.style.setProperty("--mpn-split-w", next + "px");
    }
    function up() {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
    }
    document.body.style.userSelect = "none";
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closePops();
      hideTip();
      if (stack.length) {
        e.preventDefault();
        close(stack[stack.length - 1]);
      }
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      var palette = document.querySelector(".mpn-palette");
      if (palette) {
        e.preventDefault();
        open(palette);
      }
      return;
    }

    if (e.key === "Tab" && stack.length) trap(e, stack[stack.length - 1]);

    var tab = e.target.closest('[data-mpn-tabs] [role="tab"]');
    if (tab && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      e.preventDefault();
      var tabs = Array.prototype.slice.call(
        tab.closest("[data-mpn-tabs]").querySelectorAll('[role="tab"]')
      );
      var forward = e.key === "ArrowRight" ? !rtl() : rtl();
      var i = tabs.indexOf(tab) + (forward ? 1 : -1);
      var next = tabs[(i + tabs.length) % tabs.length];
      selectTab(next);
      next.focus();
    }
  });

  function trap(e, el) {
    var items = Array.prototype.slice.call(el.querySelectorAll(FOCUSABLE));
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  try {
    var savedBar = localStorage.getItem("mpn-sidebar");
    if (savedBar) root.setAttribute("data-sidebar", savedBar);
    var savedDir = localStorage.getItem("mpn-dir");
    if (savedDir) root.setAttribute("dir", savedDir);
  } catch (err) {}

  window.mpnUI = {
    open: open,
    close: close,
    toast: toast,
    place: place,
    selectTab: selectTab,
    selectStep: selectStep
  };
})();

(function () {
  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function iso(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  function monthGrid(view, selected, today) {
    var first = new Date(view.getFullYear(), view.getMonth(), 1);
    var lead = (first.getDay() + 6) % 7;
    var start = new Date(first);
    start.setDate(1 - lead);
    var html = '<div class="mpn-dp-grid">';
    DOW.forEach(function (d) {
      html += '<span class="mpn-dp-dow">' + d + "</span>";
    });
    for (var i = 0; i < 42; i++) {
      var day = new Date(start);
      day.setDate(start.getDate() + i);
      var cls = "mpn-dp-day";
      if (day.getMonth() !== view.getMonth()) cls += " is-outside";
      if (selected && iso(day) === iso(selected)) cls += " is-selected";
      if (iso(day) === iso(today)) cls += " is-today";
      html += '<button type="button" class="' + cls + '" data-date="' + iso(day) + '">' + day.getDate() + "</button>";
    }
    return html + "</div>";
  }

  function buildPicker(input) {
    var pop = document.createElement("div");
    pop.className = "mpn-popover mpn-dp";
    pop.hidden = true;
    document.body.appendChild(pop);

    var today = new Date();
    var selected = parseISO(input.value);
    var view = new Date(selected || today);
    view.setDate(1);

    function render() {
      pop.innerHTML =
        '<div class="mpn-dp-head">' +
        '<button type="button" class="mpn-icon-btn mpn-icon-btn-bare" data-step="-1" aria-label="Previous month"><svg class="mpn-icon mpn-icon-sm"><use href="#i-chevron-left"/></svg></button>' +
        '<span class="mpn-dp-month">' + MONTHS[view.getMonth()] + " " + view.getFullYear() + "</span>" +
        '<button type="button" class="mpn-icon-btn mpn-icon-btn-bare" data-step="1" aria-label="Next month"><svg class="mpn-icon mpn-icon-sm"><use href="#i-chevron-right"/></svg></button>' +
        "</div>" +
        monthGrid(view, selected, today) +
        '<div class="mpn-dp-foot">' +
        '<button type="button" class="mpn-btn mpn-btn-sm" data-today>Today</button>' +
        '<button type="button" class="mpn-btn mpn-btn-sm" data-clear>Clear</button>' +
        "</div>";
    }

    pop.addEventListener("click", function (e) {
      var step = e.target.closest("[data-step]");
      if (step) {
        view.setMonth(view.getMonth() + Number(step.getAttribute("data-step")));
        render();
        return;
      }
      if (e.target.closest("[data-today]")) {
        selected = new Date(today);
        view = new Date(today);
        view.setDate(1);
        commit();
        return;
      }
      if (e.target.closest("[data-clear]")) {
        selected = null;
        input.value = "";
        input.dispatchEvent(new Event("change", { bubbles: true }));
        pop.hidden = true;
        return;
      }
      var day = e.target.closest("[data-date]");
      if (day) {
        selected = parseISO(day.getAttribute("data-date"));
        commit();
      }
    });

    function commit() {
      input.value = selected ? iso(selected) : "";
      input.dispatchEvent(new Event("change", { bubbles: true }));
      render();
      pop.hidden = true;
    }

    function show() {
      selected = parseISO(input.value) || selected;
      if (selected) {
        view = new Date(selected);
        view.setDate(1);
      }
      render();
      window.mpnUI.place(pop, input);
    }

    input.addEventListener("focus", show);
    input.addEventListener("click", function (e) {
      e.stopPropagation();
      if (pop.hidden) show();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") pop.hidden = true;
    });
    document.addEventListener("click", function (e) {
      if (!pop.contains(e.target) && e.target !== input) pop.hidden = true;
    });
  }

  function buildCombo(el) {
    var field = el.querySelector(".mpn-combo-field");
    var list = el.querySelector(".mpn-combo-list");
    var hidden = el.querySelector("input[type=hidden]");
    var options = Array.prototype.slice.call(list.querySelectorAll(".mpn-combo-option"));
    var active = -1;

    function openList() {
      list.hidden = false;
      el.setAttribute("aria-expanded", "true");
    }

    function closeList() {
      list.hidden = true;
      el.setAttribute("aria-expanded", "false");
      active = -1;
    }

    function mark() {
      options.forEach(function (o, i) {
        o.setAttribute("aria-selected", String(i === active));
        if (i === active) o.scrollIntoView({ block: "nearest" });
      });
    }

    function choose(opt) {
      options.forEach(function (o) {
        o.removeAttribute("data-chosen");
      });
      opt.setAttribute("data-chosen", "");
      field.value = opt.textContent.trim();
      if (hidden) hidden.value = opt.getAttribute("data-value") || field.value;
      el.dispatchEvent(new CustomEvent("mpn:choose", { detail: { value: hidden && hidden.value }, bubbles: true }));
      closeList();
    }

    field.addEventListener("focus", openList);
    field.addEventListener("click", function (e) {
      e.stopPropagation();
      openList();
    });

    field.addEventListener("input", function () {
      var q = field.value.trim().toLowerCase();
      var visible = 0;
      options.forEach(function (o) {
        var hit = !q || o.textContent.toLowerCase().indexOf(q) !== -1;
        o.hidden = !hit;
        if (hit) visible++;
      });
      var empty = list.querySelector(".mpn-combo-empty");
      if (empty) empty.hidden = visible > 0;
      openList();
    });

    field.addEventListener("keydown", function (e) {
      var shown = options.filter(function (o) {
        return !o.hidden;
      });
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        openList();
        var cur = shown.indexOf(options[active]);
        cur += e.key === "ArrowDown" ? 1 : -1;
        if (cur < 0) cur = shown.length - 1;
        if (cur >= shown.length) cur = 0;
        active = options.indexOf(shown[cur]);
        mark();
      } else if (e.key === "Enter") {
        if (!list.hidden && options[active]) {
          e.preventDefault();
          choose(options[active]);
        }
      } else if (e.key === "Escape") {
        closeList();
      }
    });

    list.addEventListener("click", function (e) {
      var opt = e.target.closest(".mpn-combo-option");
      if (opt) choose(opt);
    });

    document.addEventListener("click", function (e) {
      if (!el.contains(e.target)) closeList();
    });
  }

  var SWATCHES = [
    "#6366f1", "#818cf8", "#22d3ee", "#a78bfa", "#4ade80", "#fbbf24",
    "#fb7185", "#38bdf8", "#c084fc", "#94a3b8", "#eaeafb", "#070a16"
  ];

  function buildColor(input) {
    var wrap = document.createElement("span");
    wrap.className = "mpn-color";
    input.parentNode.insertBefore(wrap, input);
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "mpn-color-dot";
    dot.setAttribute("aria-label", "Choose colour");
    wrap.appendChild(dot);
    wrap.appendChild(input);

    var pop = document.createElement("div");
    pop.className = "mpn-popover mpn-color-pop";
    pop.hidden = true;
    pop.innerHTML =
      '<div class="mpn-color-grid">' +
      SWATCHES.map(function (c) {
        return '<button type="button" class="mpn-color-swatch" data-c="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>';
      }).join("") +
      "</div>";
    document.body.appendChild(pop);

    function sync() {
      dot.style.background = input.value || "transparent";
    }

    dot.addEventListener("click", function (e) {
      e.stopPropagation();
      if (pop.hidden) window.mpnUI.place(pop, wrap);
      else pop.hidden = true;
    });

    pop.addEventListener("click", function (e) {
      var sw = e.target.closest("[data-c]");
      if (!sw) return;
      input.value = sw.getAttribute("data-c");
      input.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
      pop.hidden = true;
    });

    input.addEventListener("input", sync);
    document.addEventListener("click", function (e) {
      if (!pop.contains(e.target) && !wrap.contains(e.target)) pop.hidden = true;
    });
    sync();
  }

  function init(scope) {
    (scope || document).querySelectorAll("[data-mpn-datepicker]").forEach(function (el) {
      if (!el.__mpn) {
        el.__mpn = true;
        buildPicker(el);
      }
    });
    (scope || document).querySelectorAll("[data-mpn-combo]").forEach(function (el) {
      if (!el.__mpn) {
        el.__mpn = true;
        buildCombo(el);
      }
    });
    (scope || document).querySelectorAll("[data-mpn-colorpicker]").forEach(function (el) {
      if (!el.__mpn) {
        el.__mpn = true;
        buildColor(el);
      }
    });
  }

  init();
  window.mpnWidgets = { init: init };
})();

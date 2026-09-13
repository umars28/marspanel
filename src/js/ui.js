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

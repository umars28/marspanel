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

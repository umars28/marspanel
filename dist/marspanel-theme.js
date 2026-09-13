(function () {
  var KEY = "mpn-theme";
  var root = document.documentElement;

  function stored() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function resolve() {
    var saved = stored();
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
  }

  apply(resolve());

  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
    if (!stored()) apply(e.matches ? "light" : "dark");
  });

  window.mpnTheme = {
    get: function () {
      return root.getAttribute("data-theme");
    },
    set: function (theme) {
      apply(theme);
      try {
        localStorage.setItem(KEY, theme);
      } catch (e) {}
    },
    toggle: function () {
      this.set(this.get() === "dark" ? "light" : "dark");
    },
    clear: function () {
      try {
        localStorage.removeItem(KEY);
      } catch (e) {}
      apply(resolve());
    }
  };
})();

(() => {
  const blocked = {
    'geometrylite.io': 'dashmetry.github.io',
    'geometrydashlite.io': 'dashmetry.github.io',
    '1games.io': 'dashmetry.github.io',
    'dashmetry.io': 'dashmetry.github.io',
    'geometrydashlite.online': 'dashmetry.github.io',
    'geometrydashsubzero.io': 'dashmetry.github.io',
    'geometrydashmektdown.io': "dashmetry.github.io',
    'geometrydashbloodbath.io': 'dashmetry.github.io',
    'geometrydashs.io': 'dashmetry.github.io',
    'poki.com': 'dashmetry.github.io',
    'hacker-114.github.io': 'dashmetry.github.io',
    'evergreenps.github.io': 'dashmetry.github.io',
    'orson-sanders.github.io': 'dashmetry.github.io',
    '2playergames.gitlab.io': 'dc.gg/martin',
    'ubg6.gitlab.io': 'dc.gg/martin',
    'ubg98.github.io': 'dc.gg/martin',
    'dressupgames.gitlab.io': 'dc.gg/martin',
    'dc.gg': 'dc.gg/martin',
    'discord.com': 'dc.gg/martin',
    'discord.gg': 'dc.gg/martin'
  };

  const check = (url) => {
    try {
      const d = new URL(url, location.href).hostname;
      return blocked[d] || null;
    } catch {
      return null;
    }
  };

  /* =====================================================
     BLOCK IFRAME-BASED POPUP BYPASS (safeWindowOpen)
     ===================================================== */

  // Patch iframe creation to neuter any attempt to use iframe.contentWindow.open
  const origCreateElement = document.createElement;
  document.createElement = function(tag) {
    const el = origCreateElement.call(document, tag);
    
    // Only handle iframes
    if (tag.toLowerCase() === "iframe") {
      Object.defineProperty(el, "contentWindow", {
        get() {
          // Return a fake contentWindow where open() is disabled
          return {
            open: function() {
              console.warn("Blocked iframe-based popup.");
              return null;
            }
          };
        }
      });
    }
    return el;
  };

  // Global protection: block ANY attempt to use a foreign window.open (iframe/external)
  const origOpen = window.open;
  window.open = function(url, ...args) {
    const redirect = check(url);

    // If called from inside an iframe context, block popup
    if (window.frameElement) {
      console.warn("Blocked popup from iframe context.");
      return null;
    }

    // block suspicious attempts to use frameWindow.open
    if (this && this !== window) {
      console.warn("Blocked cross-context popup attempt.");
      return null;
    }

    return origOpen.call(window, redirect || url, ...args);
  };


  /* =====================================================
     (Your original protections remain the same)
     ===================================================== */

  /* ---------- Application.OpenURL (if exists) ---------- */
  if (window.Application?.OpenURL) {
    const origAppOpen = window.Application.OpenURL;
    window.Application.OpenURL = function (url) {
      const redirect = check(url);
      return origAppOpen.call(window.Application, redirect || url);
    };
  }

  /* ---------- location.assign / replace ---------- */
  const origAssign = window.location.assign;
  const origReplace = window.location.replace;

  window.location.assign = function (url) {
    const redirect = check(url);
    return origAssign.call(window.location, redirect || url);
  };

  window.location.replace = function (url) {
    const redirect = check(url);
    return origReplace.call(window.location, redirect || url);
  };

  /* ---------- location.href setter ---------- */
  const locProto = Object.getPrototypeOf(window.location);
  Object.defineProperty(locProto, "href", {
    set(url) {
      const redirect = check(url);
      window.location.assign(redirect || url);
    }
  });

  /* ---------- Anchor (<a>) click interception ---------- */
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const redirect = check(link.href);
    if (redirect) {
      e.preventDefault();
      window.location.assign(redirect);
    }
  });

  /* ---------- Meta refresh blocking ---------- */
  const metas = document.querySelectorAll('meta[http-equiv="refresh"]');
  metas.forEach(meta => {
    const content = meta.getAttribute("content");
    const match = content?.match(/url=(.+)/i);
    if (!match) return;
    const redirect = check(match[1]);
    if (redirect) meta.setAttribute("content", `0; url=${redirect}`);
  });

  /* ---------- window.navigate (if exists) ---------- */
  if (window.navigate) {
    const origNav = window.navigate;
    window.navigate = function (url) {
      const redirect = check(url);
      return origNav.call(window, redirect || url);
    };
  }

})();

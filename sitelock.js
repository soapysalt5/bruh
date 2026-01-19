/* Made by Martin_MMC */
(() => {
    "use strict";

    /* BLOCKED DOMAINS → REDIRECTS */
    const BLOCKED_DOMAINS = {
        "geometrylite.io": "//dashmetry.github.io",
        "geometrylitegame.io": "//dashmetry.github.io",
        "geometrydash.io": "//dashmetry.github.io",
        "geometrydashlite.io": "//dashmetry.github.io",
        "geometrydashlite.online": "//dashmetry.github.io",
        "geometrydashsubzero.io": "//dashmetry.github.io",
        "geometrydashmeltdown.io": "//dashmetry.github.io",
        "geometrydashbloodbath.io": "//dashmetry.github.io",
        "geometrydashs.io": "//dashmetry.github.io",
        "geometrygames.io": "//dashmetry.github.io",
        "dashmetry.io": "//dashmetry.github.io",

        "1games.io": "//dashmetry.github.io",
        "azgames.io": "//dashmetry.github.io",
        "poki.com": "//dashmetry.github.io",
        "hacker-114.github.io": "//dashmetry.github.io",
        "evergreenps.github.io": "//dashmetry.github.io",
        "orson-sander.github.io": "//dashmetry.github.io",
        "tunnel-rush.io": "//marty-games.github.io",
        "st.8games.net": "//marty-games.github.io",

        "2playergames.gitlab.io": "//discord.gg/F8kc4FKjnw",
        "ubg6.gitlab.io": "//discord.gg/F8kc4FKjnw",
        "ubg98.github.io": "//discord.gg/F8kc4FKjnw",
        "dressupgames.gitlab.io": "//discord.gg/F8kc4FKjnw",
        "dc.gg": "//discord.gg/F8kc4FKjnw",
        "discord.com": "//discord.gg/F8kc4FKjnw",
        "discord.gg": "//discord.com/invite/F8kc4FKjnw"
    };

    /* URL CHECK HELPER */
    function checkRedirect(url) {
        try {
            const hostname = new URL(url, location.href).hostname;
            return BLOCKED_DOMAINS[hostname] || null;
        } catch {
            return null;
        }
    }

    /* IFRAME POPUP REDIRECT (NOT BLOCK) */
    const originalCreateElement = document.createElement;

    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);

        if (tagName.toLowerCase() === "iframe") {
            Object.defineProperty(element, "contentWindow", {
                get() {
                    return {
                        open(url, ...args) {
                            const redirect = checkRedirect(url);
                            return window.open(redirect || url, ...args);
                        }
                    };
                }
            });
        }

        return element;
    };

    /* window.open REDIRECT */
    const originalWindowOpen = window.open;

    window.open = function(url, ...args) {
        const redirect = checkRedirect(url);

        // still prevent weird object-bound calls
        if (this && this !== window) {
            console.warn("Blocked invalid window.open context");
            return originalWindowOpen.call(window, redirect || "about:blank", ...args);
        }

        return originalWindowOpen.call(window, redirect || url, ...args);
    };

    /* Unity Application.OpenURL REDIRECT */
    if (window.Application?.OpenURL) {
        const originalAppOpen = window.Application.OpenURL;

        window.Application.OpenURL = function(url) {
            const redirect = checkRedirect(url);
            return originalAppOpen.call(window.Application, redirect || url);
        };
    }

    /* location.href SETTER */
    const locationProto = Object.getPrototypeOf(window.location);

    Object.defineProperty(locationProto, "href", {
        set(url) {
            const redirect = checkRedirect(url);
            window.location.assign(redirect || url);
        }
    });

    /* <a> CLICK INTERCEPTION */
    document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href]");
        if (!link) return;

        const redirect = checkRedirect(link.href);
        if (!redirect) return;

        event.preventDefault();
        window.location.assign(redirect);
    });

    /* META REFRESH REDIRECT */
    document
        .querySelectorAll('meta[http-equiv="refresh"]')
        .forEach((meta) => {
            const content = meta.getAttribute("content");
            const match = content?.match(/url=(.+)/i);
            if (!match) return;

            const redirect = checkRedirect(match[1]);
            if (redirect) {
                meta.setAttribute("content", `0; url=${redirect}`);
            }
        });

    /* window.navigate REDIRECT */
    if (window.navigate) {
        const originalNavigate = window.navigate;

        window.navigate = function(url) {
            const redirect = checkRedirect(url);
            return originalNavigate.call(window, redirect || url);
        };
    }
})();

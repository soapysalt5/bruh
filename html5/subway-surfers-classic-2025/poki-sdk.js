(function (modules) {

    // -------------------------------
    // Simple module system (Webpack)
    // -------------------------------

    const moduleCache = {};

    function requireModule(id) {
        if (moduleCache[id]) {
            return moduleCache[id].exports;
        }

        const module = {
            id,
            loaded: false,
            exports: {}
        };

        moduleCache[id] = module;
        modules[id].call(module.exports, module, module.exports, requireModule);
        module.loaded = true;

        return module.exports;
    }

    requireModule.m = modules;
    requireModule.c = moduleCache;

    requireModule.defineExport = function (exports, name, getter) {
        if (!Object.prototype.hasOwnProperty.call(exports, name)) {
            Object.defineProperty(exports, name, {
                enumerable: true,
                get: getter
            });
        }
    };

    requireModule.markESModule = function (exports) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exports, "__esModule", { value: true });
    };

    // Start entry module
    requireModule(68);

})({

    // ===============================
    // Module 68 – PokiSDK Loader
    // ===============================
    68: function (module, exports, require) {

        // -------------------------------
        // PokiSDK Queue Wrapper
        // -------------------------------
        function PokiQueue() {
            this.queue = [];

            this.init = (options = {}) =>
                new Promise((resolve, reject) => {
                    this.enqueue("init", options, resolve, reject);
                });

            this.rewardedBreak = () =>
                Promise.resolve(false);

            this.noArguments = (fnName) => () => {
                this.enqueue(fnName);
            };

            this.oneArgument = (fnName) => (arg) => {
                this.enqueue(fnName, arg);
            };

            this.autoResolve = () => Promise.resolve();
            this.autoResolveObj = () => Promise.resolve();

            this.notLoaded = () => {
                console.debug("PokiSDK is not loaded yet.");
            };
        }

        PokiQueue.prototype.enqueue = function (fn, options, resolve, reject) {
            this.queue.push({
                fn,
                options,
                resolve,
                reject
            });
        };

        PokiQueue.prototype.dequeue = function () {
            while (this.queue.length > 0) {
                const item = this.queue.shift();
                const sdkFn = window.PokiSDK[item.fn];

                if (typeof sdkFn !== "function") {
                    console.error("Cannot execute " + item.fn);
                    continue;
                }

                if (item.resolve || item.reject) {
                    sdkFn(item.options)
                        .then((...args) => item.resolve?.(...args))
                        .catch((...args) => item.reject?.(...args));
                } else {
                    sdkFn(item.options);
                }
            }
        };

        const queue = new PokiQueue();

        // -------------------------------
        // Temporary PokiSDK Stub
        // -------------------------------
        window.PokiSDK = {
            init: queue.init,
            initWithVideoHB: queue.init,
            customEvent: queue.notLoaded,
            commercialBreak: queue.autoResolve,
            rewardedBreak: queue.rewardedBreak,
            displayAd: queue.notLoaded,
            destroyAd: queue.notLoaded,
            getLeaderboard: queue.autoResolveObj
        };

        // No-argument SDK calls
        [
            "disableProgrammatic",
            "gameLoadingStart",
            "gameLoadingFinished",
            "gameInteractive",
            "roundStart",
            "roundEnd",
            "muteAd"
        ].forEach(name => {
            window.PokiSDK[name] = queue.noArguments(name);
        });

        // One-argument SDK calls
        [
            "setDebug",
            "gameplayStart",
            "gameplayStop",
            "gameLoadingProgress",
            "happyTime",
            "setPlayerAge",
            "togglePlayerAdvertisingConsent",
            "toggleNonPersonalized",
            "setConsentString",
            "logError",
            "sendHighscore",
            "setDebugTouchOverlayController"
        ].forEach(name => {
            window.PokiSDK[name] = queue.oneArgument(name);
        });

        // -------------------------------
        // Load real Poki SDK
        // -------------------------------
        const script = document.createElement("script");
        script.src = "./poki-sdk-core.js";
        script.type = "text/javascript";
        script.onload = () => queue.dequeue();

        document.head.appendChild(script);
    }
});

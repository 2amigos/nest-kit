"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composePluginsSync = exports.composePlugins = exports.getBaseWebpackPartial = void 0;
const tslib_1 = require("tslib");
const with_nx_1 = require("./with-nx");
const with_web_1 = require("./with-web");
/** @deprecated use withNx and withWeb plugins directly */
function getBaseWebpackPartial(options, context) {
    const config = {};
    const configure = composePluginsSync((0, with_nx_1.withNx)(), (0, with_web_1.withWeb)());
    return configure(config, { options, context });
}
exports.getBaseWebpackPartial = getBaseWebpackPartial;
function composePlugins(...plugins) {
    return function combined(config, ctx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const plugin of plugins) {
                const fn = yield plugin;
                config = yield fn(config, ctx);
            }
            return config;
        });
    };
}
exports.composePlugins = composePlugins;
function composePluginsSync(...plugins) {
    return function combined(config, ctx) {
        for (const plugin of plugins) {
            config = plugin(config, ctx);
        }
        return config;
    };
}
exports.composePluginsSync = composePluginsSync;

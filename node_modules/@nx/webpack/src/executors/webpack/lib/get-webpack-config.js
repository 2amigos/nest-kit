"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebpackConfig = void 0;
const with_nx_1 = require("../../../utils/with-nx");
const with_web_1 = require("../../../utils/with-web");
const config_1 = require("../../../utils/config");
/** @deprecated Use withNx, withWeb, or withReact */
// TODO(jack): Remove in Nx 16
function getWebpackConfig(context, options) {
    const config = {};
    const configure = options.target === 'web'
        ? (0, config_1.composePluginsSync)((0, with_nx_1.withNx)(), (0, with_web_1.withWeb)())
        : (0, with_nx_1.withNx)();
    return configure(config, { options, context });
}
exports.getWebpackConfig = getWebpackConfig;

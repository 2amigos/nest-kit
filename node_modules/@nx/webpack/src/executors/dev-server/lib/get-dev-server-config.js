"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevServerConfig = void 0;
const devkit_1 = require("@nx/devkit");
const path = require("path");
const fs_1 = require("fs");
const get_webpack_config_1 = require("../../webpack/lib/get-webpack-config");
const serve_path_1 = require("./serve-path");
function getDevServerConfig(context, buildOptions, serveOptions) {
    const workspaceRoot = context.root;
    const webpackConfig = buildOptions.isolatedConfig
        ? {}
        : (0, get_webpack_config_1.getWebpackConfig)(context, buildOptions);
    webpackConfig.devServer = getDevServerPartial(workspaceRoot, serveOptions, buildOptions);
    return webpackConfig;
}
exports.getDevServerConfig = getDevServerConfig;
function getDevServerPartial(root, options, buildOptions) {
    const servePath = (0, serve_path_1.buildServePath)(buildOptions);
    let scriptsOptimization;
    let stylesOptimization;
    if (typeof buildOptions.optimization === 'boolean') {
        scriptsOptimization = stylesOptimization = buildOptions.optimization;
    }
    else if (buildOptions.optimization) {
        scriptsOptimization = buildOptions.optimization.scripts;
        stylesOptimization = buildOptions.optimization.styles;
    }
    else {
        scriptsOptimization = stylesOptimization = false;
    }
    const config = {
        host: options.host,
        port: options.port,
        headers: { 'Access-Control-Allow-Origin': '*' },
        historyApiFallback: {
            index: `${servePath}${path.basename(buildOptions.index)}`,
            disableDotRule: true,
            htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
        },
        onListening(server) {
            var _a;
            const isHttps = server.options.https || ((_a = server.options.server) === null || _a === void 0 ? void 0 : _a.type) === 'https';
            devkit_1.logger.info(`NX Web Development Server is listening at ${isHttps ? 'https' : 'http'}://${server.options.host}:${server.options.port}${(0, serve_path_1.buildServePath)(buildOptions)}`);
        },
        open: options.open,
        static: false,
        compress: scriptsOptimization || stylesOptimization,
        devMiddleware: {
            publicPath: servePath,
            stats: false,
        },
        client: {
            webSocketURL: options.publicHost,
            overlay: {
                errors: !(scriptsOptimization || stylesOptimization),
                warnings: false,
            },
        },
        liveReload: options.hmr ? false : options.liveReload,
        hot: options.hmr,
    };
    if (options.ssl) {
        config.server = {
            type: 'https',
        };
        if (options.sslKey && options.sslCert) {
            config.server.options = getSslConfig(root, options);
        }
    }
    if (options.proxyConfig) {
        config.proxy = getProxyConfig(root, options);
    }
    if (options.allowedHosts) {
        config.allowedHosts = options.allowedHosts.split(',');
    }
    return config;
}
function getSslConfig(root, options) {
    return {
        key: (0, fs_1.readFileSync)(path.resolve(root, options.sslKey), 'utf-8'),
        cert: (0, fs_1.readFileSync)(path.resolve(root, options.sslCert), 'utf-8'),
    };
}
function getProxyConfig(root, options) {
    const proxyPath = path.resolve(root, options.proxyConfig);
    return require(proxyPath);
}

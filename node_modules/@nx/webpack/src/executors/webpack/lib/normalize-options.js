"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAssets = exports.normalizePluginPath = exports.normalizeOptions = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const devkit_1 = require("@nx/devkit");
function normalizeOptions(options, root, projectRoot, sourceRoot) {
    var _a, _b;
    return Object.assign(Object.assign({}, options), { root,
        projectRoot,
        sourceRoot, target: (_a = options.target) !== null && _a !== void 0 ? _a : 'web', main: (0, path_1.resolve)(root, options.main), outputPath: (0, path_1.resolve)(root, options.outputPath), outputFileName: (_b = options.outputFileName) !== null && _b !== void 0 ? _b : 'main.js', tsConfig: (0, path_1.resolve)(root, options.tsConfig), fileReplacements: normalizeFileReplacements(root, options.fileReplacements), assets: normalizeAssets(options.assets, root, sourceRoot), webpackConfig: normalizePluginPath(options.webpackConfig, root), optimization: typeof options.optimization !== 'object'
            ? {
                scripts: options.optimization,
                styles: options.optimization,
            }
            : options.optimization, polyfills: options.polyfills ? (0, path_1.resolve)(root, options.polyfills) : undefined });
}
exports.normalizeOptions = normalizeOptions;
function normalizeFileReplacements(root, fileReplacements) {
    return fileReplacements.map((fileReplacement) => ({
        replace: (0, path_1.resolve)(root, fileReplacement.replace),
        with: (0, path_1.resolve)(root, fileReplacement.with),
    }));
}
function normalizePluginPath(pluginPath, root) {
    if (!pluginPath) {
        return '';
    }
    try {
        return require.resolve(pluginPath);
    }
    catch (_a) {
        return (0, path_1.resolve)(root, pluginPath);
    }
}
exports.normalizePluginPath = normalizePluginPath;
function normalizeAssets(assets, root, sourceRoot) {
    return assets.map((asset) => {
        if (typeof asset === 'string') {
            const assetPath = (0, devkit_1.normalizePath)(asset);
            const resolvedAssetPath = (0, path_1.resolve)(root, assetPath);
            const resolvedSourceRoot = (0, path_1.resolve)(root, sourceRoot);
            if (!resolvedAssetPath.startsWith(resolvedSourceRoot)) {
                throw new Error(`The ${resolvedAssetPath} asset path must start with the project source root: ${sourceRoot}`);
            }
            const isDirectory = (0, fs_1.statSync)(resolvedAssetPath).isDirectory();
            const input = isDirectory
                ? resolvedAssetPath
                : (0, path_1.dirname)(resolvedAssetPath);
            const output = (0, path_1.relative)(resolvedSourceRoot, (0, path_1.resolve)(root, input));
            const glob = isDirectory ? '**/*' : (0, path_1.basename)(resolvedAssetPath);
            return {
                input,
                output,
                glob,
            };
        }
        else {
            if (asset.output.startsWith('..')) {
                throw new Error('An asset cannot be written to a location outside of the output path.');
            }
            const assetPath = (0, devkit_1.normalizePath)(asset.input);
            const resolvedAssetPath = (0, path_1.resolve)(root, assetPath);
            return Object.assign(Object.assign({}, asset), { input: resolvedAssetPath, 
                // Now we remove starting slash to make Webpack place it from the output root.
                output: asset.output.replace(/^\//, '') });
        }
    });
}
exports.normalizeAssets = normalizeAssets;

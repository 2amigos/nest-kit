"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratePackageJsonPlugin = void 0;
const webpack_1 = require("webpack");
const js_1 = require("@nx/js");
const devkit_1 = require("@nx/devkit");
const js_2 = require("@nx/js");
const pluginName = 'GeneratePackageJsonPlugin';
class GeneratePackageJsonPlugin {
    constructor(options, context) {
        this.options = options;
        this.context = context;
        this.projectGraph = context.projectGraph;
    }
    apply(compiler) {
        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            compilation.hooks.processAssets.tap({
                name: pluginName,
                stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
            }, () => {
                var _a;
                const helperDependencies = (0, js_2.getHelperDependenciesFromProjectGraph)(this.context.root, this.context.projectName, this.projectGraph);
                const importHelpers = !!(0, js_2.readTsConfig)(this.options.tsConfig).options
                    .importHelpers;
                const shouldAddHelperDependency = importHelpers &&
                    helperDependencies.every((dep) => dep.target !== js_2.HelperDependency.tsc);
                if (shouldAddHelperDependency) {
                    helperDependencies.push({
                        type: 'static',
                        source: this.context.projectName,
                        target: js_2.HelperDependency.tsc,
                    });
                }
                const packageJson = (0, js_1.createPackageJson)(this.context.projectName, this.projectGraph, {
                    target: this.context.targetName,
                    root: this.context.root,
                    isProduction: true,
                    helperDependencies: helperDependencies.map((dep) => dep.target),
                });
                packageJson.main = (_a = packageJson.main) !== null && _a !== void 0 ? _a : this.options.outputFileName;
                compilation.emitAsset('package.json', new webpack_1.sources.RawSource((0, devkit_1.serializeJson)(packageJson)));
                compilation.emitAsset((0, js_2.getLockFileName)(), new webpack_1.sources.RawSource((0, js_1.createLockFile)(packageJson)));
            });
        });
    }
}
exports.GeneratePackageJsonPlugin = GeneratePackageJsonPlugin;

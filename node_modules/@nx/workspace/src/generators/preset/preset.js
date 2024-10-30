"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presetGenerator = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const presets_1 = require("../utils/presets");
function presetGenerator(tree, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        options = normalizeOptions(options);
        const presetTask = yield createPreset(tree, options);
        return () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            (0, devkit_1.installPackagesTask)(tree);
            if (presetTask)
                yield presetTask();
        });
    });
}
exports.presetGenerator = presetGenerator;
exports.default = presetGenerator;
function createPreset(tree, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (options.preset === presets_1.Preset.Empty || options.preset === presets_1.Preset.Apps) {
            return;
        }
        else if (options.preset === presets_1.Preset.AngularMonorepo) {
            const { applicationGenerator: angularApplicationGenerator, } = require('@nx' + '/angular/generators');
            return angularApplicationGenerator(tree, {
                name: options.name,
                style: options.style,
                linter: options.linter,
                standalone: options.standaloneApi,
                routing: options.routing,
                e2eTestRunner: (_a = options.e2eTestRunner) !== null && _a !== void 0 ? _a : 'cypress',
            });
        }
        else if (options.preset === presets_1.Preset.AngularStandalone) {
            const { applicationGenerator: angularApplicationGenerator, } = require('@nx' + '/angular/generators');
            return angularApplicationGenerator(tree, {
                name: options.name,
                style: options.style,
                linter: options.linter,
                routing: options.routing,
                rootProject: true,
                standalone: options.standaloneApi,
                e2eTestRunner: (_b = options.e2eTestRunner) !== null && _b !== void 0 ? _b : 'cypress',
            });
        }
        else if (options.preset === presets_1.Preset.ReactMonorepo) {
            const { applicationGenerator: reactApplicationGenerator } = require('@nx' +
                '/react');
            return reactApplicationGenerator(tree, {
                name: options.name,
                style: options.style,
                linter: options.linter,
                bundler: (_c = options.bundler) !== null && _c !== void 0 ? _c : 'webpack',
                e2eTestRunner: (_d = options.e2eTestRunner) !== null && _d !== void 0 ? _d : 'cypress',
            });
        }
        else if (options.preset === presets_1.Preset.ReactStandalone) {
            const { applicationGenerator: reactApplicationGenerator } = require('@nx' +
                '/react');
            return reactApplicationGenerator(tree, {
                name: options.name,
                style: options.style,
                linter: options.linter,
                rootProject: true,
                bundler: (_e = options.bundler) !== null && _e !== void 0 ? _e : 'vite',
                e2eTestRunner: (_f = options.e2eTestRunner) !== null && _f !== void 0 ? _f : 'cypress',
                unitTestRunner: options.bundler === 'vite' ? 'vitest' : 'jest',
            });
        }
        else if (options.preset === presets_1.Preset.NextJs) {
            const { applicationGenerator: nextApplicationGenerator } = require('@nx' +
                '/next');
            return nextApplicationGenerator(tree, {
                name: options.name,
                style: options.style,
                linter: options.linter,
                appDir: options.nextAppDir,
                e2eTestRunner: (_g = options.e2eTestRunner) !== null && _g !== void 0 ? _g : 'cypress',
            });
        }
        else if (options.preset === presets_1.Preset.NextJsStandalone) {
            const { applicationGenerator: nextApplicationGenerator } = require('@nx' +
                '/next');
            return nextApplicationGenerator(tree, {
                name: options.name,
                style: options.style,
                linter: options.linter,
                appDir: options.nextAppDir,
                e2eTestRunner: (_h = options.e2eTestRunner) !== null && _h !== void 0 ? _h : 'cypress',
                rootProject: true,
            });
        }
        else if (options.preset === presets_1.Preset.WebComponents) {
            const { applicationGenerator: webApplicationGenerator } = require('@nx' +
                '/web');
            return webApplicationGenerator(tree, {
                name: options.name,
                style: options.style,
                linter: options.linter,
                bundler: 'vite',
                e2eTestRunner: (_j = options.e2eTestRunner) !== null && _j !== void 0 ? _j : 'cypress',
            });
        }
        else if (options.preset === presets_1.Preset.Nest) {
            const { applicationGenerator: nestApplicationGenerator } = require('@nx' +
                '/nest');
            return nestApplicationGenerator(tree, {
                name: options.name,
                linter: options.linter,
                e2eTestRunner: (_k = options.e2eTestRunner) !== null && _k !== void 0 ? _k : 'jest',
            });
        }
        else if (options.preset === presets_1.Preset.Express) {
            const { applicationGenerator: expressApplicationGenerator, } = require('@nx' + '/express');
            return expressApplicationGenerator(tree, {
                name: options.name,
                linter: options.linter,
                e2eTestRunner: (_l = options.e2eTestRunner) !== null && _l !== void 0 ? _l : 'jest',
            });
        }
        else if (options.preset === presets_1.Preset.ReactNative) {
            const { reactNativeApplicationGenerator } = require('@nx' +
                '/react-native');
            return reactNativeApplicationGenerator(tree, {
                name: options.name,
                linter: options.linter,
                e2eTestRunner: (_m = options.e2eTestRunner) !== null && _m !== void 0 ? _m : 'detox',
            });
        }
        else if (options.preset === presets_1.Preset.Expo) {
            const { expoApplicationGenerator } = require('@nx' + '/expo');
            return expoApplicationGenerator(tree, {
                name: options.name,
                linter: options.linter,
                e2eTestRunner: (_o = options.e2eTestRunner) !== null && _o !== void 0 ? _o : 'detox',
            });
        }
        else if (options.preset === presets_1.Preset.TS) {
            const c = (0, devkit_1.readNxJson)(tree);
            const { initGenerator } = require('@nx' + '/js');
            c.workspaceLayout = {
                appsDir: 'packages',
                libsDir: 'packages',
            };
            (0, devkit_1.updateNxJson)(tree, c);
            return initGenerator(tree, {});
        }
        else if (options.preset === presets_1.Preset.TsStandalone) {
            const c = (0, devkit_1.readNxJson)(tree);
            const { libraryGenerator } = require('@nx' + '/js');
            (0, devkit_1.updateNxJson)(tree, c);
            return libraryGenerator(tree, {
                name: options.name,
                bundler: 'tsc',
                unitTestRunner: 'vitest',
                testEnvironment: 'node',
                js: options.js,
                rootProject: true,
            });
        }
        else if (options.preset === presets_1.Preset.NodeStandalone) {
            const { applicationGenerator: nodeApplicationGenerator } = require('@nx' +
                '/node');
            const bundler = options.bundler === 'webpack' ? 'webpack' : 'esbuild';
            return nodeApplicationGenerator(tree, {
                bundler,
                name: options.name,
                linter: options.linter,
                standaloneConfig: options.standaloneConfig,
                framework: options.framework,
                docker: options.docker,
                rootProject: true,
                e2eTestRunner: (_p = options.e2eTestRunner) !== null && _p !== void 0 ? _p : 'jest',
            });
        }
        else if (options.preset === presets_1.Preset.NodeMonorepo) {
            const { applicationGenerator: nodeApplicationGenerator } = require('@nx' +
                '/node');
            const bundler = options.bundler === 'webpack' ? 'webpack' : 'esbuild';
            return nodeApplicationGenerator(tree, {
                bundler,
                name: options.name,
                linter: options.linter,
                framework: options.framework,
                docker: options.docker,
                rootProject: false,
                e2eTestRunner: (_q = options.e2eTestRunner) !== null && _q !== void 0 ? _q : 'jest',
            });
        }
        else {
            throw new Error(`Invalid preset ${options.preset}`);
        }
    });
}
function normalizeOptions(options) {
    options.name = (0, devkit_1.names)(options.name).fileName;
    return options;
}

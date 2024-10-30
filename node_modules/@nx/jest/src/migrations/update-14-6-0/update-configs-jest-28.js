"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDeps = exports.updateJestConfig = exports.updateConfigsJest28 = void 0;
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const typescript_1 = require("typescript");
const find_root_jest_files_1 = require("../../utils/config/find-root-jest-files");
const jestVersion = '28.1.1';
const JASMINE_TEST_RUNNER = /(testRunner:\s*['"`])(jest-jasmine2)(['"`])/g;
const JSDOM_TEST_ENV = /(testEnvironment:\s*['"`])(jsdom)(['"`])/g;
function updateConfigsJest28(tree) {
    let devDeps = checkDeps(tree);
    (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nrwl/jest:jest', (options) => {
        if (options.jestConfig && tree.exists(options.jestConfig)) {
            const updatedConfig = updateJestConfig(tree.read(options.jestConfig, 'utf-8'));
            tree.write(options.jestConfig, updatedConfig);
            const projectConfigCheck = testFileForDep(updatedConfig);
            devDeps = Object.assign(Object.assign({}, devDeps), projectConfigCheck);
        }
    });
    return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, devDeps);
}
exports.updateConfigsJest28 = updateConfigsJest28;
function updateJestConfig(config) {
    let content = tsquery_1.tsquery.replace(config, 'PropertyAssignment:has(Identifier[name="testURL"])', (node) => {
        var _a;
        const value = (_a = node === null || node === void 0 ? void 0 : node.initializer) === null || _a === void 0 ? void 0 : _a.getText();
        return `testEnvironmentOptions: {url: ${value}}`;
    });
    content = tsquery_1.tsquery.replace(content, 'PropertyAssignment > Identifier[name="extraGlobals"]', () => {
        return 'sandboxInjectedGlobals';
    });
    return tsquery_1.tsquery.replace(content, 'PropertyAssignment:has(Identifier[name="timers"])', (node) => {
        // must guard against non string properties as that means it's already been manually migrated
        if ((node === null || node === void 0 ? void 0 : node.initializer) && (0, typescript_1.isStringLiteralLike)(node.initializer)) {
            const value = node === null || node === void 0 ? void 0 : node.initializer.getText().trim();
            // use .includes to ignore the different quotes (' " `)
            if (value.includes('fake') || value.includes('modern')) {
                return `fakeTimers: { enableGlobally: true }`;
            }
            if (value.includes('real')) {
                return `fakeTimers: { enableGlobally: false }`;
            }
            if (value.includes('legacy')) {
                return `fakeTimers: { enableGlobally: true, legacyFakeTimers: true }`;
            }
        }
    });
}
exports.updateJestConfig = updateJestConfig;
function checkDeps(tree) {
    const packageJson = (0, devkit_1.readJson)(tree, 'package.json');
    let devDeps = {};
    if (packageJson.devDependencies['jest-preset-angular']) {
        devDeps['jest-environment-jsdom'] = jestVersion;
    }
    const rootJestConfig = (0, find_root_jest_files_1.findRootJestConfig)(tree);
    if (rootJestConfig) {
        const rootConfigCheck = testFileForDep(tree.read(rootJestConfig, 'utf-8'));
        devDeps = Object.assign(Object.assign({}, devDeps), rootConfigCheck);
    }
    const rootJestPreset = (0, find_root_jest_files_1.findRootJestPreset)(tree);
    if (rootJestPreset) {
        const rootPresetCheck = testFileForDep(tree.read(rootJestPreset, 'utf-8'));
        devDeps = Object.assign(Object.assign({}, devDeps), rootPresetCheck);
    }
    return devDeps;
}
exports.checkDeps = checkDeps;
function testFileForDep(config) {
    const deps = {};
    if (JASMINE_TEST_RUNNER.test(config)) {
        deps['jest-jasmine2'] = jestVersion;
    }
    if (JSDOM_TEST_ENV.test(config)) {
        deps['jest-environment-jsdom'] = jestVersion;
    }
    return deps;
}
exports.default = updateConfigsJest28;

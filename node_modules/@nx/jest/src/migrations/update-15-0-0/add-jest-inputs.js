"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
function default_1(tree) {
    var _a, _b, _c, _d;
    var _e;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nxJson = (0, devkit_1.readNxJson)(tree);
        const jestTargets = getJestTargetNames(tree);
        const hasProductionFileset = !!((_a = nxJson.namedInputs) === null || _a === void 0 ? void 0 : _a.production);
        if (jestTargets.size > 0 && hasProductionFileset) {
            const productionFileset = new Set(nxJson.namedInputs.production);
            for (const exclusion of [
                '!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)',
                '!{projectRoot}/tsconfig.spec.json',
                '!{projectRoot}/jest.config.[jt]s',
            ]) {
                productionFileset.add(exclusion);
            }
            nxJson.namedInputs.production = Array.from(productionFileset);
        }
        for (const targetName of jestTargets) {
            (_b = nxJson.targetDefaults) !== null && _b !== void 0 ? _b : (nxJson.targetDefaults = {});
            const jestTargetDefaults = ((_c = (_e = nxJson.targetDefaults)[targetName]) !== null && _c !== void 0 ? _c : (_e[targetName] = {}));
            (_d = jestTargetDefaults.inputs) !== null && _d !== void 0 ? _d : (jestTargetDefaults.inputs = [
                'default',
                hasProductionFileset ? '^production' : '^default',
                ...(tree.exists('jest.preset.js')
                    ? ['{workspaceRoot}/jest.preset.js']
                    : []),
            ]);
        }
        (0, devkit_1.updateNxJson)(tree, nxJson);
        yield (0, devkit_1.formatFiles)(tree);
    });
}
exports.default = default_1;
function getJestTargetNames(tree) {
    const jestTargetNames = new Set();
    (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nrwl/jest:jest', (_, __, target) => {
        jestTargetNames.add(target);
    });
    return jestTargetNames;
}

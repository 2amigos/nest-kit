"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTestSetupToIgnoredInputs = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
function addTestSetupToIgnoredInputs(tree) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const nxJson = (0, devkit_1.readNxJson)(tree);
        if (!nxJson) {
            return;
        }
        if (((_a = nxJson.namedInputs) === null || _a === void 0 ? void 0 : _a.production) &&
            !nxJson.namedInputs.production.includes('!{projectRoot}/src/test-setup.[jt]s')) {
            nxJson.namedInputs.production.push('!{projectRoot}/src/test-setup.[jt]s');
            (0, devkit_1.updateNxJson)(tree, nxJson);
        }
        yield (0, devkit_1.formatFiles)(tree);
    });
}
exports.addTestSetupToIgnoredInputs = addTestSetupToIgnoredInputs;
exports.default = addTestSetupToIgnoredInputs;

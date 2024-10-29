"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkForTestTarget = void 0;
const devkit_1 = require("@nx/devkit");
function checkForTestTarget(tree, options) {
    var _a;
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    if ((_a = projectConfig === null || projectConfig === void 0 ? void 0 : projectConfig.targets) === null || _a === void 0 ? void 0 : _a.test) {
        throw new Error(`${options.project}: already has a test target set.`);
    }
}
exports.checkForTestTarget = checkForTestTarget;

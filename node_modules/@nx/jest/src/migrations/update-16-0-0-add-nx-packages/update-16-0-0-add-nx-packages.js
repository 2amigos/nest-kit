"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const replace_package_1 = require("@nx/devkit/src/utils/replace-package");
function replacePackage(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield (0, replace_package_1.replaceNrwlPackageWithNxPackage)(tree, '@nrwl/jest', '@nx/jest');
        yield (0, devkit_1.formatFiles)(tree);
    });
}
exports.default = replacePackage;

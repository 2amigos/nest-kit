"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndCleanWithSemver = void 0;
const semver_1 = require("@nx/devkit/src/utils/semver");
const devkit_1 = require("@nx/devkit");
/** @deprecated Use checkAndCleanWithSemver from @nx/devkit/src/utils/semver instead.
 * TODO(v17): Remove this function from workspace. Keep it for now since there are projects that use it (e.g. https://github.com/gperdomor/nx-tools).
 */
function checkAndCleanWithSemver(pkgName, version) {
    devkit_1.logger.warn(`checkAndCleanWithSemver has been moved to @nx/devkit/src/utils/semver`);
    return (0, semver_1.checkAndCleanWithSemver)(pkgName, version);
}
exports.checkAndCleanWithSemver = checkAndCleanWithSemver;

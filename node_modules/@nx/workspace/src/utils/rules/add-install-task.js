"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addInstallTask = void 0;
let installAdded = false;
/**
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'addDependenciesToPackageJson' from @nx/devkit.
 */
function addInstallTask(options = { skipInstall: false }) {
    const { NodePackageInstallTask, } = require('@angular-devkit/schematics/tasks');
    return (_, context) => {
        if (!options.skipInstall && !installAdded) {
            context.addTask(new NodePackageInstallTask());
            installAdded = true;
        }
    };
}
exports.addInstallTask = addInstallTask;

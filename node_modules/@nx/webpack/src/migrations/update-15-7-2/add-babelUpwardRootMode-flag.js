"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nrwl/webpack:webpack', (options, projectName, targetName, _configurationName) => {
            if (options.babelUpwardRootMode !== undefined) {
                return;
            }
            const projectConfiguration = (0, devkit_1.readProjectConfiguration)(tree, projectName);
            projectConfiguration.targets[targetName].options.babelUpwardRootMode =
                true;
            (0, devkit_1.updateProjectConfiguration)(tree, projectName, projectConfiguration);
        });
        yield (0, devkit_1.formatFiles)(tree);
    });
}
exports.default = default_1;

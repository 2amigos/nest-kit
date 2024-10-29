"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const add_swc_dependencies_1 = require("@nx/js/src/utils/swc/add-swc-dependencies");
const workspace_rules_project_1 = require("../../generators/workspace-rules-project/workspace-rules-project");
function addSwcNodeIfNeeded(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            if (tree.exists(workspace_rules_project_1.WORKSPACE_PLUGIN_DIR)) {
                (0, add_swc_dependencies_1.addSwcRegisterDependencies)(tree);
                yield (0, devkit_1.formatFiles)(tree);
                return;
            }
        }
        catch (_a) { }
    });
}
exports.default = addSwcNodeIfNeeded;

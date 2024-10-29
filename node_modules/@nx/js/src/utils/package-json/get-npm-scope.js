"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNpmScope = void 0;
const devkit_1 = require("@nx/devkit");
/**
 * Read the npm scope that a workspace should use by default
 */
function getNpmScope(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    // TODO(v17): Remove reading this from nx.json
    if (nxJson === null || nxJson === void 0 ? void 0 : nxJson.npmScope) {
        return nxJson.npmScope;
    }
    const { name } = tree.exists('package.json')
        ? (0, devkit_1.readJson)(tree, 'package.json')
        : { name: null };
    if (name === null || name === void 0 ? void 0 : name.startsWith('@')) {
        return name.split('/')[0].substring(1);
    }
}
exports.getNpmScope = getNpmScope;

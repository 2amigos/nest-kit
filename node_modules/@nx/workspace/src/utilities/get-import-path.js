"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportPath = void 0;
const nx_json_1 = require("nx/src/generators/utils/nx-json");
const json_1 = require("nx/src/generators/utils/json");
function getImportPath(tree, projectDirectory) {
    const npmScope = getNpmScope(tree);
    return npmScope
        ? `${npmScope === '@' ? '' : '@'}${npmScope}/${projectDirectory}`
        : projectDirectory;
}
exports.getImportPath = getImportPath;
function getNpmScope(tree) {
    const nxJson = (0, nx_json_1.readNxJson)(tree);
    // TODO(v17): Remove reading this from nx.json
    if (nxJson.npmScope) {
        return nxJson.npmScope;
    }
    const { name } = tree.exists('package.json')
        ? (0, json_1.readJson)(tree, 'package.json')
        : { name: null };
    if (name === null || name === void 0 ? void 0 : name.startsWith('@')) {
        return name.split('/')[0].substring(1);
    }
}

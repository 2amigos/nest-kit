"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSchema = void 0;
const utils_1 = require("./utils");
const get_import_path_1 = require("../../../utilities/get-import-path");
function normalizeSchema(tree, schema, projectConfiguration) {
    var _a, _b;
    const destination = (0, utils_1.normalizePathSlashes)(schema.destination);
    const newProjectName = (_a = schema.newProjectName) !== null && _a !== void 0 ? _a : (0, utils_1.getNewProjectName)(destination);
    return Object.assign(Object.assign({}, schema), { destination, importPath: (_b = schema.importPath) !== null && _b !== void 0 ? _b : (0, utils_1.normalizePathSlashes)((0, get_import_path_1.getImportPath)(tree, destination)), newProjectName, relativeToRootDestination: (0, utils_1.getDestination)(tree, schema, projectConfiguration) });
}
exports.normalizeSchema = normalizeSchema;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = void 0;
/**
 * Remove a file from the Virtual Schematic Tree
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'Tree.delete' from @nx/devkit.
 */
function deleteFile(from) {
    return (host) => host.delete(from);
}
exports.deleteFile = deleteFile;

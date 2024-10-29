"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageJson = exports.getAllDependencies = void 0;
const devkit_1 = require("@nx/devkit");
const fs_1 = require("fs");
function getAllDependencies(packageJson) {
    return Object.assign(Object.assign(Object.assign(Object.assign({}, packageJson.dependencies), packageJson.devDependencies), packageJson.peerDependencies), packageJson.optionalDependencies);
}
exports.getAllDependencies = getAllDependencies;
function getPackageJson(path) {
    if ((0, fs_1.existsSync)(path)) {
        return (0, devkit_1.readJsonFile)(path);
    }
    return {};
}
exports.getPackageJson = getPackageJson;

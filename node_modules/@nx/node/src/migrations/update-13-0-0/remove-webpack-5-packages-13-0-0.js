"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const packages = [
    'webpack',
    'copy-webpack-plugin',
    'webpack-merge',
    'webpack-node-externals',
    'mini-css-extract-plugin',
    'source-map-loader',
    'terser-webpack-plugin',
    'webpack-dev-server',
    'webpack-sources',
    'react-refresh',
    '@pmmmwh/react-refresh-webpack-plugin',
];
function update(tree) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const packageJson = (0, devkit_1.readJson)(tree, 'package.json');
        let task = undefined;
        // Undo the install by `nx g @nrwl/web:webpack5` in Nx 12.
        if (((_a = packageJson.devDependencies['webpack']) === null || _a === void 0 ? void 0 : _a.match(/^([\^~])?5\./)) &&
            packages.every((p) => packageJson.devDependencies[p])) {
            task = (0, devkit_1.removeDependenciesFromPackageJson)(tree, [], packages);
            yield (0, devkit_1.formatFiles)(tree);
        }
        return task;
    });
}
exports.default = update;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webpackInitSchematic = exports.webpackInitGenerator = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const add_swc_dependencies_1 = require("@nx/js/src/utils/swc/add-swc-dependencies");
const versions_1 = require("../../utils/versions");
function webpackInitGenerator(tree, schema) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const tasks = [];
        const devDependencies = {
            '@nx/webpack': versions_1.nxVersion,
        };
        if (schema.compiler === 'swc') {
            devDependencies['swc-loader'] = versions_1.swcLoaderVersion;
            const addSwcTask = (0, add_swc_dependencies_1.addSwcDependencies)(tree);
            tasks.push(addSwcTask);
        }
        if (schema.compiler === 'tsc') {
            devDependencies['tslib'] = versions_1.tsLibVersion;
        }
        if (schema.uiFramework === 'react') {
            devDependencies['@pmmmwh/react-refresh-webpack-plugin'] =
                versions_1.reactRefreshWebpackPluginVersion;
            devDependencies['@svgr/webpack'] = versions_1.svgrWebpackVersion;
            devDependencies['react-refresh'] = versions_1.reactRefreshVersion;
            devDependencies['url-loader'] = versions_1.urlLoaderVersion;
        }
        if (!schema.skipFormat) {
            yield (0, devkit_1.formatFiles)(tree);
        }
        const baseInstalTask = (0, devkit_1.addDependenciesToPackageJson)(tree, {}, devDependencies);
        tasks.push(baseInstalTask);
        return (0, devkit_1.runTasksInSerial)(...tasks);
    });
}
exports.webpackInitGenerator = webpackInitGenerator;
exports.default = webpackInitGenerator;
exports.webpackInitSchematic = (0, devkit_1.convertNxGenerator)(webpackInitGenerator);

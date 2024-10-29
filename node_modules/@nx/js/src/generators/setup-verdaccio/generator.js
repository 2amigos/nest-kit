"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupVerdaccioSchematic = exports.setupVerdaccio = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const path = require("path");
const versions_1 = require("../../utils/versions");
const child_process_1 = require("child_process");
function setupVerdaccio(tree, options) {
    var _a, _b, _c;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!tree.exists('.verdaccio/config.yml')) {
            (0, devkit_1.generateFiles)(tree, path.join(__dirname, 'files'), '.verdaccio', {
                npmUplinkRegistry: (_c = (_b = (_a = (0, child_process_1.execSync)('npm config get registry')) === null || _a === void 0 ? void 0 : _a.toString()) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : 'https://registry.npmjs.org',
            });
        }
        const verdaccioTarget = {
            executor: '@nx/js:verdaccio',
            options: {
                port: 4873,
                config: '.verdaccio/config.yml',
                storage: 'tmp/local-registry/storage',
            },
        };
        if (!tree.exists('project.json')) {
            const { name } = (0, devkit_1.readJson)(tree, 'package.json');
            (0, devkit_1.updateJson)(tree, 'package.json', (json) => {
                if (!json.nx) {
                    json.nx = {
                        includedScripts: [],
                    };
                }
                return json;
            });
            (0, devkit_1.addProjectConfiguration)(tree, name, {
                root: '.',
                targets: {
                    ['local-registry']: verdaccioTarget,
                },
            });
        }
        else {
            // use updateJson instead of updateProjectConfiguration due to unknown project name
            (0, devkit_1.updateJson)(tree, 'project.json', (json) => {
                var _a;
                var _b;
                if (!json.targets) {
                    json.targets = {};
                }
                (_a = (_b = json.targets)['local-registry']) !== null && _a !== void 0 ? _a : (_b['local-registry'] = verdaccioTarget);
                return json;
            });
        }
        if (!options.skipFormat) {
            yield (0, devkit_1.formatFiles)(tree);
        }
        return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { verdaccio: versions_1.verdaccioVersion });
    });
}
exports.setupVerdaccio = setupVerdaccio;
exports.default = setupVerdaccio;
exports.setupVerdaccioSchematic = (0, devkit_1.convertNxGenerator)(setupVerdaccio);

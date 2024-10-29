"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSchematic = exports.initGenerator = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const semver_1 = require("@nx/devkit/src/utils/semver");
const package_json_1 = require("nx/src/utils/package-json");
const semver_2 = require("semver");
const ts_config_1 = require("../../utils/typescript/ts-config");
const versions_1 = require("../../utils/versions");
function getInstalledTypescriptVersion(tree) {
    var _a, _b, _c, _d, _e, _f;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const rootPackageJson = (0, devkit_1.readJson)(tree, 'package.json');
        const tsVersionInRootPackageJson = (_b = (_a = rootPackageJson.devDependencies) === null || _a === void 0 ? void 0 : _a['typescript']) !== null && _b !== void 0 ? _b : (_c = rootPackageJson.dependencies) === null || _c === void 0 ? void 0 : _c['typescript'];
        if (!tsVersionInRootPackageJson) {
            return null;
        }
        if ((0, semver_2.valid)(tsVersionInRootPackageJson)) {
            // it's a pinned version, return it
            return tsVersionInRootPackageJson;
        }
        // it's a version range, check whether the installed version matches it
        try {
            const tsPackageJson = (0, package_json_1.readModulePackageJson)('typescript').packageJson;
            const installedTsVersion = (_e = (_d = tsPackageJson.devDependencies) === null || _d === void 0 ? void 0 : _d['typescript']) !== null && _e !== void 0 ? _e : (_f = tsPackageJson.dependencies) === null || _f === void 0 ? void 0 : _f['typescript'];
            // the installed version matches the package.json version range
            if (installedTsVersion &&
                (0, semver_2.satisfies)(installedTsVersion, tsVersionInRootPackageJson)) {
                return installedTsVersion;
            }
        }
        finally {
            return (0, semver_1.checkAndCleanWithSemver)('typescript', tsVersionInRootPackageJson);
        }
    });
}
function initGenerator(tree, schema) {
    var _a;
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const tasks = [];
        // add tsconfig.base.json
        if (!(0, ts_config_1.getRootTsConfigFileName)(tree)) {
            (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, './files'), '.', {
                fileName: (_a = schema.tsConfigName) !== null && _a !== void 0 ? _a : 'tsconfig.base.json',
            });
        }
        const devDependencies = {
            '@nx/js': versions_1.nxVersion,
            prettier: versions_1.prettierVersion,
        };
        if (!schema.js) {
            const installedTsVersion = yield getInstalledTypescriptVersion(tree);
            if (!installedTsVersion ||
                !(0, semver_2.satisfies)(installedTsVersion, versions_1.supportedTypescriptVersions, {
                    includePrerelease: true,
                })) {
                devDependencies['typescript'] = versions_1.typescriptVersion;
            }
        }
        // https://prettier.io/docs/en/configuration.html
        const prettierrcNameOptions = [
            '.prettierrc',
            '.prettierrc.json',
            '.prettierrc.yml',
            '.prettierrc.yaml',
            '.prettierrc.json5',
            '.prettierrc.js',
            '.prettierrc.cjs',
            'prettier.config.js',
            'prettier.config.cjs',
            '.prettierrc.toml',
        ];
        if (prettierrcNameOptions.every((name) => !tree.exists(name))) {
            (0, devkit_1.writeJson)(tree, '.prettierrc', {
                singleQuote: true,
            });
        }
        if (!tree.exists(`.prettierignore`)) {
            tree.write('.prettierignore', (0, devkit_1.stripIndents) `
        # Add files here to ignore them from prettier formatting
        /dist
        /coverage
      `);
        }
        if (tree.exists('.vscode/extensions.json')) {
            (0, devkit_1.updateJson)(tree, '.vscode/extensions.json', (json) => {
                var _a;
                (_a = json.recommendations) !== null && _a !== void 0 ? _a : (json.recommendations = []);
                const extension = 'esbenp.prettier-vscode';
                if (!json.recommendations.includes(extension)) {
                    json.recommendations.push(extension);
                }
                return json;
            });
        }
        const installTask = !schema.skipPackageJson
            ? (0, devkit_1.addDependenciesToPackageJson)(tree, {}, devDependencies)
            : () => { };
        tasks.push(installTask);
        (0, devkit_1.ensurePackage)('prettier', versions_1.prettierVersion);
        if (!schema.skipFormat) {
            yield (0, devkit_1.formatFiles)(tree);
        }
        return () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const task of tasks) {
                yield task();
            }
        });
    });
}
exports.initGenerator = initGenerator;
exports.default = initGenerator;
exports.initSchematic = (0, devkit_1.convertNxGenerator)(initGenerator);

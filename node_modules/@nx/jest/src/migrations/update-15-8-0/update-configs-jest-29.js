"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfigsJest29 = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const ast_utils_1 = require("../../utils/ast-utils");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const ts = require("typescript");
const find_root_jest_files_1 = require("../../utils/config/find-root-jest-files");
function updateConfigsJest29(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const rootPreset = (0, find_root_jest_files_1.findRootJestPreset)(tree);
        const targetsWithJest = new Set();
        // have to use graph so the negative configuration targets are expanded
        const graph = yield (0, devkit_1.createProjectGraphAsync)();
        (0, executor_options_utils_1.forEachExecutorOptionsInGraph)(graph, '@nrwl/jest:jest', (options, projectName, targetName) => {
            if (options.jestConfig && tree.exists(options.jestConfig)) {
                targetsWithJest.add(targetName);
                // if the default root preset exists or if the project doesn't have a 'preset' configured
                //  -> update snapshot config
                if (!rootPreset || !hasPresetConfigured(tree, options.jestConfig)) {
                    addSnapshotOptionsToConfig(tree, options.jestConfig, `From within the project directory, run "nx test --update-snapshot"`);
                }
                updateTsJestOptions(tree, options.jestConfig);
                updateNgJestOptions(tree, options.jestConfig);
            }
        });
        if (rootPreset && tree.exists(rootPreset)) {
            const cmd = `"nx affected --targets=${Array.from(targetsWithJest).join(',')} --update-snapshot"`;
            addSnapshotOptionsToConfig(tree, rootPreset, cmd);
            updateTsJestOptions(tree, rootPreset);
            updateNgJestOptions(tree, rootPreset);
        }
        yield (0, devkit_1.formatFiles)(tree);
        devkit_1.logger.info((0, devkit_1.stripIndents) `NX Jest Snapshot format changed in v29.
By default Nx kept the older style to prevent breaking of existing tests with snapshots.
It's recommend you update to the latest format.
You can do this in your project's jest config file.
Remove the snapshotFormat property and re-run tests with the --update-snapshot flag.
More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format`);
    });
}
exports.updateConfigsJest29 = updateConfigsJest29;
function addSnapshotOptionsToConfig(tree, configPath, updateSnapshotExample) {
    const config = tree.read(configPath, 'utf-8');
    const hasSnapshotOptions = tsquery_1.tsquery.query(config, `${ast_utils_1.TS_QUERY_JEST_CONFIG_PREFIX} > ObjectLiteralExpression PropertyAssignment:has(Identifier[name="snapshotFormat"])`);
    if (hasSnapshotOptions.length > 0) {
        return;
    }
    const updatedConfig = tsquery_1.tsquery.replace(config, `${ast_utils_1.TS_QUERY_JEST_CONFIG_PREFIX} > ObjectLiteralExpression`, (node) => {
        return `{
${node.properties.map((p) => getNodeWithComments(config, p)).join(',\n')},
/* TODO: Update to latest Jest snapshotFormat
 * By default Nx has kept the older style of Jest Snapshot formats
 * to prevent breaking of any existing tests with snapshots.
 * It's recommend you update to the latest format.
 * You can do this by removing snapshotFormat property
 * and running tests with --update-snapshot flag.
 * Example: ${updateSnapshotExample}
 * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
 */
snapshotFormat: { escapeString: true, printBasicPrototype: true }
}`;
    }, { visitAllChildren: false });
    tree.write(configPath, updatedConfig);
}
function hasPresetConfigured(tree, configPath) {
    var _a;
    const contents = tree.read(configPath, 'utf-8');
    return (((_a = tsquery_1.tsquery.query(contents, `${ast_utils_1.TS_QUERY_JEST_CONFIG_PREFIX} > ObjectLiteralExpression PropertyAssignment:has(Identifier[name="preset"])`)) === null || _a === void 0 ? void 0 : _a.length) > 0);
}
function updateTsJestOptions(tree, configPath) {
    // query for the globals property, if they don't have one then there's nothing to modify.
    const contents = tree.read(configPath, 'utf-8');
    let tsJestGlobalsConfig;
    const noTsJestGlobals = tsquery_1.tsquery.replace(contents, `${ast_utils_1.TS_QUERY_JEST_CONFIG_PREFIX} > ObjectLiteralExpression PropertyAssignment:has(Identifier[name="globals"])`, (node) => {
        if (tsJestGlobalsConfig) {
            devkit_1.logger.warn((0, devkit_1.stripIndents) `Found more than one "globals" object in the jest config, ${configPath}
          Will use the first one`);
            return;
        }
        tsJestGlobalsConfig = getGlobalTsJestConfig(node);
        return getGlobalConfigWithoutTsJest(node);
    });
    if (!tsJestGlobalsConfig) {
        return;
    }
    const updatedTsJestTransformer = tsquery_1.tsquery.replace(noTsJestGlobals, `${ast_utils_1.TS_QUERY_JEST_CONFIG_PREFIX}> ObjectLiteralExpression PropertyAssignment:has(Identifier[name="transform"]) PropertyAssignment > :has(StringLiteral[value="ts-jest"], StringLiteral[value="jest-preset-angular"])`, (node) => {
        return `[${node.getText()}, ${tsJestGlobalsConfig}]`;
    });
    tree.write(configPath, updatedTsJestTransformer);
}
function updateNgJestOptions(tree, configPath) {
    const contents = tree.read(configPath, 'utf-8');
    let ngJestTeardownConfig;
    const noTeardownConfig = tsquery_1.tsquery.replace(contents, 'BinaryExpression:has(PropertyAccessExpression:has(Identifier[name=ngJest]))  PropertyAssignment:has(Identifier[name=teardown])', (node) => {
        ngJestTeardownConfig = node.initializer.getText();
        return ' ';
    });
    if (!ngJestTeardownConfig) {
        return;
    }
    let maybeUpdatedTestEnvOpts = tsquery_1.tsquery.replace(noTeardownConfig, `${ast_utils_1.TS_QUERY_JEST_CONFIG_PREFIX} > ObjectLiteralExpression PropertyAssignment:has(Identifier[name="testEnvironmentOptions"]) ObjectLiteralExpression`, (node) => {
        return `{
  ${node.properties
            .map((p) => getNodeWithComments(noTeardownConfig, p))
            .join(',\n')},
   teardown: ${ngJestTeardownConfig}
  }`;
    });
    if (maybeUpdatedTestEnvOpts !== noTeardownConfig) {
        tree.write(configPath, maybeUpdatedTestEnvOpts);
        return;
    }
    // didn't find existing testEnvironmentOptions, so add the new property
    const updatedConfig = tsquery_1.tsquery.replace(maybeUpdatedTestEnvOpts, `${ast_utils_1.TS_QUERY_JEST_CONFIG_PREFIX} > ObjectLiteralExpression`, (node) => {
        return `{
${node.properties
            .map((p) => getNodeWithComments(maybeUpdatedTestEnvOpts, p))
            .join(',\n')},
testEnvironmentOptions: { teardown: ${ngJestTeardownConfig} }, 
}`;
    }, { visitAllChildren: false });
    tree.write(configPath, updatedConfig);
}
function getGlobalTsJestConfig(node) {
    var _a;
    const globalObject = node.initializer;
    const foundConfig = globalObject.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText().includes('ts-jest'));
    return ((_a = foundConfig === null || foundConfig === void 0 ? void 0 : foundConfig.initializer) === null || _a === void 0 ? void 0 : _a.getText()) || '';
}
function getGlobalConfigWithoutTsJest(node) {
    var _a;
    const globalObject = node === null || node === void 0 ? void 0 : node.initializer;
    const withoutTsJest = (_a = globalObject === null || globalObject === void 0 ? void 0 : globalObject.properties) === null || _a === void 0 ? void 0 : _a.filter((p) => {
        return !(ts.isPropertyAssignment(p) && p.name.getText().includes('ts-jest'));
    });
    const globalConfigs = withoutTsJest.map((c) => c.getText()).join(',\n');
    return `globals: { ${globalConfigs} }`;
}
function getNodeWithComments(fullText, node) {
    const commentRanges = ts.getLeadingCommentRanges(fullText, node.getFullStart());
    if ((commentRanges === null || commentRanges === void 0 ? void 0 : commentRanges.length) > 0) {
        const withComments = `${commentRanges
            .map((r) => fullText.slice(r.pos, r.end))
            .join('\n')}\n${node.getText()}`;
        return withComments;
    }
    return node.getText();
}
exports.default = updateConfigsJest29;

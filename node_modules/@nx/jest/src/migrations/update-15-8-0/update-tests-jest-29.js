"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJestMocked = exports.updateJestMockTypes = exports.updateTestsJest29 = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const ast_utils_1 = require("../../utils/ast-utils");
function updateTestsJest29(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const graph = yield (0, devkit_1.createProjectGraphAsync)();
        (0, executor_options_utils_1.forEachExecutorOptionsInGraph)(graph, '@nrwl/jest:jest', (options, projectName) => {
            const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, projectName);
            (0, devkit_1.visitNotIgnoredFiles)(tree, projectConfig.sourceRoot || projectConfig.root, (file) => {
                if (!ast_utils_1.TEST_FILE_PATTERN.test(file)) {
                    return;
                }
                updateJestMockTypes(tree, file);
                updateJestMocked(tree, file);
            });
        });
        yield (0, devkit_1.formatFiles)(tree);
    });
}
exports.updateTestsJest29 = updateTestsJest29;
function updateJestMockTypes(tree, filePath) {
    const contents = tree.read(filePath, 'utf-8');
    const updatedContent = tsquery_1.tsquery.replace(contents, ':matches(ImportDeclaration, VariableStatement):has(Identifier[name="MaybeMockedDeep"], Identifier[name="MaybeMocked"]):has(StringLiteral[value="jest-mock"])', (node) => {
        const text = node.getText();
        return (text
            // MaybeMockedDeep and MaybeMocked now are exported as Mocked and MockedShallow
            .replace('MaybeMockedDeep', 'Mocked')
            .replace('MaybeMocked', 'MockedShallow'));
    });
    tree.write(filePath, updatedContent);
}
exports.updateJestMockTypes = updateJestMockTypes;
function updateJestMocked(tree, filePath) {
    const contents = tree.read(filePath, 'utf-8');
    const jestGlobalNodes = tsquery_1.tsquery.query(contents, ':matches(ImportDeclaration, VariableStatement):has(Identifier[name="jest"]):has(StringLiteral[value="@jest/globals"])');
    // this only applies if using jest from @jest/globals
    if (jestGlobalNodes.length === 0) {
        return;
    }
    const updatedJestMockTypes = tsquery_1.tsquery.replace(contents, 'CallExpression:has(Identifier[name="jest"]):has(Identifier[name="mocked"])', (node) => {
        if (node.arguments.length === 2 &&
            node.getText().startsWith('jest.mocked(')) {
            const text = node.getText();
            // jest.mocked(someObject, true); => jest.mocked(someObject);
            if (node.arguments[1].getText() === 'true') {
                return text.replace(/,\s*true/g, '');
            }
            // jest.mocked(someObject, false); => jest.mocked(someObject, {shallow: true});
            // opt into the new behavior unless explicitly opting out
            if (node.arguments[1].getText() === 'false') {
                return text.replace('false', '{shallow: true}');
            }
        }
    });
    tree.write(filePath, updatedJestMockTypes);
}
exports.updateJestMocked = updateJestMocked;
exports.default = updateTestsJest29;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJestImports = exports.updateJestFnMocks = exports.updateJestTimers = exports.updateTestsJest28 = void 0;
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const ts = require("typescript");
function updateTestsJest28(tree) {
    const testFilePatterns = /.*.(spec|test)\.(ts|js)x?/g;
    const legacyTimers = /(timers:\s*['"`]legacy['"`])|(legacyFakeTimers:\s*true)/g;
    (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nrwl/jest:jest', (options, projectName) => {
        const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, projectName);
        const isUsingLegacyTimers = options.jestConfig &&
            tree.exists(options.jestConfig) &&
            legacyTimers.test(tree.read(options.jestConfig, 'utf-8'));
        (0, devkit_1.visitNotIgnoredFiles)(tree, projectConfig.root, (filePath) => {
            if (!filePath.match(testFilePatterns)) {
                return;
            }
            let fileContent = tree.read(filePath, 'utf-8');
            fileContent = updateJestTimers(fileContent, isUsingLegacyTimers);
            if (fileContent.includes('@jest/globals')) {
                fileContent = updateJestFnMocks(fileContent);
            }
            fileContent = updateJestImports(fileContent);
            tree.write(filePath, fileContent);
        });
    });
}
exports.updateTestsJest28 = updateTestsJest28;
/**
 * jest.useFakeTimers('modern') -> jest.useFakeTimers()
 * jest.useFakeTimers('legacy') -> jest.useFakeTimers({legacyFakeTimers: true})
 * if legacyFakeTimers is true in config, then
 * jest.useFakeTimers('modern') -> jest.useRealTimers({legacyFakeTimers: false})
 */
function updateJestTimers(fileContents, legacyFakeTimersInConfig) {
    return tsquery_1.tsquery.replace(fileContents, 'CallExpression', (node) => {
        if (!(node === null || node === void 0 ? void 0 : node.getText().startsWith('jest.useFakeTimers'))) {
            return;
        }
        const timerType = node.getText();
        // will be modern or legacy with quotes
        // just make sure it's included to ignore different quote types
        if (timerType.includes('legacy')) {
            return 'jest.useFakeTimers({ legacyFakeTimers: true })';
        }
        if (legacyFakeTimersInConfig) {
            // using modern but have config set to legacy
            return 'jest.useRealTimers({ legacyFakeTimers: false })';
        }
        // have to include space otherwise empty string will not remove the string literal
        return 'jest.useFakeTimers()';
    });
}
exports.updateJestTimers = updateJestTimers;
/**
 * make sure using jest.fn<T>
 */
function isTypedJestFnMock(node) {
    return ts.isCallExpression(node) && node.getText().startsWith('jest.fn<');
}
/**
 * has 2 args where the second is a tuple or array
 * i.e.
 * jest.fn<Promise<string>, []>()
 * jest.fn<number, MyType[]>()
 * jest.fn<number, [string, number, SomeType]>()
 */
function isValid2Args(node) {
    var _a, _b;
    const r = (node === null || node === void 0 ? void 0 : node.typeArguments.length) === 2 &&
        (((_a = node.typeArguments[1]) === null || _a === void 0 ? void 0 : _a.kind) === ts.SyntaxKind.TupleType ||
            ((_b = node.typeArguments[1]) === null || _b === void 0 ? void 0 : _b.kind) === ts.SyntaxKind.ArrayType);
    return r;
}
/**
 * has 1 arg where the type is NOT a FunctionType
 * if it's a function type then it's already using the correct syntax
 * i.e.
 * jest.fn<string>()
 * jest.fn<() => Promise<string>>() is already valid, don't change it.
 */
function isValid1Arg(node) {
    var _a, _b;
    const r = (node === null || node === void 0 ? void 0 : node.typeArguments.length) === 1 &&
        ((_a = node.typeArguments[0]) === null || _a === void 0 ? void 0 : _a.kind) !== ts.SyntaxKind.FunctionType &&
        ((_b = node.typeArguments[0]) === null || _b === void 0 ? void 0 : _b.kind) !== ts.SyntaxKind.TypeQuery;
    return r;
}
/**
 * has a type reference as a type args
 * jest.fn<ReturnType<typeof add>, Parameters<typeof add>>();
 */
function isValidTypeRef(node) {
    var _a, _b;
    const r = node.typeArguments[0].kind === ts.SyntaxKind.TypeReference &&
        !!((_b = (_a = node.typeArguments) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.typeArguments);
    return r;
}
/**
 * has valid type args. prevent converting an already converted jest.fn<T>()
 */
function isValidType(node) {
    var _a, _b, _c;
    const r = (node === null || node === void 0 ? void 0 : node.typeArguments.length) === 1 &&
        (((_a = node.typeArguments[0]) === null || _a === void 0 ? void 0 : _a.kind) === ts.SyntaxKind.FunctionType ||
            ((_b = node.typeArguments[0]) === null || _b === void 0 ? void 0 : _b.kind) === ts.SyntaxKind.TypeReference ||
            ((_c = node.typeArguments[0]) === null || _c === void 0 ? void 0 : _c.kind) === ts.SyntaxKind.TypeQuery ||
            node.parent.getText().includes('/** TODO:')); // has already been marked by a previous run.
    return r;
}
/**
 * this only applies to tests using @jest/globals
 * jest.fn<Promise<string>, []>() -> jest.fn<() => Promise<string>>()
 * jest.fn<number, string[]>() -> jest.fn<() => number>()
 * jest.fn<ReturnType<typeof add>, Parameters<typeof add>>(); -> jest.fn<typeof add>()
 */
function updateJestFnMocks(fileContents) {
    return tsquery_1.tsquery.replace(fileContents, 'CallExpression', (node) => {
        if (!isTypedJestFnMock(node) || isValidType(node)) {
            return;
        }
        if (isValid2Args(node) || isValid1Arg(node)) {
            return `${node.getText().split('<')[0]}<() => ${node.typeArguments[0].getText()}>()`;
        }
        if (isValidTypeRef(node)) {
            const innerType = node.typeArguments[0]
                .typeArguments;
            return `${node.getText().split('<')[0]}<${innerType[0].getText()}>()`;
        }
        return `/** TODO: Update jest.fn<T>() type args for Jest v28 https://jestjs.io/docs/upgrading-to-jest28#jestfn */ ${node.getText()}`;
    });
}
exports.updateJestFnMocks = updateJestFnMocks;
/**
 * import expect from 'expect' -> import { expect } from 'expect'
 * const expect = require('expect') -> const { expect } = require('expect')
 * import { mocked } from 'ts-jest/utils' => import { mocked } from 'jest-mock';
 * const { mocked } = require('ts-jest/utils'); => const { mocked } = require('jest-mock');
 */
function updateJestImports(content) {
    const mockUpdatedImports = tsquery_1.tsquery.replace(content, ':matches(ImportDeclaration:has(Identifier[name="mocked"]) StringLiteral[value="ts-jest/utils"], VariableStatement:has(Identifier[name="mocked"]) StringLiteral[value="ts-jest/utils"])', () => {
        return "'jest-mock'";
    });
    return tsquery_1.tsquery.replace(mockUpdatedImports, ':matches(ImportDeclaration:has(StringLiteral[value="expect"]), VariableDeclaration:has(StringLiteral[value="expect"]))', (node) => {
        if (ts.isImportDeclaration(node)) {
            return `import { expect } from 'expect';`;
        }
        if (ts.isVariableDeclaration(node)) {
            return `{ expect } = require('expect')`; // this query doesn't capture the ; so we don't need to add it in the replace.
        }
        return;
    });
}
exports.updateJestImports = updateJestImports;
exports.default = updateTestsJest28;

import { Tree } from '@nx/devkit';
export declare function updateTestsJest28(tree: Tree): void;
/**
 * jest.useFakeTimers('modern') -> jest.useFakeTimers()
 * jest.useFakeTimers('legacy') -> jest.useFakeTimers({legacyFakeTimers: true})
 * if legacyFakeTimers is true in config, then
 * jest.useFakeTimers('modern') -> jest.useRealTimers({legacyFakeTimers: false})
 */
export declare function updateJestTimers(fileContents: string, legacyFakeTimersInConfig: boolean): string;
/**
 * this only applies to tests using @jest/globals
 * jest.fn<Promise<string>, []>() -> jest.fn<() => Promise<string>>()
 * jest.fn<number, string[]>() -> jest.fn<() => number>()
 * jest.fn<ReturnType<typeof add>, Parameters<typeof add>>(); -> jest.fn<typeof add>()
 */
export declare function updateJestFnMocks(fileContents: string): string;
/**
 * import expect from 'expect' -> import { expect } from 'expect'
 * const expect = require('expect') -> const { expect } = require('expect')
 * import { mocked } from 'ts-jest/utils' => import { mocked } from 'jest-mock';
 * const { mocked } = require('ts-jest/utils'); => const { mocked } = require('jest-mock');
 */
export declare function updateJestImports(content: string): string;
export default updateTestsJest28;

import type { Tree } from '@nx/devkit';
import { Linter } from '../utils/linter';
interface LintProjectOptions {
    project: string;
    linter?: Linter;
    eslintFilePatterns?: string[];
    tsConfigPaths?: string[];
    skipFormat: boolean;
    setParserOptionsProject?: boolean;
    skipPackageJson?: boolean;
    unitTestRunner?: string;
    rootProject?: boolean;
}
export declare function mapLintPattern(projectRoot: string, extension: string, rootProject?: boolean): string;
export declare function lintProjectGenerator(tree: Tree, options: LintProjectOptions): Promise<import("@nx/devkit").GeneratorCallback>;
export {};

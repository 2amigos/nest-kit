import { Tree } from '@nx/devkit';
import { ConvertTSLintToESLintSchema } from '@nx/linter';
export declare function conversionGenerator(host: Tree, options: ConvertTSLintToESLintSchema): Promise<() => Promise<void>>;
export declare const conversionSchematic: (generatorOptions: ConvertTSLintToESLintSchema) => (tree: any, context: any) => Promise<any>;

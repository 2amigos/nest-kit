import { GeneratorCallback, Tree } from '@nx/devkit';
import { Schema } from './schema';
export declare function webpackInitGenerator(tree: Tree, schema: Schema): Promise<GeneratorCallback>;
export default webpackInitGenerator;
export declare const webpackInitSchematic: (generatorOptions: Schema) => (tree: any, context: any) => Promise<any>;

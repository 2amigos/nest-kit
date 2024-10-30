import { GeneratorCallback, Tree } from '@nx/devkit';
import { JestInitSchema } from './schema';
export declare function jestInitGenerator(tree: Tree, schema: JestInitSchema): Promise<GeneratorCallback>;
export default jestInitGenerator;
export declare const jestInitSchematic: (generatorOptions: JestInitSchema) => (tree: any, context: any) => Promise<any>;

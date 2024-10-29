import { type GeneratorCallback, type Tree } from '@nx/devkit';
import { SetupBuildGeneratorSchema } from './schema';
export declare function setupBuildGenerator(tree: Tree, options: SetupBuildGeneratorSchema): Promise<GeneratorCallback>;
export default setupBuildGenerator;
export declare const setupBuildSchematic: (generatorOptions: SetupBuildGeneratorSchema) => (tree: any, context: any) => Promise<any>;

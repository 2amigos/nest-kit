import { Tree } from '@nx/devkit';
import { SetupVerdaccioGeneratorSchema } from './schema';
export declare function setupVerdaccio(tree: Tree, options: SetupVerdaccioGeneratorSchema): Promise<import("@nx/devkit").GeneratorCallback>;
export default setupVerdaccio;
export declare const setupVerdaccioSchematic: (generatorOptions: SetupVerdaccioGeneratorSchema) => (tree: any, context: any) => Promise<any>;

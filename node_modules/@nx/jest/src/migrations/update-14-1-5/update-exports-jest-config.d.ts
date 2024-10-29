import type { Tree } from '@nx/devkit';
export declare function updateExportsJestConfig(tree: Tree): import("@nx/devkit").GeneratorCallback;
export declare function updateRootFiles(tree: Tree): {
    didUpdateRootPreset: boolean;
};
export declare function updateToDefaultExport(tree: Tree, filePath: string): void;
export default updateExportsJestConfig;

import { type ProjectGraph, type ProjectGraphProjectNode, type ProjectFileMap } from '@nx/devkit';
/**
 * Finds all npm dependencies and their expected versions for a given project.
 */
export declare function findNpmDependencies(workspaceRoot: string, sourceProject: ProjectGraphProjectNode, projectGraph: ProjectGraph, projectFileMap: ProjectFileMap, buildTarget: string, options?: {
    includeTransitiveDependencies?: boolean;
}): Record<string, string>;

import type { ProjectGraph, ProjectGraphProjectNode } from '@nx/devkit';
import { ProjectGraphExternalNode } from '@nx/devkit';
/**
 * @deprecated This type will be removed from @nx/workspace in version 17. Prefer importing from @nx/js.
 */
export type DependentBuildableProjectNode = {
    name: string;
    outputs: string[];
    node: ProjectGraphProjectNode | ProjectGraphExternalNode;
};
/**
 * @deprecated This function will be removed from @nx/workspace in version 17. Prefer importing from @nx/js.
 */
export declare function calculateProjectDependencies(projGraph: ProjectGraph, root: string, projectName: string, targetName: string, configurationName: string, shallow?: boolean): {
    target: ProjectGraphProjectNode;
    dependencies: DependentBuildableProjectNode[];
    nonBuildableDependencies: string[];
    topLevelDependencies: DependentBuildableProjectNode[];
};
/**
 * @deprecated This function will be removed from @nx/workspace in version 17. Prefer importing from @nx/js.
 */
export declare function createTmpTsConfig(tsconfigPath: string, workspaceRoot: string, projectRoot: string, dependencies: DependentBuildableProjectNode[]): string;
/**
 * @deprecated This function will be removed from @nx/workspace in version 17. Prefer importing from @nx/js.
 */
export declare function checkDependentProjectsHaveBeenBuilt(root: string, projectName: string, targetName: string, projectDependencies: DependentBuildableProjectNode[]): boolean;
/**
 * @deprecated This function will be removed from @nx/workspace in version 17. Prefer importing from @nx/js.
 */
export declare function findMissingBuildDependencies(root: string, projectName: string, targetName: string, projectDependencies: DependentBuildableProjectNode[]): DependentBuildableProjectNode[];
/**
 * @deprecated This function will be removed from @nx/workspace in version 17. Prefer importing from @nx/js.
 */
export declare function updatePaths(dependencies: DependentBuildableProjectNode[], paths: Record<string, string[]>): void;
/**
 * Updates the peerDependencies section in the `dist/lib/xyz/package.json` with
 * the proper dependency and version
 * @deprecated This function will be removed from @nx/workspace in version 17. Prefer importing from @nx/js.
 */
export declare function updateBuildableProjectPackageJsonDependencies(root: string, projectName: string, targetName: string, configurationName: string, node: ProjectGraphProjectNode, dependencies: DependentBuildableProjectNode[], typeOfDependency?: 'dependencies' | 'peerDependencies'): void;

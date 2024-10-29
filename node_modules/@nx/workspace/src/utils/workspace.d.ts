import type { Rule, Tree } from '@angular-devkit/schematics';
import { JsonArray, JsonObject, workspaces } from '@angular-devkit/core';
import { ProjectDefinition, TargetDefinition } from '@angular-devkit/core/src/workspace';
/**
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'getProjects' with Nx Devkit.
 */
export declare function getWorkspace(tree: Tree, path?: string): Promise<workspaces.WorkspaceDefinition>;
/**
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'updateProjectConfiguration' with Nx Devkit.
 */
export declare function updateWorkspace(updater: (workspace: workspaces.WorkspaceDefinition) => void | PromiseLike<void>): Rule;
/**
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'updateProjectConfiguration' with Nx Devkit.
 */
export declare function updateWorkspace(workspace: workspaces.WorkspaceDefinition): Rule;
/**
 * Updates builder options for options and configurations for given builder names
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'forEachExecutorOptions' with Nx Devkit.
 */
export declare function updateBuilderConfig(updater: (currentValue: Record<string, string | number | boolean | JsonArray | JsonObject>, target?: TargetDefinition, project?: ProjectDefinition) => Record<string, string | number | boolean | JsonArray | JsonObject>, ...builderNames: string[]): Rule;

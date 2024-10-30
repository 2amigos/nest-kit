import type { Rule } from '@angular-devkit/schematics';
/**
 * Remove a file from the Virtual Schematic Tree
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'Tree.delete' from @nx/devkit.
 */
export declare function deleteFile(from: string): Rule;

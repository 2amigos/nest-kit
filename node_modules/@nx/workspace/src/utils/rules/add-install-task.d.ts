import type { Rule } from '@angular-devkit/schematics';
/**
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'addDependenciesToPackageJson' from @nx/devkit.
 */
export declare function addInstallTask(options?: {
    skipInstall: boolean;
}): Rule;

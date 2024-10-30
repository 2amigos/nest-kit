import { Rule } from '@angular-devkit/schematics';
/**
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'formatFiles' from @nx/devkit.
 */
export declare function formatFiles(options?: {
    skipFormat: boolean;
}, directory?: string): Rule;

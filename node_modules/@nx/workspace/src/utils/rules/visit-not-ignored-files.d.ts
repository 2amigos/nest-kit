import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
/**
 * @deprecated This will be removed in v17. Prefer writing Nx Generators with @nx/devkit. This function can be replaced with 'visitNotIgnoredFiles' from @nx/devkit.
 */
export declare function visitNotIgnoredFiles(visitor: (file: Path, host: Tree, context: SchematicContext) => void | Rule, dir?: Path): Rule;

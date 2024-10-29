import { PackageManager, Tree } from '@nx/devkit';
import { Linter } from '../../utils/lint';
interface Schema {
    directory: string;
    name: string;
    appName?: string;
    skipInstall?: boolean;
    style?: string;
    nxCloud?: boolean;
    preset: string;
    defaultBase: string;
    framework?: string;
    docker?: boolean;
    js?: boolean;
    nextAppDir?: boolean;
    linter?: Linter;
    bundler?: 'vite' | 'webpack';
    standaloneApi?: boolean;
    routing?: boolean;
    packageManager?: PackageManager;
    e2eTestRunner?: 'cypress' | 'detox' | 'jest' | 'none';
}
export interface NormalizedSchema extends Schema {
    presetVersion?: string;
    isCustomPreset: boolean;
}
export declare function newGenerator(host: Tree, opts: Schema): Promise<() => Promise<void>>;
export default newGenerator;

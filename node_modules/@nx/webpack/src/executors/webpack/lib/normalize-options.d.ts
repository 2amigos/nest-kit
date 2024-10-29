import type { AssetGlobPattern, NormalizedWebpackExecutorOptions, WebpackExecutorOptions } from '../schema';
export declare function normalizeOptions(options: WebpackExecutorOptions, root: string, projectRoot: string, sourceRoot: string): NormalizedWebpackExecutorOptions;
export declare function normalizePluginPath(pluginPath: void | string, root: string): string;
export declare function normalizeAssets(assets: any[], root: string, sourceRoot: string): AssetGlobPattern[];

import { ExecutorContext } from '@nx/devkit';
import { Configuration } from 'webpack';
import { NormalizedWebpackExecutorOptions } from '../executors/webpack/schema';
/** @deprecated use withNx and withWeb plugins directly */
export declare function getBaseWebpackPartial(options: NormalizedWebpackExecutorOptions, context?: ExecutorContext): Configuration;
export interface NxWebpackExecutionContext {
    options: NormalizedWebpackExecutorOptions;
    context: ExecutorContext;
}
export interface NxWebpackPlugin {
    (config: Configuration, ctx: NxWebpackExecutionContext): Configuration;
}
export interface AsyncNxWebpackPlugin {
    (config: Configuration, ctx: NxWebpackExecutionContext): Configuration | Promise<Configuration>;
}
export declare function composePlugins(...plugins: (NxWebpackPlugin | AsyncNxWebpackPlugin | Promise<NxWebpackPlugin | AsyncNxWebpackPlugin>)[]): (config: Configuration, ctx: NxWebpackExecutionContext) => Promise<Configuration>;
export declare function composePluginsSync(...plugins: NxWebpackPlugin[]): (config: Configuration, ctx: NxWebpackExecutionContext) => Configuration;

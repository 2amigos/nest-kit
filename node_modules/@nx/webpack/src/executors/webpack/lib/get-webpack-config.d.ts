import type { Configuration } from 'webpack';
import { ExecutorContext } from '@nx/devkit';
import { NormalizedWebpackExecutorOptions } from '../schema';
/** @deprecated Use withNx, withWeb, or withReact */
export declare function getWebpackConfig(context: ExecutorContext, options: NormalizedWebpackExecutorOptions): Configuration;

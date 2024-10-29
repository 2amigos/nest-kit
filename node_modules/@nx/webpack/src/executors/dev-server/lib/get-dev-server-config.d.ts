import { ExecutorContext } from '@nx/devkit';
import type { Configuration as WebpackConfiguration } from 'webpack';
import { WebDevServerOptions } from '../schema';
import { NormalizedWebpackExecutorOptions } from '../../webpack/schema';
export declare function getDevServerConfig(context: ExecutorContext, buildOptions: NormalizedWebpackExecutorOptions, serveOptions: WebDevServerOptions): Partial<WebpackConfiguration>;

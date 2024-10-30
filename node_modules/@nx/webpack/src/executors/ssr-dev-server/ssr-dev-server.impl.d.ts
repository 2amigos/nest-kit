import { ExecutorContext } from '@nx/devkit';
import { TargetOptions, WebSsrDevServerOptions } from './schema';
export declare function ssrDevServerExecutor(options: WebSsrDevServerOptions, context: ExecutorContext): AsyncGenerator<{
    baseUrl: string;
    success: boolean;
    options: TargetOptions;
}, void, unknown>;
export default ssrDevServerExecutor;

import { ExecutorContext } from '@nx/devkit';
import { WebDevServerOptions } from './schema';
export declare function devServerExecutor(serveOptions: WebDevServerOptions, context: ExecutorContext): AsyncGenerator<{
    baseUrl: string;
    success: boolean;
}, any, undefined>;
export default devServerExecutor;

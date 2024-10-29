import { type Compiler, type WebpackPluginInstance } from 'webpack';
import { ExecutorContext } from '@nx/devkit';
export declare class GeneratePackageJsonPlugin implements WebpackPluginInstance {
    private readonly options;
    private readonly context;
    private readonly projectGraph;
    constructor(options: {
        tsConfig: string;
        outputFileName: string;
    }, context: ExecutorContext);
    apply(compiler: Compiler): void;
}

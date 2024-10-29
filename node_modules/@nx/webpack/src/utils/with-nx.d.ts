import { NormalizedWebpackExecutorOptions } from '../executors/webpack/schema';
import { NxWebpackPlugin } from './config';
export interface WithNxOptions {
    skipTypeChecking?: boolean;
}
/**
 * @param {WithNxOptions} pluginOptions
 * @returns {NxWebpackPlugin}
 */
export declare function withNx(pluginOptions?: WithNxOptions): NxWebpackPlugin;
export declare function createLoaderFromCompiler(options: NormalizedWebpackExecutorOptions): {
    test: RegExp;
    loader: string;
    exclude: RegExp;
    options: {
        cwd: string;
        emitDecoratorMetadata: boolean;
        isModern: boolean;
        isTest: boolean;
        envName: string;
        cacheDirectory: boolean;
        cacheCompression: boolean;
    };
} | {
    test: RegExp;
    loader: string;
    exclude: RegExp;
    options: {
        jsc: {
            parser: {
                syntax: string;
                decorators: boolean;
                tsx: boolean;
            };
            transform: {
                react: {
                    runtime: string;
                };
            };
            loose: boolean;
        };
        configFile?: undefined;
        transpileOnly?: undefined;
        experimentalWatchApi?: undefined;
        getCustomTransformers?: undefined;
    };
} | {
    test: RegExp;
    loader: string;
    exclude: RegExp;
    options: {
        configFile: string;
        transpileOnly: boolean;
        experimentalWatchApi: boolean;
        getCustomTransformers: (program: any) => {
            before: any;
            after: any;
            afterDeclarations: any;
        };
        jsc?: undefined;
    };
};

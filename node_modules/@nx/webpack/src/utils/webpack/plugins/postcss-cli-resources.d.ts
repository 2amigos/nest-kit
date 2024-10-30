import { LoaderContext } from 'webpack';
export interface PostcssCliResourcesOptions {
    baseHref?: string;
    deployUrl?: string;
    resourcesOutputPath?: string;
    rebaseRootRelative?: boolean;
    filename: string;
    loader: LoaderContext<unknown>;
}
export declare function PostcssCliResources(options: PostcssCliResourcesOptions): {
    postcssPlugin: string;
    Once(root: any): Promise<void[]>;
};

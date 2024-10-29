import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import { AssetGlobPattern } from '../executors/webpack/schema';
export declare function createCopyPlugin(assets: AssetGlobPattern[]): CopyWebpackPlugin;

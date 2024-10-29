"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCopyPlugin = void 0;
const CopyWebpackPlugin = require("copy-webpack-plugin");
function createCopyPlugin(assets) {
    return new CopyWebpackPlugin({
        patterns: assets.map((asset) => {
            var _a;
            return {
                context: asset.input,
                // Now we remove starting slash to make Webpack place it from the output root.
                to: asset.output,
                from: asset.glob,
                globOptions: {
                    ignore: [
                        '.gitkeep',
                        '**/.DS_Store',
                        '**/Thumbs.db',
                        ...((_a = asset.ignore) !== null && _a !== void 0 ? _a : []),
                    ],
                    dot: true,
                },
            };
        }),
    });
}
exports.createCopyPlugin = createCopyPlugin;

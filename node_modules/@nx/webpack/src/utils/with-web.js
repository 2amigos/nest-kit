"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withWeb = void 0;
const webpack = require("webpack");
const webpack_1 = require("webpack");
const webpack_subresource_integrity_1 = require("webpack-subresource-integrity");
const path = require("path");
const path_1 = require("path");
const hash_format_1 = require("./hash-format");
const postcss_cli_resources_1 = require("./webpack/plugins/postcss-cli-resources");
const normalize_entry_1 = require("./webpack/normalize-entry");
const get_client_environment_1 = require("./get-client-environment");
const scripts_webpack_plugin_1 = require("./webpack/plugins/scripts-webpack-plugin");
const get_css_module_local_ident_1 = require("./get-css-module-local-ident");
const write_index_html_plugin_1 = require("../plugins/write-index-html-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require("autoprefixer");
const postcssImports = require("postcss-import");
const processed = new Set();
/**
 * @param {WithWebOptions} pluginOptions
 * @returns {NxWebpackPlugin}
 */
function withWeb(pluginOptions = {}) {
    return function configure(config, { options: executorOptions, context }) {
        var _a, _b, _c;
        if (processed.has(config))
            return config;
        const mergedOptions = Object.assign(Object.assign({}, executorOptions), pluginOptions);
        const plugins = [];
        const stylesOptimization = typeof mergedOptions.optimization === 'object'
            ? mergedOptions.optimization.styles
            : mergedOptions.optimization;
        if (Array.isArray(mergedOptions.scripts)) {
            plugins.push(...createScriptsPlugin(mergedOptions));
        }
        if (mergedOptions.index && mergedOptions.generateIndexHtml) {
            plugins.push(new write_index_html_plugin_1.WriteIndexHtmlPlugin({
                crossOrigin: mergedOptions.crossOrigin,
                sri: mergedOptions.subresourceIntegrity,
                outputPath: (0, path_1.basename)(mergedOptions.index),
                indexPath: (0, path_1.join)(context.root, mergedOptions.index),
                baseHref: mergedOptions.baseHref,
                deployUrl: mergedOptions.deployUrl,
                scripts: mergedOptions.scripts,
                styles: mergedOptions.styles,
            }));
        }
        if (mergedOptions.subresourceIntegrity) {
            plugins.push(new webpack_subresource_integrity_1.SubresourceIntegrityPlugin());
        }
        const minimizer = [
            new webpack_1.ids.HashedModuleIdsPlugin(),
        ];
        if (stylesOptimization) {
            minimizer.push(new CssMinimizerPlugin({
                test: /\.(?:css|scss|sass|less|styl)$/,
            }));
        }
        if (!pluginOptions.ssr) {
            plugins.push(new webpack.DefinePlugin((0, get_client_environment_1.getClientEnvironment)(process.env.NODE_ENV).stringified));
        }
        const entry = {};
        const globalStylePaths = [];
        // Determine hashing format.
        const hashFormat = (0, hash_format_1.getOutputHashFormat)(mergedOptions.outputHashing);
        const includePaths = [];
        if (((_b = (_a = mergedOptions === null || mergedOptions === void 0 ? void 0 : mergedOptions.stylePreprocessorOptions) === null || _a === void 0 ? void 0 : _a.includePaths) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            mergedOptions.stylePreprocessorOptions.includePaths.forEach((includePath) => includePaths.push(path.resolve(mergedOptions.root, includePath)));
        }
        let lessPathOptions = {};
        if (includePaths.length > 0) {
            lessPathOptions = {
                paths: includePaths,
            };
        }
        // Process global styles.
        if (mergedOptions.styles.length > 0) {
            (0, normalize_entry_1.normalizeExtraEntryPoints)(mergedOptions.styles, 'styles').forEach((style) => {
                const resolvedPath = path.resolve(mergedOptions.root, style.input);
                // Add style entry points.
                if (entry[style.bundleName]) {
                    entry[style.bundleName].push(resolvedPath);
                }
                else {
                    entry[style.bundleName] = [resolvedPath];
                }
                // Add global css paths.
                globalStylePaths.push(resolvedPath);
            });
        }
        const cssModuleRules = [
            {
                test: /\.module\.css$/,
                exclude: globalStylePaths,
                use: getCommonLoadersForCssModules(mergedOptions, includePaths),
            },
            {
                test: /\.module\.(scss|sass)$/,
                exclude: globalStylePaths,
                use: [
                    ...getCommonLoadersForCssModules(mergedOptions, includePaths),
                    {
                        loader: require.resolve('sass-loader'),
                        options: {
                            implementation: require('sass'),
                            sassOptions: {
                                fiber: false,
                                precision: 8,
                                includePaths,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.module\.less$/,
                exclude: globalStylePaths,
                use: [
                    ...getCommonLoadersForCssModules(mergedOptions, includePaths),
                    {
                        loader: require.resolve('less-loader'),
                        options: {
                            lessOptions: {
                                paths: includePaths,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.module\.styl$/,
                exclude: globalStylePaths,
                use: [
                    ...getCommonLoadersForCssModules(mergedOptions, includePaths),
                    {
                        loader: require.resolve('stylus-loader'),
                        options: {
                            stylusOptions: {
                                include: includePaths,
                            },
                        },
                    },
                ],
            },
        ];
        const globalCssRules = [
            {
                test: /\.css$/,
                exclude: globalStylePaths,
                use: getCommonLoadersForGlobalCss(mergedOptions, includePaths),
            },
            {
                test: /\.scss$|\.sass$/,
                exclude: globalStylePaths,
                use: [
                    ...getCommonLoadersForGlobalCss(mergedOptions, includePaths),
                    {
                        loader: require.resolve('sass-loader'),
                        options: {
                            implementation: require('sass'),
                            sourceMap: !!mergedOptions.sourceMap,
                            sassOptions: {
                                fiber: false,
                                // bootstrap-sass requires a minimum precision of 8
                                precision: 8,
                                includePaths,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.less$/,
                exclude: globalStylePaths,
                use: [
                    ...getCommonLoadersForGlobalCss(mergedOptions, includePaths),
                    {
                        loader: require.resolve('less-loader'),
                        options: {
                            sourceMap: !!mergedOptions.sourceMap,
                            lessOptions: Object.assign({ javascriptEnabled: true }, lessPathOptions),
                        },
                    },
                ],
            },
            {
                test: /\.styl$/,
                exclude: globalStylePaths,
                use: [
                    ...getCommonLoadersForGlobalCss(mergedOptions, includePaths),
                    {
                        loader: require.resolve('stylus-loader'),
                        options: {
                            sourceMap: !!mergedOptions.sourceMap,
                            stylusOptions: {
                                include: includePaths,
                            },
                        },
                    },
                ],
            },
        ];
        const globalStyleRules = [
            {
                test: /\.css$/,
                include: globalStylePaths,
                use: getCommonLoadersForGlobalStyle(mergedOptions, includePaths),
            },
            {
                test: /\.scss$|\.sass$/,
                include: globalStylePaths,
                use: [
                    ...getCommonLoadersForGlobalStyle(mergedOptions, includePaths),
                    {
                        loader: require.resolve('sass-loader'),
                        options: {
                            implementation: require('sass'),
                            sourceMap: !!mergedOptions.sourceMap,
                            sassOptions: {
                                fiber: false,
                                // bootstrap-sass requires a minimum precision of 8
                                precision: 8,
                                includePaths,
                            },
                        },
                    },
                ],
            },
            {
                test: /\.less$/,
                include: globalStylePaths,
                use: [
                    ...getCommonLoadersForGlobalStyle(mergedOptions, includePaths),
                    {
                        loader: require.resolve('less-loader'),
                        options: {
                            sourceMap: !!mergedOptions.sourceMap,
                            lessOptions: Object.assign({ javascriptEnabled: true }, lessPathOptions),
                        },
                    },
                ],
            },
            {
                test: /\.styl$/,
                include: globalStylePaths,
                use: [
                    ...getCommonLoadersForGlobalStyle(mergedOptions, includePaths),
                    {
                        loader: require.resolve('stylus-loader'),
                        options: {
                            sourceMap: !!mergedOptions.sourceMap,
                            stylusOptions: {
                                include: includePaths,
                            },
                        },
                    },
                ],
            },
        ];
        const rules = [
            {
                test: /\.css$|\.scss$|\.sass$|\.less$|\.styl$/,
                oneOf: [...cssModuleRules, ...globalCssRules, ...globalStyleRules],
            },
        ];
        plugins.push(
        // extract global css from js files into own css file
        new MiniCssExtractPlugin({
            filename: `[name]${hashFormat.extract}.css`,
        }));
        config.output = Object.assign(Object.assign({}, config.output), { crossOriginLoading: mergedOptions.subresourceIntegrity
                ? 'anonymous'
                : false });
        // In case users customize their webpack config with unsupported entry.
        if (typeof config.entry === 'function')
            throw new Error('Entry function is not supported. Use an object.');
        if (typeof config.entry === 'string')
            throw new Error('Entry string is not supported. Use an object.');
        if (Array.isArray(config.entry))
            throw new Error('Entry array is not supported. Use an object.');
        config.entry = Object.assign(Object.assign({}, config.entry), entry);
        config.optimization = Object.assign(Object.assign({}, config.optimization), { minimizer: [...config.optimization.minimizer, ...minimizer], emitOnErrors: false, moduleIds: 'deterministic', runtimeChunk: mergedOptions.runtimeChunk ? 'single' : false, splitChunks: {
                maxAsyncRequests: Infinity,
                cacheGroups: {
                    default: !!mergedOptions.commonChunk && {
                        chunks: 'async',
                        minChunks: 2,
                        priority: 10,
                    },
                    common: !!mergedOptions.commonChunk && {
                        name: 'common',
                        chunks: 'async',
                        minChunks: 2,
                        enforce: true,
                        priority: 5,
                    },
                    vendors: false,
                    vendor: !!mergedOptions.vendorChunk && {
                        name: 'vendor',
                        chunks: (chunk) => chunk.name === 'main',
                        enforce: true,
                        test: /[\\/]node_modules[\\/]/,
                    },
                },
            } });
        config.plugins.push(...plugins);
        config.resolve.mainFields = ['browser', 'module', 'main'];
        config.module = Object.assign(Object.assign({}, config.module), { rules: [
                ...((_c = config.module.rules) !== null && _c !== void 0 ? _c : []),
                // Images: Inline small images, and emit a separate file otherwise.
                {
                    test: /\.(avif|bmp|gif|ico|jpe?g|png|webp)$/,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 10000, // 10 kB
                        },
                    },
                    generator: {
                        filename: `[name]${hashFormat.file}[ext]`,
                    },
                },
                // SVG: same as image but we need to separate it so it can be swapped for SVGR in the React plugin.
                {
                    test: /\.svg$/,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 10000, // 10 kB
                        },
                    },
                    generator: {
                        filename: `[name]${hashFormat.file}[ext]`,
                    },
                },
                // Fonts: Emit separate file and export the URL.
                {
                    test: /\.(eot|otf|ttf|woff|woff2)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: `[name]${hashFormat.file}[ext]`,
                    },
                },
                ...rules,
            ] });
        processed.add(config);
        return config;
    };
}
exports.withWeb = withWeb;
function createScriptsPlugin(options) {
    // process global scripts
    const globalScriptsByBundleName = (0, normalize_entry_1.normalizeExtraEntryPoints)(options.scripts || [], 'scripts').reduce((prev, curr) => {
        const bundleName = curr.bundleName;
        const resolvedPath = path.resolve(options.root, curr.input);
        const existingEntry = prev.find((el) => el.bundleName === bundleName);
        if (existingEntry) {
            existingEntry.paths.push(resolvedPath);
        }
        else {
            prev.push({
                inject: curr.inject,
                bundleName,
                paths: [resolvedPath],
            });
        }
        return prev;
    }, []);
    const hashFormat = (0, hash_format_1.getOutputHashFormat)(options.outputHashing);
    const plugins = [];
    // Add a new asset for each entry.
    globalScriptsByBundleName.forEach((script) => {
        const hash = script.inject ? hashFormat.script : '';
        const bundleName = script.bundleName;
        plugins.push(new scripts_webpack_plugin_1.ScriptsWebpackPlugin({
            name: bundleName,
            sourceMap: !!options.sourceMap,
            filename: `${(0, path_1.basename)(bundleName)}${hash}.js`,
            scripts: script.paths,
            basePath: options.sourceRoot,
        }));
    });
    return plugins;
}
function getCommonLoadersForCssModules(options, includePaths) {
    // load component css as raw strings
    return [
        {
            loader: options.extractCss
                ? MiniCssExtractPlugin.loader
                : require.resolve('style-loader'),
        },
        {
            loader: require.resolve('css-loader'),
            options: {
                modules: {
                    mode: 'local',
                    getLocalIdent: get_css_module_local_ident_1.getCSSModuleLocalIdent,
                },
                importLoaders: 1,
            },
        },
        {
            loader: require.resolve('postcss-loader'),
            options: {
                implementation: require('postcss'),
                postcssOptions: postcssOptionsCreator(options, {
                    includePaths,
                    forCssModules: true,
                }),
            },
        },
    ];
}
function getCommonLoadersForGlobalCss(options, includePaths) {
    return [
        {
            loader: options.extractCss
                ? MiniCssExtractPlugin.loader
                : require.resolve('style-loader'),
        },
        { loader: require.resolve('css-loader'), options: { url: false } },
        {
            loader: require.resolve('postcss-loader'),
            options: {
                implementation: require('postcss'),
                postcssOptions: postcssOptionsCreator(options, { includePaths }),
            },
        },
    ];
}
function getCommonLoadersForGlobalStyle(options, includePaths) {
    return [
        {
            loader: MiniCssExtractPlugin.loader,
            options: { esModule: true },
        },
        { loader: require.resolve('css-loader'), options: { url: false } },
        {
            loader: require.resolve('postcss-loader'),
            options: {
                implementation: require('postcss'),
                postcssOptions: postcssOptionsCreator(options, { includePaths }),
            },
        },
    ];
}
function postcssOptionsCreator(options, { includePaths, forCssModules = false, }) {
    const hashFormat = (0, hash_format_1.getOutputHashFormat)(options.outputHashing);
    // PostCSS options depend on the webpack loader, but we need to set the `config` path as a string due to this check:
    // https://github.com/webpack-contrib/postcss-loader/blob/0d342b1/src/utils.js#L36
    const postcssOptions = (loader) => ({
        map: options.sourceMap &&
            options.sourceMap !== 'hidden' && {
            inline: true,
            annotation: false,
        },
        plugins: [
            postcssImports({
                addModulesDirectories: includePaths,
                resolve: (url) => (url.startsWith('~') ? url.slice(1) : url),
            }),
            ...(forCssModules
                ? []
                : [
                    (0, postcss_cli_resources_1.PostcssCliResources)({
                        baseHref: options.baseHref,
                        deployUrl: options.deployUrl,
                        loader,
                        filename: `[name]${hashFormat.file}.[ext]`,
                    }),
                    autoprefixer(),
                ]),
        ],
    });
    // If a path to postcssConfig is passed in, set it for app and all libs, otherwise
    // use automatic detection.
    if (typeof options.postcssConfig === 'string') {
        postcssOptions.config = path.join(options.root, options.postcssConfig);
    }
    return postcssOptions;
}

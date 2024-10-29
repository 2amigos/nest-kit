"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoaderFromCompiler = exports.withNx = void 0;
const path = require("path");
const path_1 = require("path");
const webpack_1 = require("webpack");
const tsconfig_paths_webpack_plugin_1 = require("tsconfig-paths-webpack-plugin");
const js_1 = require("@nx/js");
const license_webpack_plugin_1 = require("license-webpack-plugin");
const stats_json_plugin_1 = require("../plugins/stats-json-plugin");
const create_copy_plugin_1 = require("./create-copy-plugin");
const generate_package_json_plugin_1 = require("../plugins/generate-package-json-plugin");
const hash_format_1 = require("./hash-format");
const fs_1 = require("fs");
const TerserPlugin = require("terser-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const browserslist = require("browserslist");
const VALID_BROWSERSLIST_FILES = ['.browserslistrc', 'browserslist'];
const ES5_BROWSERS = [
    'ie 10',
    'ie 11',
    'safari 11',
    'safari 11.1',
    'safari 12',
    'safari 12.1',
    'safari 13',
    'ios_saf 13.0',
    'ios_saf 13.3',
];
function getTerserEcmaVersion(projectRoot) {
    let pathToBrowserslistFile = '';
    for (const browserslistFile of VALID_BROWSERSLIST_FILES) {
        const fullPathToFile = (0, path_1.join)(projectRoot, browserslistFile);
        if ((0, fs_1.existsSync)(fullPathToFile)) {
            pathToBrowserslistFile = fullPathToFile;
            break;
        }
    }
    if (!pathToBrowserslistFile) {
        return 2020;
    }
    const env = browserslist.loadConfig({ path: pathToBrowserslistFile });
    const browsers = browserslist(env);
    return browsers.some((b) => ES5_BROWSERS.includes(b)) ? 5 : 2020;
}
const IGNORED_WEBPACK_WARNINGS = [
    /The comment file/i,
    /could not find any license/i,
];
const extensions = ['.ts', '.tsx', '.mjs', '.js', '.jsx'];
const mainFields = ['module', 'main'];
const processed = new Set();
/**
 * @param {WithNxOptions} pluginOptions
 * @returns {NxWebpackPlugin}
 */
function withNx(pluginOptions) {
    return function configure(config, { options, context, }) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (processed.has(config))
            return config;
        const plugins = [];
        if (!(pluginOptions === null || pluginOptions === void 0 ? void 0 : pluginOptions.skipTypeChecking)) {
            plugins.push(new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: options.tsConfig,
                    memoryLimit: options.memoryLimit || 2018,
                },
            }));
        }
        const entry = {};
        if (options.main) {
            const mainEntry = options.outputFileName
                ? path.parse(options.outputFileName).name
                : 'main';
            entry[mainEntry] = [options.main];
        }
        if (options.additionalEntryPoints) {
            for (const { entryName, entryPath } of options.additionalEntryPoints) {
                entry[entryName] = entryPath;
            }
        }
        if (options.polyfills) {
            entry['polyfills'] = [
                ...(entry['polyfills'] || []),
                path.resolve(options.root, options.polyfills),
            ];
        }
        if (options.progress) {
            plugins.push(new webpack_1.ProgressPlugin({ profile: options.verbose }));
        }
        if (options.extractLicenses) {
            plugins.push(new license_webpack_plugin_1.LicenseWebpackPlugin({
                stats: {
                    warnings: false,
                    errors: false,
                },
                perChunkOutput: false,
                outputFilename: `3rdpartylicenses.txt`,
            }));
        }
        if (Array.isArray(options.assets) && options.assets.length > 0) {
            plugins.push((0, create_copy_plugin_1.createCopyPlugin)(options.assets));
        }
        if (options.generatePackageJson && context) {
            plugins.push(new generate_package_json_plugin_1.GeneratePackageJsonPlugin(options, context));
        }
        if (options.statsJson) {
            plugins.push(new stats_json_plugin_1.StatsJsonPlugin());
        }
        let externals = [];
        if (options.target === 'node' && options.externalDependencies === 'all') {
            const modulesDir = `${options.root}/node_modules`;
            externals.push(nodeExternals({ modulesDir }));
        }
        else if (Array.isArray(options.externalDependencies)) {
            externals.push(function (ctx, callback) {
                if (options.externalDependencies.includes(ctx.request)) {
                    // not bundled
                    return callback(null, `commonjs ${ctx.request}`);
                }
                // bundled
                callback();
            });
        }
        const hashFormat = (0, hash_format_1.getOutputHashFormat)(options.outputHashing);
        const filename = options.outputHashing
            ? `[name]${hashFormat.script}.js`
            : '[name].js';
        const chunkFilename = options.outputHashing
            ? `[name]${hashFormat.chunk}.js`
            : '[name].js';
        const updated = Object.assign(Object.assign({}, config), { context: context
                ? path.join(context.root, options.projectRoot)
                : undefined, target: options.target, node: false, mode: 
            // When the target is Node avoid any optimizations, such as replacing `process.env.NODE_ENV` with build time value.
            options.target === 'node'
                ? 'none'
                : // Otherwise, make sure it matches `process.env.NODE_ENV`.
                    // When mode is development or production, webpack will automatically
                    // configure DefinePlugin to replace `process.env.NODE_ENV` with the
                    // build-time value. Thus, we need to make sure it's the same value to
                    // avoid conflicts.
                    //
                    // When the NODE_ENV is something else (e.g. test), then set it to none
                    // to prevent extra behavior from webpack.
                    process.env.NODE_ENV === 'development' ||
                        process.env.NODE_ENV === 'production'
                        ? process.env.NODE_ENV
                        : 'none', devtool: options.sourceMap === 'hidden'
                ? 'hidden-source-map'
                : options.sourceMap
                    ? 'source-map'
                    : false, entry, output: Object.assign(Object.assign({}, config.output), { libraryTarget: options.target === 'node' ? 'commonjs' : undefined, path: options.outputPath, filename,
                chunkFilename, hashFunction: 'xxhash64', 
                // Disabled for performance
                pathinfo: false, 
                // Use CJS for Node since it has the widest support.
                scriptType: options.target === 'node' ? undefined : 'module' }), watch: options.watch, watchOptions: {
                poll: options.poll,
            }, profile: options.statsJson, resolve: Object.assign(Object.assign({}, config.resolve), { extensions: [...extensions, ...((_b = (_a = config === null || config === void 0 ? void 0 : config.resolve) === null || _a === void 0 ? void 0 : _a.extensions) !== null && _b !== void 0 ? _b : [])], alias: options.fileReplacements.reduce((aliases, replacement) => (Object.assign(Object.assign({}, aliases), { [replacement.replace]: replacement.with })), {}), plugins: [
                    ...((_d = (_c = config.resolve) === null || _c === void 0 ? void 0 : _c.plugins) !== null && _d !== void 0 ? _d : []),
                    new tsconfig_paths_webpack_plugin_1.TsconfigPathsPlugin({
                        configFile: options.tsConfig,
                        extensions: [...extensions, ...((_f = (_e = config === null || config === void 0 ? void 0 : config.resolve) === null || _e === void 0 ? void 0 : _e.extensions) !== null && _f !== void 0 ? _f : [])],
                        mainFields,
                    }),
                ], mainFields }), externals, optimization: Object.assign(Object.assign({}, config.optimization), { sideEffects: true, minimize: typeof options.optimization === 'object'
                    ? !!options.optimization.scripts
                    : !!options.optimization, minimizer: [
                    options.compiler !== 'swc'
                        ? new TerserPlugin({
                            parallel: true,
                            terserOptions: {
                                keep_classnames: true,
                                ecma: getTerserEcmaVersion((0, path_1.join)(options.root, options.projectRoot)),
                                safari10: true,
                                format: {
                                    ascii_only: true,
                                    comments: false,
                                    webkit: true,
                                },
                            },
                            extractComments: false,
                        })
                        : new TerserPlugin({
                            minify: TerserPlugin.swcMinify,
                            // `terserOptions` options will be passed to `swc`
                            terserOptions: {
                                mangle: false,
                            },
                        }),
                ], runtimeChunk: false, concatenateModules: true }), performance: Object.assign(Object.assign({}, config.performance), { hints: false }), experiments: Object.assign(Object.assign({}, config.experiments), { cacheUnaffected: true }), ignoreWarnings: [
                (x) => IGNORED_WEBPACK_WARNINGS.some((r) => typeof x === 'string' ? r.test(x) : r.test(x.message)),
            ], module: Object.assign(Object.assign({}, config.module), { 
                // Enabled for performance
                unsafeCache: true, rules: [
                    ...((_h = (_g = config === null || config === void 0 ? void 0 : config.module) === null || _g === void 0 ? void 0 : _g.rules) !== null && _h !== void 0 ? _h : []),
                    options.sourceMap && {
                        test: /\.js$/,
                        enforce: 'pre',
                        loader: require.resolve('source-map-loader'),
                    },
                    {
                        // There's an issue resolving paths without fully specified extensions
                        // See: https://github.com/graphql/graphql-js/issues/2721
                        // TODO(jack): Add a flag to turn this option on like Next.js does via experimental flag.
                        // See: https://github.com/vercel/next.js/pull/29880
                        test: /\.m?jsx?$/,
                        resolve: {
                            fullySpecified: false,
                        },
                    },
                    // There's an issue when using buildable libs and .js files (instead of .ts files),
                    // where the wrong type is used (commonjs vs esm) resulting in export-imports throwing errors.
                    // See: https://github.com/nrwl/nx/issues/10990
                    {
                        test: /\.js$/,
                        type: 'javascript/auto',
                    },
                    createLoaderFromCompiler(options),
                ].filter((r) => !!r) }), plugins: ((_j = config.plugins) !== null && _j !== void 0 ? _j : []).concat(plugins), stats: {
                hash: true,
                timings: false,
                cached: false,
                cachedAssets: false,
                modules: false,
                warnings: true,
                errors: true,
                colors: !options.verbose && !options.statsJson,
                chunks: !options.verbose,
                assets: !!options.verbose,
                chunkOrigins: !!options.verbose,
                chunkModules: !!options.verbose,
                children: !!options.verbose,
                reasons: !!options.verbose,
                version: !!options.verbose,
                errorDetails: !!options.verbose,
                moduleTrace: !!options.verbose,
                usedExports: !!options.verbose,
            } });
        processed.add(updated);
        return updated;
    };
}
exports.withNx = withNx;
function createLoaderFromCompiler(options) {
    var _a, _b, _c;
    switch (options.compiler) {
        case 'swc':
            return {
                test: /\.([jt])sx?$/,
                loader: require.resolve('swc-loader'),
                exclude: /node_modules/,
                options: {
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            decorators: true,
                            tsx: true,
                        },
                        transform: {
                            react: {
                                runtime: 'automatic',
                            },
                        },
                        loose: true,
                    },
                },
            };
        case 'tsc':
            const { loadTsTransformers } = require('@nx/js');
            const { compilerPluginHooks, hasPlugin } = loadTsTransformers(options.transformers);
            return {
                test: /\.([jt])sx?$/,
                loader: require.resolve(`ts-loader`),
                exclude: /node_modules/,
                options: {
                    configFile: options.tsConfig,
                    transpileOnly: !hasPlugin,
                    // https://github.com/TypeStrong/ts-loader/pull/685
                    experimentalWatchApi: true,
                    getCustomTransformers: (program) => ({
                        before: compilerPluginHooks.beforeHooks.map((hook) => hook(program)),
                        after: compilerPluginHooks.afterHooks.map((hook) => hook(program)),
                        afterDeclarations: compilerPluginHooks.afterDeclarationsHooks.map((hook) => hook(program)),
                    }),
                },
            };
        case 'babel':
            const tsConfig = (0, js_1.readTsConfig)(options.tsConfig);
            const babelConfig = {
                test: /\.([jt])sx?$/,
                loader: path.join(__dirname, './web-babel-loader'),
                exclude: /node_modules/,
                options: {
                    cwd: path.join(options.root, options.sourceRoot),
                    emitDecoratorMetadata: tsConfig.options.emitDecoratorMetadata,
                    isModern: true,
                    isTest: process.env.NX_CYPRESS_COMPONENT_TEST === 'true',
                    envName: (_a = process.env.BABEL_ENV) !== null && _a !== void 0 ? _a : process.env.NODE_ENV,
                    cacheDirectory: true,
                    cacheCompression: false,
                },
            };
            if (options.babelUpwardRootMode) {
                babelConfig.options['rootMode'] = 'upward';
                babelConfig.options['babelrc'] = true;
            }
            else {
                babelConfig.options['configFile'] =
                    (_c = (_b = babelConfig.options) === null || _b === void 0 ? void 0 : _b['babelConfig']) !== null && _c !== void 0 ? _c : path.join(options.root, options.projectRoot, '.babelrc');
            }
            return babelConfig;
        default:
            return null;
    }
}
exports.createLoaderFromCompiler = createLoaderFromCompiler;

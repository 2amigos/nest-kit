"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileTypescriptSolution = void 0;
const tslib_1 = require("tslib");
const async_iterable_1 = require("@nx/devkit/src/utils/async-iterable");
const ts = require("typescript");
const get_custom_transformers_factory_1 = require("./get-custom-transformers-factory");
const typescript_diagnostic_reporters_1 = require("./typescript-diagnostic-reporters");
// https://github.com/microsoft/TypeScript/blob/d45012c5e2ab122919ee4777a7887307c5f4a1e0/src/compiler/diagnosticMessages.json#L4050-L4053
// Typescript diagnostic message for 5083: Cannot read file '{0}'.
const TYPESCRIPT_CANNOT_READ_FILE = 5083;
// https://github.com/microsoft/TypeScript/blob/d45012c5e2ab122919ee4777a7887307c5f4a1e0/src/compiler/diagnosticMessages.json#L4211-4214
// Typescript diagnostic message for 6032: File change detected. Starting incremental compilation...
const TYPESCRIPT_FILE_CHANGE_DETECTED_STARTING_INCREMENTAL_COMPILATION = 6032;
function compileTypescriptSolution(context, watch, logger, hooks, reporters) {
    if (watch) {
        // create an AsyncIterable that doesn't complete, watch mode is only
        // stopped by killing the process
        return (0, async_iterable_1.createAsyncIterable)(({ next }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            hooks !== null && hooks !== void 0 ? hooks : (hooks = {});
            const callerAfterProjectCompilationCallback = hooks.afterProjectCompilationCallback;
            hooks.afterProjectCompilationCallback = (tsConfig, success) => {
                callerAfterProjectCompilationCallback === null || callerAfterProjectCompilationCallback === void 0 ? void 0 : callerAfterProjectCompilationCallback(tsConfig, success);
                next({ tsConfig, success });
            };
            compileTSWithWatch(context, logger, hooks, reporters);
        }));
    }
    // turn it into an AsyncIterable
    const compilationGenerator = compileTS(context, logger, hooks, reporters);
    return {
        [Symbol.asyncIterator]() {
            return {
                next() {
                    return Promise.resolve(compilationGenerator.next());
                },
            };
        },
    };
}
exports.compileTypescriptSolution = compileTypescriptSolution;
function* compileTS(context, logger, hooks, reporters) {
    var _a, _b, _c;
    let project;
    const formatDiagnosticsHost = {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getNewLine: () => ts.sys.newLine,
        getCanonicalFileName: (filename) => ts.sys.useCaseSensitiveFileNames ? filename : filename.toLowerCase(),
    };
    const solutionBuilderHost = ts.createSolutionBuilderHost(getSystem(context), 
    /*createProgram*/ undefined, (diagnostic) => {
        var _a;
        const formattedDiagnostic = (0, typescript_diagnostic_reporters_1.formatDiagnosticReport)(diagnostic, formatDiagnosticsHost);
        // handles edge case where a wrong a project reference path can't be read
        if (diagnostic.code === TYPESCRIPT_CANNOT_READ_FILE) {
            throw new Error(formattedDiagnostic);
        }
        logger.info(formattedDiagnostic, project.project);
        (_a = reporters === null || reporters === void 0 ? void 0 : reporters.diagnosticReporter) === null || _a === void 0 ? void 0 : _a.call(reporters, project.project, diagnostic);
    }, (diagnostic) => {
        var _a;
        const formattedDiagnostic = (0, typescript_diagnostic_reporters_1.formatSolutionBuilderStatusReport)(diagnostic);
        logger.info(formattedDiagnostic, project.project);
        (_a = reporters === null || reporters === void 0 ? void 0 : reporters.solutionBuilderStatusReporter) === null || _a === void 0 ? void 0 : _a.call(reporters, project.project, diagnostic);
    });
    const rootNames = Object.keys(context);
    const solutionBuilder = ts.createSolutionBuilder(solutionBuilderHost, rootNames, {});
    // eslint-disable-next-line no-constant-condition
    while (true) {
        project = solutionBuilder.getNextInvalidatedProject();
        if (!project) {
            break;
        }
        const projectContext = context[project.project];
        const projectName = projectContext === null || projectContext === void 0 ? void 0 : projectContext.project;
        /**
         * This only applies when the deprecated `prepend` option is set to `true`.
         * Skip support.
         */
        if (project.kind === ts.InvalidatedProjectKind.UpdateBundle) {
            logger.warn(`The project ${projectName} ` +
                `is using the deprecated "prepend" Typescript compiler option. ` +
                `This option is not supported by the batch executor and it's ignored.\n`, project.project);
            continue;
        }
        (_a = hooks === null || hooks === void 0 ? void 0 : hooks.beforeProjectCompilationCallback) === null || _a === void 0 ? void 0 : _a.call(hooks, project.project);
        if (project.kind === ts.InvalidatedProjectKind.UpdateOutputFileStamps) {
            logger.info(`Updating output timestamps of project "${projectName}"...\n`, project.project);
            // update output timestamps and mark project as complete
            const status = project.done();
            const success = status === ts.ExitStatus.Success;
            if (success) {
                logger.info(`Done updating output timestamps of project "${projectName}"...\n`, project.project);
            }
            (_b = hooks === null || hooks === void 0 ? void 0 : hooks.afterProjectCompilationCallback) === null || _b === void 0 ? void 0 : _b.call(hooks, project.project, success);
            yield { success, tsConfig: project.project };
            continue;
        }
        logger.info(`Compiling TypeScript files for project "${projectName}"...\n`, project.project);
        // build and mark project as complete
        const status = project.done(undefined, undefined, (0, get_custom_transformers_factory_1.getCustomTrasformersFactory)(projectContext.transformers)(project.getProgram()));
        const success = status === ts.ExitStatus.Success;
        if (success) {
            logger.info(`Done compiling TypeScript files for project "${projectName}".\n`, project.project);
        }
        (_c = hooks === null || hooks === void 0 ? void 0 : hooks.afterProjectCompilationCallback) === null || _c === void 0 ? void 0 : _c.call(hooks, project.project, success);
        yield {
            success: status === ts.ExitStatus.Success,
            tsConfig: project.project,
        };
    }
}
function compileTSWithWatch(context, logger, hooks, reporters) {
    let project;
    const solutionHost = ts.createSolutionBuilderWithWatchHost(getSystem(context), 
    /*createProgram*/ undefined);
    if (reporters === null || reporters === void 0 ? void 0 : reporters.diagnosticReporter) {
        const originalDiagnosticReporter = solutionHost.reportDiagnostic;
        solutionHost.reportDiagnostic = (diagnostic) => {
            originalDiagnosticReporter(diagnostic);
            reporters.diagnosticReporter(project.project, diagnostic);
        };
    }
    if (reporters === null || reporters === void 0 ? void 0 : reporters.solutionBuilderStatusReporter) {
        const originalSolutionBuilderStatusReporter = solutionHost.reportSolutionBuilderStatus;
        solutionHost.reportDiagnostic = (diagnostic) => {
            originalSolutionBuilderStatusReporter(diagnostic);
            reporters.solutionBuilderStatusReporter(project.project, diagnostic);
        };
    }
    const originalWatchStatusReporter = solutionHost.onWatchStatusChange;
    solutionHost.onWatchStatusChange = (diagnostic, newLine, options, errorCount) => {
        var _a;
        originalWatchStatusReporter(diagnostic, newLine, options, errorCount);
        if (diagnostic.code ===
            TYPESCRIPT_FILE_CHANGE_DETECTED_STARTING_INCREMENTAL_COMPILATION) {
            // there's a change, build invalidated projects
            build();
        }
        (_a = reporters === null || reporters === void 0 ? void 0 : reporters.watchStatusReporter) === null || _a === void 0 ? void 0 : _a.call(reporters, project === null || project === void 0 ? void 0 : project.project, diagnostic, newLine, options, errorCount);
    };
    const rootNames = Object.keys(context);
    const solutionBuilder = ts.createSolutionBuilderWithWatch(solutionHost, rootNames, {});
    const build = () => {
        var _a, _b;
        while (true) {
            project = solutionBuilder.getNextInvalidatedProject();
            if (!project) {
                break;
            }
            const projectContext = context[project.project];
            const projectName = projectContext.project;
            /**
             * This only applies when the deprecated `prepend` option is set to `true`.
             * Skip support.
             */
            if (project.kind === ts.InvalidatedProjectKind.UpdateBundle) {
                logger.warn(`The project ${projectName} ` +
                    `is using the deprecated "prepend" Typescript compiler option. ` +
                    `This option is not supported by the batch executor and it's ignored.`);
                continue;
            }
            hooks === null || hooks === void 0 ? void 0 : hooks.beforeProjectCompilationCallback(project.project);
            if (project.kind === ts.InvalidatedProjectKind.UpdateOutputFileStamps) {
                if (projectName) {
                    logger.info(`Updating output timestamps of project "${projectName}"...\n`, project.project);
                }
                // update output timestamps and mark project as complete
                const status = project.done();
                const success = status === ts.ExitStatus.Success;
                if (projectName && success) {
                    logger.info(`Done updating output timestamps of project "${projectName}"...\n`, project.project);
                }
                (_a = hooks === null || hooks === void 0 ? void 0 : hooks.afterProjectCompilationCallback) === null || _a === void 0 ? void 0 : _a.call(hooks, project.project, success);
                continue;
            }
            logger.info(`Compiling TypeScript files for project "${projectName}"...\n`, project.project);
            // build and mark project as complete
            const status = project.done(undefined, undefined, (0, get_custom_transformers_factory_1.getCustomTrasformersFactory)(projectContext.transformers)(project.getProgram()));
            const success = status === ts.ExitStatus.Success;
            if (success) {
                logger.info(`Done compiling TypeScript files for project "${projectName}".\n`, project.project);
            }
            (_b = hooks === null || hooks === void 0 ? void 0 : hooks.afterProjectCompilationCallback) === null || _b === void 0 ? void 0 : _b.call(hooks, project.project, success);
        }
    };
    // initial build
    build();
    /**
     * This is a workaround to get the TS file watching to kick off. It won't
     * build twice since the `build` call above will mark invalidated projects
     * as completed and then, the implementation of the `solutionBuilder.build`
     * skips them.
     * We can't rely solely in `solutionBuilder.build()` because it doesn't
     * accept custom transformers.
     */
    solutionBuilder.build();
}
function getSystem(context) {
    return Object.assign(Object.assign({}, ts.sys), { readFile(path, encoding) {
            if (context[path]) {
                return context[path].tsConfig.content;
            }
            return ts.sys.readFile(path, encoding);
        } });
}

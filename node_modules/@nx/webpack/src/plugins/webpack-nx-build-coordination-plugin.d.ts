import type { Compiler } from 'webpack';
export declare class WebpackNxBuildCoordinationPlugin {
    private readonly buildCmd;
    private currentlyRunning;
    constructor(buildCmd: string, skipInitialBuild?: boolean);
    apply(compiler: Compiler): void;
    startWatchingBuildableLibs(): void;
    buildChangedProjects(): Promise<void>;
}

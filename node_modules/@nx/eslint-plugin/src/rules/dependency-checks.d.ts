export type Options = [
    {
        buildTargets?: string[];
        checkMissingDependencies?: boolean;
        checkObsoleteDependencies?: boolean;
        checkVersionMismatches?: boolean;
        checkMissingPackageJson?: boolean;
        ignoredDependencies?: string[];
        includeTransitiveDependencies?: boolean;
    }
];
export type MessageIds = 'missingDependency' | 'obsoleteDependency' | 'versionMismatch' | 'missingDependencySection';
export declare const RULE_NAME = "dependency-checks";
declare const _default: import("@typescript-eslint/utils/dist/ts-eslint/Rule").RuleModule<MessageIds, Options, import("@typescript-eslint/utils/dist/ts-eslint/Rule").RuleListener>;
export default _default;

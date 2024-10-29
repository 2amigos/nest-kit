/**
 * This function is used to start a local registry for testing purposes.
 * @param localRegistryTarget the target to run to start the local registry e.g. workspace:local-registry
 * @param storage the storage location for the local registry
 * @param verbose whether to log verbose output
 */
export declare function startLocalRegistry({ localRegistryTarget, storage, verbose, }: {
    localRegistryTarget: string;
    storage?: string;
    verbose?: boolean;
}): Promise<() => void>;
export default startLocalRegistry;

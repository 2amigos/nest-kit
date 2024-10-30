import { createDirectory, directoryExists, fileExists, isRelativePath } from 'nx/src/utils/fileutils';
export { fileExists, directoryExists, isRelativePath, createDirectory };
/**
 * @deprecated This will be removed in v17.
 */
export declare function writeToFile(filePath: string, str: string): void;
/**
 * @deprecated This will be removed in v17.
 * This method is specifically for updating a JSON file using the filesystem
 *
 * @remarks
 * If you are looking to update a JSON file in a tree, look for ./ast-utils#updateJsonInTree
 * @param path Path of the JSON file on the filesystem
 * @param callback Manipulation of the JSON data
 */
export declare function updateJsonFile(path: string, callback: (a: any) => any): void;
/**
 * @deprecated This will be removed in v17.
 */
export declare function copyFile(file: string, target: string): void;
/**
 * @deprecated This will be removed in v17.
 */
export declare function renameSync(from: string, to: string, cb: (err: Error | null) => void): void;

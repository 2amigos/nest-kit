import { ExtraEntryPoint } from '../models';
export declare function generateEntryPoints(appConfig: {
    styles: ExtraEntryPoint[];
    scripts: ExtraEntryPoint[];
}): string[];

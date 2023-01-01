/// <reference types="node" />
/// <reference types="node" />
import fs from "fs";
import { EventEmitter } from "events";
export declare class MediaConvert {
    private _filePath;
    private _outputPath;
    private _convertEvent;
    /**
     * MediaConvert instance
     * @param filePath - The absolute path of the original file
     * @param outputPath - The absolute path for the intended output file
     */
    constructor(filePath: string, outputPath: string);
    /**
     * Gets the stats of the original file (err if not exists)
     */
    getOriginalStats(): Promise<fs.Stats>;
    /**
     * Gets the stats of the converted file (err if not exists)
     */
    getConvertedStats(): Promise<fs.Stats>;
    /**
     * Converts set image in path to WebP format
     * @param quality - The desired level of quality of the output. More is better but may take a longer time and higher file size. Defaults to 95.
     */
    convertWebP(quality?: number): Promise<EventEmitter>;
    /**
     * Converts set video in path to WebM format
     * @param quality - The desired level of quality of the output. Lower is better but takes a longer time and higher file size. Defaults to 28.
     */
    convertWebM(quality?: number): Promise<EventEmitter>;
    private getCompletionStats;
    get filePath(): string;
    set filePath(value: string);
    get outputPath(): string;
    set outputPath(value: string);
}
//# sourceMappingURL=MediaConvert.d.ts.map
/// <reference types="node" />
/// <reference types="node" />
import fs from "fs";
import { EventEmitter } from "events";
export declare class MediaConvert {
    private _id;
    private _filePath;
    private _outputPath;
    private readonly _convertEvent;
    /**
     * MediaConvert instance
     * @param id - An identifier. This will help with follow-back actions.
     * @param filePath - The absolute path of the original file
     * @param outputPath - The absolute path for the intended output file
     */
    constructor(id: string, filePath: string, outputPath: string);
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
    /**
     * Converts video to the desired format. This doesn't transcode video, rather it copies the video into the intended video container.
     * @param extension - the desired format extension (exclude . )
     */
    convertOriginalVideo(extension: string): Promise<unknown>;
    getVideoInfo(): Promise<any>;
    disconnect(): void;
    private getCompletionStats;
    get filePath(): string;
    set filePath(value: string);
    get outputPath(): string;
    set outputPath(value: string);
}
//# sourceMappingURL=MediaConvert.d.ts.map
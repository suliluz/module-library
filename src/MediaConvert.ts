import path from "path";
import fs from "fs";
import {ChildProcessWithoutNullStreams, spawn} from "child_process";
import {EventEmitter} from "events";

export class MediaConvert {

    private _filePath: string;
    private _outputPath: string;

    private _convertEvent: EventEmitter;
    /**
     * MediaConvert instance
     * @param filePath - The absolute path of the original file
     * @param outputPath - The absolute path for the intended output file
     */
    constructor(filePath: string, outputPath: string) {
        try {
            this._filePath = path.resolve(filePath);
            this._outputPath = path.resolve(`${outputPath}`);

            this._convertEvent = new EventEmitter();
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the stats of the original file (err if not exists)
     */
    public async getOriginalStats(): Promise<fs.Stats> {
        return new Promise((resolve, reject) => {
            fs.stat(this._filePath, (err, stats) => {
                if(err) return reject(err);

                return resolve(stats);
            })
        });
    }

    /**
     * Gets the stats of the converted file (err if not exists)
     */
    public async getConvertedStats(): Promise<fs.Stats> {
        return new Promise((resolve, reject) => {
            fs.stat(this._outputPath, (err, stats) => {
                if(err) return reject(err);

                return resolve(stats);
            })
        });
    }

    /**
     * Converts set image in path to WebP format
     * @param quality - The desired level of quality of the output. More is better but may take a longer time and higher file size. Defaults to 95.
     */
    public async convertWebP(quality: number = 95): Promise<EventEmitter> {
        this._outputPath = `${this.outputPath}.webp`;

        return new Promise((resolve, reject) => {
            try {
                let child = spawn('magick', [
                    this._filePath,
                    "-monitor",
                    "-quality", `${quality}`,
                    this._outputPath
                ]);

                child.stdout.setEncoding("utf-8");

                child.stdout.on("data", (chunk) => {
                    let output = chunk.toString();
                    this._convertEvent.emit("info", output);
                });

                child.stdout.once("close", async () => {
                    let result = await this.getCompletionStats();
                    this._convertEvent.emit("done", result);
                });

                child.stderr.setEncoding("utf-8");

                let errorMessageOutput = "";

                child.stderr.on("data", (chunk) => {
                    let output = chunk.toString();
                    errorMessageOutput += output;
                });

                child.stderr.once("close", () => {
                    this._convertEvent.emit("error", errorMessageOutput);
                });

                return resolve(this._convertEvent);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     * Converts set video in path to WebM format
     * @param quality - The desired level of quality of the output. Lower is better but takes a longer time and higher file size. Defaults to 28.
     */
    public async convertWebM(quality: number = 28): Promise<EventEmitter> {
        this._outputPath = `${this.outputPath}.webm`;

        return new Promise((resolve, reject) => {
            try {
                let instance = this;

                let child = spawn('ffmpeg', [
                    '-i',
                    this.filePath,
                    "-c:v", "libsvtav1",
                    "-b:v", "0",
                    "-c:a", "libopus",
                    "-crf", `${quality}`,
                    this._outputPath
                ]);

                // Somehow, ffmpeg returns message in stderr pipe

                child.stderr.setEncoding("utf-8");

                child.stderr.on("data", (chunk) => {
                    let output = chunk.toString();
                    this._convertEvent.emit("info", output);
                });

                child.stderr.once("close", async () => {
                    let result = await this.getCompletionStats();
                    this._convertEvent.emit("done", result);
                });

                return resolve(this._convertEvent);
            } catch (e) {
                return reject(e);
            }
        });
    }

    private async getCompletionStats() {
        try {
            let originalFileSize = (await this.getOriginalStats()).size;
            let convertedFileSize = (await this.getConvertedStats()).size;

            let ratio = (((originalFileSize - convertedFileSize) / originalFileSize) * 100).toFixed(1);

            return {originalFileSize, convertedFileSize, compressionRatio: ratio};
        } catch (e) {
            return e;
        }
    }

    get filePath(): string {
        return this._filePath;
    }

    set filePath(value: string) {
        this._filePath = value;
    }

    get outputPath(): string {
        return this._outputPath;
    }

    set outputPath(value: string) {
        this._outputPath = value;
    }
}
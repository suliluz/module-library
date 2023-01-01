"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaConvert = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const events_1 = require("events");
class MediaConvert {
    _filePath;
    _outputPath;
    _convertEvent;
    /**
     * MediaConvert instance
     * @param filePath - The absolute path of the original file
     * @param outputPath - The absolute path for the intended output file
     */
    constructor(filePath, outputPath) {
        try {
            this._filePath = path_1.default.resolve(filePath);
            this._outputPath = path_1.default.resolve(`${outputPath}`);
            this._convertEvent = new events_1.EventEmitter();
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Gets the stats of the original file (err if not exists)
     */
    async getOriginalStats() {
        return new Promise((resolve, reject) => {
            fs_1.default.stat(this._filePath, (err, stats) => {
                if (err)
                    return reject(err);
                return resolve(stats);
            });
        });
    }
    /**
     * Gets the stats of the converted file (err if not exists)
     */
    async getConvertedStats() {
        return new Promise((resolve, reject) => {
            fs_1.default.stat(this._outputPath, (err, stats) => {
                if (err)
                    return reject(err);
                return resolve(stats);
            });
        });
    }
    /**
     * Converts set image in path to WebP format
     * @param quality - The desired level of quality of the output. More is better but may take a longer time and higher file size. Defaults to 95.
     */
    async convertWebP(quality = 95) {
        this._outputPath = `${this.outputPath}.webp`;
        return new Promise((resolve, reject) => {
            try {
                let child = (0, child_process_1.spawn)('magick', [
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
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    /**
     * Converts set video in path to WebM format
     * @param quality - The desired level of quality of the output. Lower is better but takes a longer time and higher file size. Defaults to 28.
     */
    async convertWebM(quality = 28) {
        this._outputPath = `${this.outputPath}.webm`;
        return new Promise((resolve, reject) => {
            try {
                let instance = this;
                let child = (0, child_process_1.spawn)('ffmpeg', [
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
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    async getCompletionStats() {
        try {
            let originalFileSize = (await this.getOriginalStats()).size;
            let convertedFileSize = (await this.getConvertedStats()).size;
            let ratio = (((originalFileSize - convertedFileSize) / originalFileSize) * 100).toFixed(1);
            return { originalFileSize, convertedFileSize, compressionRatio: ratio };
        }
        catch (e) {
            return e;
        }
    }
    get filePath() {
        return this._filePath;
    }
    set filePath(value) {
        this._filePath = value;
    }
    get outputPath() {
        return this._outputPath;
    }
    set outputPath(value) {
        this._outputPath = value;
    }
}
exports.MediaConvert = MediaConvert;
//# sourceMappingURL=MediaConvert.js.map
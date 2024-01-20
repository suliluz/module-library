import path from "path";
import fs from "fs";
import {spawn} from "child_process";
import {EventEmitter} from "events";
import FileTypeChecker from "file-type-checker";
import {DetectedFileInfo} from "file-type-checker/dist/core";

export class MediaConvert {
    private readonly _id: string;
    private _filePath: string;
    private _outputPath: string;
    private readonly _convertEvent: EventEmitter;
    /**
     * MediaConvert instance
     * @param id - An identifier. This will help with follow-back actions.
     * @param filePath - The absolute path of the original file
     * @param outputPath - The absolute path for the intended output file
     */
    constructor(id: string, filePath: string, outputPath: string) {
        try {
            this._id = id;
            this._filePath = path.resolve(filePath);
            this._outputPath = path.resolve(`${outputPath}`);

            this._convertEvent = new EventEmitter();
        } catch (err) {
            throw err;
        }
    }

    /**
     * Gets the file info by their magic number.
     * Rejects if file type is unknown and recommended to not proceed further,
     * because why would you still want to process it anyway?
     */
    public async getFileInfo(): Promise<DetectedFileInfo> {
        return new Promise((resolve, reject) => {
            try {
                let file = fs.readFileSync(this._filePath);

                let type = FileTypeChecker.detectFile(file);

                if(type === undefined) return reject("File type is unknown.");

                return resolve(type);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /***
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

    /***
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

    /***
     * Converts set image in path to WebP format
     * @param quality - The desired level of quality of the output. More is better but may take a longer time and higher file size. Defaults to 95.
     */
    public async convertWebP(quality: number = 95): Promise<EventEmitter> {
        this._outputPath = `${this.outputPath}.webp`;

        return new Promise((resolve, reject) => {
            try {
                let child = spawn('magick', [
                    "convert",
                    this._filePath,
                    "-monitor",
                    "-quality", `${quality}`,
                    this._outputPath
                ]);

                // Imagemagick returns output in stderr pipe

                child.stderr.setEncoding("utf-8");

                child.stderr.on("data", (chunk) => {
                    // Split to get relevant items
                    let output = (chunk.toString()).split(" ");

                    if(output[0].includes("Save/Image/")) {
                        // Percentage at index 4
                        let percentage = parseFloat(output[4].replace("%", ""));

                        let result = {
                            id: this._id,
                            filePath: this._filePath,
                            outputPath: this._outputPath,
                            progress: percentage
                        }

                        this._convertEvent.emit("info", result);
                    }
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

    /***
     * Converts set video in path to WebM format
     * @param quality - The desired level of quality of the output. Lower is better but takes a longer time and higher file size. Defaults to 28.
     */
    public async convertWebM(quality: number = 28): Promise<EventEmitter> {
        this._outputPath = `${this.outputPath}.webm`;

        return new Promise(async (resolve, reject) => {
            try {
                // Get duration of original
                let originalVideoInfo = await this.getVideoInfo();

                let child = spawn('ffmpeg', [
                    '-i',
                    this.filePath,
                    "-c:v", "libsvtav1",
                    "-b:v", "0",
                    "-c:a", "libopus",
                    "-crf", `${quality}`,
                    this._outputPath
                ]);

                // ffmpeg also returns message in stderr pipe
                child.stderr.setEncoding("utf-8");

                child.stderr.on("data", (chunk) => {
                    let output = chunk.toString();

                    // Split output as array
                    let dataArray = output.split(" ");

                    // Find a string with "time="
                    let durationData = dataArray.find((data: string) => data.includes("time="));

                    // If it exists
                    if(durationData) {
                        // With duration extracted, split with ":", h:m:s.ms, calculate accordingly into seconds
                        let durationArray = durationData
                            .replace("time=", "")
                            .split(":");

                        let duration = (parseInt(durationArray[0]) * 3600) + (parseInt(durationArray[1]) * 60) + parseFloat(durationArray[2]);

                        // Percentage of completion - (duration / originalDuration) * 100
                        let percentageCompleted = ((duration / parseFloat(originalVideoInfo.duration)) * 100).toFixed(1);

                        this._convertEvent.emit("info", {
                            id: this._id,
                            filePath: this._filePath,
                            outputPath: this._outputPath,
                            progress: percentageCompleted
                        });
                    } else {
                        this._convertEvent.emit("info", {
                            id: this._id,
                            filePath: this._filePath,
                            outputPath: this._outputPath,
                            progress: "0.0"
                        });
                    }
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

    /***
     * Converts video to the desired format. This doesn't transcode video, rather it copies the video into the intended video container.
     * @param extension - the desired format extension (exclude . )
     */
    public async convertOriginalVideo(extension: string) {
        this._outputPath = `${this.outputPath}.${extension}`;

        return new Promise((resolve, reject) => {
            try {
                let child = spawn('ffmpeg', [
                    '-i',
                    this.filePath,
                    "-c", "copy",
                    this._outputPath
                ]);

                // ffmpeg also returns message in stderr pipe
                child.stderr.setEncoding("utf-8");

                // No progress needed, "data" and "info" listener is opted out

                child.stderr.once("close", async () => {
                    let result = await this.getCompletionStats();
                    this._convertEvent.emit("done", result);
                });

                return resolve(this._convertEvent);
            } catch (e) {
                return reject(e);
            }
        })
    }

    /***
     * Specific to video and gets the video info using ffprobe
     */
    public async getVideoInfo(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                let child = spawn("ffprobe", [
                    "-show_format",
                    this._filePath
                ]);

                // In this case, ffprobe returns the relevant output  in stdout pipe

                child.stdout.setEncoding("utf-8");

                let message = "";

                child.stdout.on("data", (chunk) => {
                    message += chunk.toString();
                });

                child.stdout.once("close", () => {
                    // Message contains data starting from index 1
                    let object = {};

                    // Split and get relevant data
                    let items = message.split("\n");

                    items.forEach((item) => {
                        // Take all except headers and empty string if any
                        if(!(item.includes("[FORMAT]") || item.includes("[/FORMAT]") || (item === ""))) {
                            let keyValue = item.split("=");

                            // Assign into object
                            Object.assign(object, {[`${keyValue[0]}`]: keyValue[1]});
                        }
                    });

                    return resolve(object);
                })
            } catch (e) {
                return reject(e);
            }
        });
    }

    /***
     * Disconnects the event listener. Recommended to call this after done to prevent leaks.
     */
    public disconnect() {
        this._convertEvent.removeAllListeners();
    }

    /***
     * Gets the completion stats of the conversion
     */
    private async getCompletionStats() {
        try {
            let originalFileSize = (await this.getOriginalStats()).size;
            let convertedFileSize = (await this.getConvertedStats()).size;

            let ratio = (((originalFileSize - convertedFileSize) / originalFileSize) * 100).toFixed(3);

            return {id: this._id, originalFileSize, convertedFileSize, compressionRatio: parseFloat(ratio)};
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
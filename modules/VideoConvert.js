let fs = require("fs");
let {spawn} = require("child_process");

class VideoFile {
    filePath;
    stats;

    instance;

    originalFileSize;
    webMFileSize;

    constructor(filePath) {
        try {
            this.instance = this;

            this.filePath = filePath;
            this.stats = fs.statSync(this.filePath);
            this.originalFileSize = this.stats.size;
        } catch (err) {
            throw err;
        }
    }

    getFileStats() {
        return this.stats;
    }

    async convertWebM(outputPath) {
        return new Promise((resolve, reject) => {
            try {
                let instance = this.instance;

                let child = spawn('ffmpeg', [
                    '-i',
                    this.filePath,
                    "-c:v",
                    "vp9",
                    "-c:a",
                    "libvorbis",
                    "-crf", "28",
                    "-threads", "4",
                    "-row-mt", "1",
                    `${outputPath}.webm`
                ]);

                child.once("close", function () {
                    instance.webMFileSize = fs.statSync(`${outputPath}.webm`).size;

                    let ratio = (((instance.originalFileSize - instance.webMFileSize) / instance.originalFileSize) * 100).toFixed(1);

                    return resolve({originalSize: instance.originalFileSize, compressedSize: instance.webMFileSize, compressionRatio: ratio});
                });
            } catch (e) {
                return reject(e);
            }
        });
    }
}

let video = new VideoFile("/home/sulilus/Downloads/original.mp4");

video.convertWebM("/home/sulilus/Downloads/converted").then((result) => {
    console.log(result);
}).catch((e) => {
    console.log(e);
});
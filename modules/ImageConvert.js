let fs = require("fs");
let {spawn} = require("child_process");

class ImageConvert {
    filePath;
    stats;

    instance;

    originalFileSize;
    webPFileSize;

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

    async convertWebP(outputPath) {
        return new Promise((resolve, reject) => {
            try {
                let instance = this.instance;

                let child = spawn('magick', [
                    this.filePath,
                    "-quality", "95",
                    `${outputPath}.webp`
                ]);

                child.once("close", function () {
                    instance.webPFileSize = fs.statSync(`${outputPath}.webp`).size;
                    let ratio = (((instance.originalFileSize - instance.webPFileSize) / instance.originalFileSize) * 100).toFixed(1);

                    return resolve({originalSize: instance.originalFileSize, compressedSize: instance.webPFileSize, compressionRatio: ratio});
                });
            } catch (e) {
                return reject(e);
            }
        });
    }
}

let image = new ImageConvert("/home/sulilus/Pictures/genshin-xiangling.jpg");

image.convertWebP("/home/sulilus/Downloads/genshin-xiangling").then((result) => {
    console.log(result);
}).catch((err) => {
    console.log(err);
});
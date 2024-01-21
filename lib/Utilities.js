"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jimp_1 = __importDefault(require("jimp"));
const createOverlayWatermarkedImage = async function (watermarkPath, imagePath, outputPath) {
    try {
        // Read image
        const image = await jimp_1.default.read(imagePath);
        // Read watermark
        let watermark = await jimp_1.default.read(watermarkPath);
        // Resize watermark
        watermark.resize(image.getWidth() / 2, jimp_1.default.AUTO);
        // Calculate the position to center the watermark
        const x = (image.getWidth() - watermark.getWidth()) / 2;
        const y = (image.getHeight() - watermark.getHeight()) / 2;
        // Overlay the watermark on the main image
        image.composite(watermark, x, y, {
            opacityDest: 0,
            mode: jimp_1.default.BLEND_SOURCE_OVER,
            opacitySource: 0.2 // Adjust the opacity of the watermark
        });
        // Save the final image with the watermark
        image.write(outputPath);
    }
    catch (e) {
        throw e;
    }
};
//# sourceMappingURL=Utilities.js.map
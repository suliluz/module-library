import jimp from "jimp";

const createOverlayWatermarkedImage = async function(watermarkPath: string, imagePath: string, outputPath: string): Promise<void> {
    try {
        // Read image
        const image = await jimp.read(imagePath);

        // Read watermark
        let watermark = await jimp.read(watermarkPath);

        // Resize watermark
        watermark.resize(image.getWidth() / 2, jimp.AUTO);

        // Calculate the position to center the watermark
        const x = (image.getWidth() - watermark.getWidth()) / 2;
        const y = (image.getHeight() - watermark.getHeight()) / 2;

        // Overlay the watermark on the main image
        image.composite(watermark, x, y, {
            opacityDest: 0,
            mode: jimp.BLEND_SOURCE_OVER,
            opacitySource: 0.2 // Adjust the opacity of the watermark
        });

        // Save the final image with the watermark
        image.write(outputPath);
    } catch (e) {
        throw e;
    }
}

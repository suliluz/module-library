# suliluz Toolbox

Just a bunch of modules that might help me in some code developments.

## Contains:

### MediaConvert
Converts media files to WebP or WebM format, depending on function called. 

Returns:

```
EventEmitter

Events:
info - Output from the child process
error - Error output from the child process (Not available for convertWebM function)
done - Outputs {originalFileSize, convertedFileSize, compressionRatio}
```

How to use:

1. Convert a video with CRF quality of 30
```javascript
let media = new MediaConvert("/path/to/file.mp4", "/path/to/output");

// async await method
let job = await media.convertWebM(30);

job.on("info", (output) => {
    console.log(output);
});

job.once("done", (info) => {
    console.log(info);
})

// Make sure to remove all listeners to avoid leaks
media.disconnect();
```

2. Convert an image with quality of 95%
```javascript
let media = new MediaConvert("/path/to/file.jpg", "/path/to/output");

// async await method
let job = await media.convertWebP(95);

job.on("info", (output) => {
    console.log(output);
});

job.on("error", (error) => {
    console.error(error);
});

job.once("done", (info) => {
    console.log(info);
})

// Make sure to remove all listeners to avoid leaks
media.disconnect();
```
        

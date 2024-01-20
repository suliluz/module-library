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

### AESRSACrypt (Encryption/Decryption)

A module that uses AES-256-CCM and RSA3072 combined to encrypt and decrypt data (AES-RSA).

##### Usage:

1. Create an instance of AESRSACrypt
```javascript
const crypt = new AESRSACrypt(privateKeyPath, true, (err, success) => {
    if (err) {
        console.error("Error initializing AESRSACrypt:", err.message);
    } else {
        console.log("AESRSACrypt initialized successfully!");
    }
});
```

2. Update private key if needed (optional)
```javascript
crypt.updatePrivateKey().then((success) => {
    if (success) {
        console.log("Private key updated successfully!");
    } else {
        console.error("Error updating private key.");
    }
}).catch((err) => {
    console.error("Error updating private key:", err.message);
});
```

3. Create a public key (if needed)
```javascript
crypt.createPublicKey().then((publicKey) => {
    console.log("Public key:", publicKey);
}).catch((err) => {
    console.error("Error creating public key:", err.message);
});
```

4. Encrypt data
```javascript
const dataToEncrypt = {
    username: "john_doe",
    password: "super_secure_password"
};

crypt.encrypt(dataToEncrypt).then((encryptedData: IAESRSAEncryptedObject) => {
    console.log("Encrypted Data:", encryptedData);
}).catch((err) => {
    console.error("Error encrypting data:", err.message);
});
```

5. Decrypt data
```javascript
let encryptedData = {
    "body": "c2a59d2d9e37254f5b5f7f75a1c78b12",
    "key": "79a96f13a5c7bf9d2b92a1b9a7f7aa9985d9a8094375e7dbb5ccf5d6ba6249d8e5d1c831eae816d5f5cc87e878ebf67f0b0314c79241c4c7005125c4a216c9a3e1a51061c236383c6e59a99aa4961a4e1589c0a15007a9e21cb68f20ffef5b0a28b1f4bcbdc8441ebe5f67c3a1f8d03d123f0b0a74d4f8e9292a3c0c8e14c78a6a10194ebc0d3f0e5653192b1f8436625a32c01de8e4d7877d7738ec618b18a7e370e83c82b77524e16180efaaacaccfe461e4460c7711b66a9ed8bf6194b4aa678e31bb632c62207723a1d2dbf3bb545be3aa26aef7993171875b16adbea99b740fb4c2179d76b57b33317c12f81c550bea6b8f592d1a28b65d61",
    "iv": "63991db3d0809511e1f29c05bbd13ee4"
}

crypt.decrypt(encryptedData).then((decryptedData) => {
    console.log("Decrypted Data:", decryptedData);
}).catch((err) => {
    console.error("Error decrypting data:", err.message);
});
```

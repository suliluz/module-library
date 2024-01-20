import fs from "fs";
import * as crypto from "crypto";

export interface IAESRSAEncryptedObject {
    body: string,
    key: string,
    iv: string
}
interface IAESECCrypt {
    updatePrivateKey: () => Promise<boolean>
    createPublicKey: () => Promise<string>
    encrypt: (payload: string | object) => Promise<IAESRSAEncryptedObject>
    decrypt: ({body, key, iv}: IAESRSAEncryptedObject) => Promise<string>
}

class AESRSACrypt implements IAESECCrypt {
    private readonly keyPath: string;
    private readonly create: boolean;

    /**
     * Creates a AESRSACrypt instance
     * @param keyPath - The private key absolute path. This will not load the private key into memory, but will reference when needed.
     * @param create - Synchronously creates the key if it does not exist when true. Ignores if private key exists.
     * @param callback - Optional callback to return checker results, if error occurs will throw if callback not provided.
     */
    constructor(keyPath: string, create: boolean, callback?: (err: Error | null, success: boolean) => void) {
        this.keyPath = keyPath;
        this.create = create;

        this.checker().then((result) => {
            if (callback) {
                callback(null, true);
            }
        }).catch((err) => {
            if(callback) {
                callback(err, false);
            } else {
                throw err;
            }
        });
    }

    private async checker(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // Checks if the keyPath exists
            let keyFileExists = fs.existsSync(this.keyPath);

            if(!keyFileExists) {
                if(this.create) {
                    this.createPrivateKey().then((result) => {
                        return resolve(true);
                    }).catch((err) => {
                        return reject(err);
                    })
                } else {
                    return reject(new Error(`Private key does not exist in this path: ${this.keyPath}`));
                }
            } else {
                return resolve(true);
            }
        })
    }

    private async createPrivateKey(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                // Create key pair
                const keyPair = crypto.generateKeyPairSync("rsa", {
                    modulusLength: 3072,
                    publicKeyEncoding: {
                        type: "spki",
                        format: "pem"
                    },
                    privateKeyEncoding: {
                        type: "pkcs8",
                        format: "pem",
                    }
                })

                let privateKey = keyPair.privateKey;

                fs.writeFile(this.keyPath, privateKey, "utf-8", (err) => {
                    if (err) return reject(err);

                    return resolve(true);
                });
            } catch (e) {
                return reject(e);
            }
        });
    }

    public async updatePrivateKey(): Promise<boolean> {
        try {
            await this.createPrivateKey();
            return true;
        } catch (e) {
            throw e;
        }
    }

    public async createPublicKey(): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                // Load private key from path
                let keyFile = fs.readFileSync(this.keyPath, 'utf-8');

                // Get public key
                const publicKey = crypto.createPublicKey(keyFile);

                return resolve(publicKey.export({
                    type: "spki",
                    format: "pem"
                }).toString());
            } catch (e) {
                return reject(e);
            }
        })
    }

    public async encrypt(payload: object | string): Promise<IAESRSAEncryptedObject> {
        return new Promise(async (resolve, reject) => {
            try {
                let stringPayload: string;

                if(typeof payload === "object") {
                    stringPayload = JSON.stringify(payload);
                } else {
                    stringPayload = payload;
                }

                // Step 1: AES Encryption
                const AESKey = crypto.randomBytes(32);
                const iv = crypto.randomBytes(16);

                const cipher = crypto.createCipheriv("aes-256-gcm", AESKey, iv);

                let encrypted = cipher.update(stringPayload, 'utf-8', 'hex');
                encrypted += cipher.final('hex');

                // Step 2: Encrypt AES Key with RSA Public Key
                let publicKey = crypto.createPublicKey(await this.createPublicKey());
                let encryptedPublicKey = crypto.publicEncrypt(publicKey, AESKey);

                // Step 3: Publish body, encrypted key and iv has hex
                return resolve({
                    body: encrypted,
                    key: encryptedPublicKey.toString("hex"),
                    iv: iv.toString("hex")
                })
            } catch (e) {
                return reject(e);
            }
        });
    }

    public async decrypt({body, key, iv}: IAESRSAEncryptedObject): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                // Step 1: RSA Decryption on key
                let keyFile = fs.readFileSync(this.keyPath, "utf-8");
                let privateKey = crypto.createPrivateKey(keyFile);

                let decryptedKey = crypto.privateDecrypt(privateKey, Buffer.from(key, "hex"));

                // Step 2: Use obtained AES Key to decrypt body
                let decipher = crypto.createDecipheriv("aes-256-ccm", decryptedKey, Buffer.from(iv, "hex"));

                let decrypted = decipher.update(body, "hex", "utf-8");
                decrypted += decipher.final("utf-8");

                // Step 3: Publish the string
                return resolve(decrypted);
            } catch (e) {
                return reject(e);
            }
        });
    }

}
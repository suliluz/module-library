"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const crypto = __importStar(require("crypto"));
class AESRSACrypt {
    keyPath;
    create;
    /**
     * Creates a AESRSACrypt instance
     * @param keyPath - The private key absolute path. This will not load the private key into memory, but will reference when needed.
     * @param create - Synchronously creates the key if it does not exist when true. Ignores if private key exists.
     * @param callback - Optional callback to return checker results, if error occurs will throw if callback not provided.
     */
    constructor(keyPath, create, callback) {
        this.keyPath = keyPath;
        this.create = create;
        this.checker().then((result) => {
            if (callback) {
                callback(null, true);
            }
        }).catch((err) => {
            if (callback) {
                callback(err, false);
            }
            else {
                throw err;
            }
        });
    }
    async checker() {
        return new Promise((resolve, reject) => {
            // Checks if the keyPath exists
            let keyFileExists = fs_1.default.existsSync(this.keyPath);
            if (!keyFileExists) {
                if (this.create) {
                    this.createPrivateKey().then((result) => {
                        return resolve(true);
                    }).catch((err) => {
                        return reject(err);
                    });
                }
                else {
                    return reject(new Error(`Private key does not exist in this path: ${this.keyPath}`));
                }
            }
            else {
                return resolve(true);
            }
        });
    }
    async createPrivateKey() {
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
                });
                let privateKey = keyPair.privateKey;
                fs_1.default.writeFile(this.keyPath, privateKey, "utf-8", (err) => {
                    if (err)
                        return reject(err);
                    return resolve(true);
                });
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    async updatePrivateKey() {
        try {
            await this.createPrivateKey();
            return true;
        }
        catch (e) {
            throw e;
        }
    }
    async createPublicKey() {
        return new Promise((resolve, reject) => {
            try {
                // Load private key from path
                let keyFile = fs_1.default.readFileSync(this.keyPath, 'utf-8');
                // Get public key
                const publicKey = crypto.createPublicKey(keyFile);
                return resolve(publicKey.export({
                    type: "spki",
                    format: "pem"
                }).toString());
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    async encrypt(payload) {
        return new Promise(async (resolve, reject) => {
            try {
                let stringPayload;
                if (typeof payload === "object") {
                    stringPayload = JSON.stringify(payload);
                }
                else {
                    stringPayload = payload;
                }
                // Step 1: AES Encryption
                const AESKey = crypto.randomBytes(32);
                const iv = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv("aes-256-ccm", AESKey, iv);
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
                });
            }
            catch (e) {
                return reject(e);
            }
        });
    }
    async decrypt({ body, key, iv }) {
        return new Promise((resolve, reject) => {
            try {
                // Step 1: RSA Decryption on key
                let keyFile = fs_1.default.readFileSync(this.keyPath, "utf-8");
                let privateKey = crypto.createPrivateKey(keyFile);
                let decryptedKey = crypto.privateDecrypt(privateKey, Buffer.from(key, "hex"));
                // Step 2: Use obtained AES Key to decrypt body
                let decipher = crypto.createDecipheriv("aes-256-ccm", decryptedKey, Buffer.from(iv, "hex"));
                let decrypted = decipher.update(body, "hex", "utf-8");
                decrypted += decipher.final("utf-8");
                // Step 3: Publish the string
                return resolve(decrypted);
            }
            catch (e) {
                return reject(e);
            }
        });
    }
}
//# sourceMappingURL=AESRSACrypt.js.map
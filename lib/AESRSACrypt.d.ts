export interface IAESRSAEncryptedObject {
    body: string;
    key: string;
    iv: string;
    authTag: string;
}
interface IAESECCrypt {
    updatePrivateKey: () => Promise<boolean>;
    createPublicKey: () => Promise<string>;
    encrypt: (payload: string | object) => Promise<IAESRSAEncryptedObject>;
    decrypt: ({ body, key, iv }: IAESRSAEncryptedObject) => Promise<string>;
}
export declare class AESRSACrypt implements IAESECCrypt {
    private readonly keyPath;
    private readonly create;
    /**
     * Creates a AESRSACrypt instance
     * @param keyPath - The private key absolute path. This will not load the private key into memory, but will reference when needed.
     * @param create - Synchronously creates the key if it does not exist when true. Ignores if private key exists.
     * @param callback - Optional callback to return checker results, if error occurs will throw if callback not provided.
     */
    constructor(keyPath: string, create: boolean, callback?: (err: Error | null, success: boolean) => void);
    private checker;
    private createPrivateKey;
    updatePrivateKey(): Promise<boolean>;
    createPublicKey(): Promise<string>;
    encrypt(payload: object | string): Promise<IAESRSAEncryptedObject>;
    decrypt({ body, key, iv, authTag }: IAESRSAEncryptedObject): Promise<string>;
}
export {};
//# sourceMappingURL=AESRSACrypt.d.ts.map
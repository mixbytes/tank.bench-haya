const ecc = require('eosjs-ecc');

export function privateToPublicKey(privateKey: string): Promise<string> {
    return Promise.resolve(ecc.privateToPublic(privateKey));
}

export interface Keys {
    privateKey: string,
    publicKey: string
}

export function generateRandomKeys(): Promise<Keys> {
    const keys: Keys = {privateKey: "", publicKey: ""};
    return ecc.unsafeRandomKey().then((privateKey: string) => {
        keys.privateKey = privateKey;
        return ecc.privateToPublic(privateKey);
    }).then((publicKey: string) => {
        keys.publicKey = publicKey;
        return keys;
    });
}

export function randomAccountName(): string {
    let text = "bench";
    for (let i = 0; i < 7; i++)
        text += "abcdefghijklmnopqrstuvwxyz12345".charAt(Math.floor(Math.random() * 31));
    return text;
}

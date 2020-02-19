export default {
    rpcUrls: {
        arg: 'eos.rpcUrl',
        format: Array,
        default: [],
        doc: "RPC urls, must be multiple of commonConfig.threadsAmount"
    },
    tokensContract: {
        wasmFilePath: {
            arg: 'eos.tokenContract.wasmFilePath',
            format: String,
            default: "",
            doc: 'path to the "wasm" file of the token contract. May be null, then standard precompiled contract will be used.'
        },
        abiFilePath: {
            arg: 'eos.tokenContract.abiFilePath',
            format: String,
            default: "",
            doc: 'path to the "abi" file of the token contract. May be null, then standard precompiled contract will be used.'
        }
    },
    blocksBehind: {
        arg: 'eos.transactions.blocksBehind',
        format: "int",
        default: -1,
        doc: "blocksBehind blockchain value"
    },
    expireSeconds: {
        arg: 'eos.transactions.expireSeconds',
        format: "int",
        default: -1,
        doc: "expireSeconds blockchain value"
    },
    transactions: {
        tokenName: {
            arg: 'transactions.tokenName',
            format: String,
            default: "",
            doc: "the name of token to use in transactions"
        },

        deployTokenContract: {
            arg: 'transactions.deployTokenContract',
            format: Boolean,
            default: true,
            doc: "whether to deploy token contract or not"
        },
        createTokens: {
            arg: 'transactions.createTokens',
            format: Boolean,
            default: true,
            doc: "whether to create tokens on token account or not"
        },
        issueTokens: {
            arg: 'transactions.issueTokens',
            format: Boolean,
            default: true,
            doc: "whether to issue tokens from token account to FROM or not"
        },

        createTokensAmount: {
            arg: 'transactions.createTokensAmount',
            format: String,
            default: "1000000.0000",
            doc: "amount of tokens to create (only if createTokens == true)"
        },
        issueTokensAmount: {
            arg: 'transactions.issueTokensAmount',
            format: String,
            default: "1000000.0000",
            doc: "amount of tokens to issue (only if issueTokens == true)"
        },

        tokensInOneTransfer: {
            arg: 'transactions.tokensInOneTransfer',
            format: String,
            default: "0.0001",
            doc: "amount of tokens in one transfer"
        },
        keyPoints: {
            arg: 'transactions.keyPoints',
            format: "int",
            default: 10,
            doc: "amount of transfer transactions to test"
        },
        keyPointsAmount: {
            arg: 'transactions.keyPointsAmount',
            format: "int",
            default: 1000,
            doc: "amount of transfer transactions to test"
        },

        threadsAmount: {
            arg: 'transactions.threadsAmount',
            format: "int",
            default: 8,
            doc: "amount of threads to perform transfer transactions"
        },
        stopOnError: {
            arg: 'transactions.stopOnError',
            format: ["stop", "print", "no"],
            default: "print",
            doc: "weather to stop benchmark on blockchain errors or not. Available values - (\"block\", \"fetch\", \"no\")"
        },
        highloadWritesCount: {
            arg: 'transactions.highloadWritesCount',
            format: "int",
            default: 100,
            doc: "count of writes in one method call during storage highload test"
        }
    },
    creatorAccount: {
        name: {
            arg: 'creatorAccount.name',
            format: String,
            default: "",
            doc: "the name of account"
        },
        privateKey: {
            arg: 'creatorAccount.privateKey',
            format: String,
            default: "",
            doc: "the privateKey of account"
        },
    },

    toAccount: {
        create: {
            arg: 'toAccount.create',
            format: Boolean,
            default: true,
            doc: "whether to auto create account or not"
        },
        name: {
            arg: 'toAccount.name',
            format: String,
            default: "",
            doc: "the name of account. May be null, then will be generated"
        },
    },

    fromAccount: {
        create: {
            arg: 'fromAccount.create',
            format: Boolean,
            default: true,
            doc: "whether to auto create account or not"
        },
        name: {
            arg: 'fromAccount.name',
            format: String,
            default: "",
            doc: "the name of account. May be null, then will be generated"
        },
        privateKey: {
            arg: 'fromAccount.privateKey',
            format: String,
            default: "",
            doc: "the privateKey of account. May be null, then will be generated"
        },
    },

    tokenAccount: {
        create: {
            arg: 'tokenAccount.create',
            format: Boolean,
            default: true,
            doc: "whether to auto create account or not"
        },
        name: {
            arg: 'tokenAccount.name',
            format: String,
            default: "",
            doc: "the name of account. May be null, then will be generated"
        },
        privateKey: {
            arg: 'tokenAccount.privateKey',
            format: String,
            default: "",
            doc: "the privateKey of account. May be null, then will be generated"
        },
    },
};


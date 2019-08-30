import {Api, JsonRpc} from "eosjs";
import * as encoding from "text-encoding";
import {BenchProfile} from "tank.bench-common";
import * as ser from "eosjs/dist/eosjs-serialize";
import {SignatureProvider, SignatureProviderArgs} from "eosjs/dist/eosjs-api-interfaces";
import NodeEosjsSignatureProvider from "node-eosjs-signature-provider";

const fetch = require("node-fetch");

export default class StorageHighloadBenchProfile extends BenchProfile {

    private rpc?: JsonRpc;
    private api?: Api;
    private transactionsConf?: { blocksBehind: any; expireSeconds: any };
    private transactionDummy: any;
    private signatureProvider?: SignatureProvider;

    async asyncConstruct(threadId: number) {

        if (!this.benchConfig.transactions.highloadWritesCount) {
            throw new Error("You need to specify transactions.highloadWritesCount in config to run storage" +
                "highload test");
        }

        this.rpc = new JsonRpc(
            this.benchConfig.rpcUrls[Math.floor(threadId / this.benchConfig.urlsPerThread)],
            {fetch}
        );

        this.signatureProvider = new NodeEosjsSignatureProvider(
            this.getKeyAccounts()
                .filter(account => account.privateKey)
                .map(account => account.privateKey)
        );

        this.api = new Api({
            rpc: this.rpc!,
            signatureProvider: this.signatureProvider!,
            textDecoder: new encoding.TextDecoder(),
            textEncoder: new encoding.TextEncoder(),
        });

        this.api.chainId = this.benchConfig.chainId;

        this.transactionsConf = {
            blocksBehind: this.benchConfig.blocksBehind,
            expireSeconds: this.benchConfig.expireSeconds,
        };

        this.transactionDummy = {
            ref_block_num: this.benchConfig.refBlock.block_num & 0xffff,
            ref_block_prefix: this.benchConfig.refBlock.ref_block_prefix,
        };
    }

    async commitTransaction(uniqueData: string) {
        let api = this.api!;
        let exp = (new Date().getTime() + this.benchConfig.expireSeconds * 1000) * 1000;
        let transaction = {
            expiration: ser.timePointToDate(exp),
            ...this.transactionDummy,
            actions: await api.serializeActions(this.getActions(uniqueData))
        };
        let serializedTransaction = api.serializeTransaction(transaction);

        let signArgs: SignatureProviderArgs = {
            requiredKeys: [this.benchConfig.fromAccount.publicKey],
            abis: this.benchConfig.abis,
            chainId: api.chainId,
            serializedTransaction: serializedTransaction
        };

        let pushTransactionArgs = await this.signatureProvider!.sign(signArgs);

        try {
            await this.rpc!.push_transaction(pushTransactionArgs);
            return {code: 200, error: null}

        } catch (e) {
            try {
                return {code: e.json.code, error: e}
            } catch (e2) {
                return {code: -1, error: e}
            }
        }
    }

    private getKeyAccounts() {
        return [this.benchConfig.fromAccount];
    }

    private getActions(uniqueData: string) {
        return [
            {
                "account": this.benchConfig.fromAccount.name,
                "name": "unique",
                "data": {
                    "size": this.benchConfig.transactions.highloadWritesCount,
                    "unique": uniqueData
                },
                "authorization": [
                    {
                        "actor": this.benchConfig.fromAccount.name,
                        "permission": "active"
                    }
                ]
            }
        ]
    }
}


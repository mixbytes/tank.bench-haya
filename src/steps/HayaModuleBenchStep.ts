import {Api, JsonRpc} from "eosjs";
import * as encoding from "text-encoding";
import {BenchStep} from "tank.bench-common";
import NodeEosjsSignatureProvider from "node-eosjs-signature-provider";

const fetch = require("node-fetch");

export default class HayaModuleBenchStep extends BenchStep {
    private rpc?: JsonRpc;
    private api?: Api;
    private transactionsConf?: { blocksBehind: any; expireSeconds: any };

    async asyncConstruct() {
        this.rpc = new JsonRpc(this.benchConfig.rpcUrl, {fetch});

        const signatureProvider = new NodeEosjsSignatureProvider(
            this.getKeyAccounts()
                .filter(account => account.privateKey)
                .map(account => account.privateKey)
        );

        this.api = new Api({
            rpc: this.rpc!,
            signatureProvider: signatureProvider,
            textDecoder: new encoding.TextDecoder(),
            textEncoder: new encoding.TextEncoder(),
        });

        this.transactionsConf = {
            blocksBehind: this.benchConfig.blocksBehind,
            expireSeconds: this.benchConfig.expireSeconds,
        };
    }

    getKeyAccounts() {
        return [this.benchConfig.fromAccount];
    }

    async commitBenchmarkTransaction(uniqueData: any) {
        return this.api!.transact({
            actions: [
                {
                    account: this.benchConfig.tokenAccount.name,
                    name: 'transfer',
                    authorization: [{
                        actor: this.benchConfig.fromAccount.name,
                        permission: 'active',
                    }],
                    data: {
                        from: this.benchConfig.fromAccount.name,
                        to: this.benchConfig.toAccount.name,
                        quantity: `${this.benchConfig.transactions.tokensInOneTransfer} ${this.benchConfig.transactions.tokenName}`,
                        memo: uniqueData
                    }
                }
            ]
        }, this.transactionsConf)
    }
}


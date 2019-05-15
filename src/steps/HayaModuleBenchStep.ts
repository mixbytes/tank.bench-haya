import {Api, JsonRpc} from "eosjs";
import * as encoding from "text-encoding";
import NodeEosSignatureProvider from "node-eosjs-signature-provider"
import BenchStep from "tank.bench-common/dist/module/steps/BenchStep";

const fetch = require("node-fetch");

export default class HayaModuleBenchStep extends BenchStep {
    private rpc?: JsonRpc;
    private api?: Api;
    private transactionsConf?: { blocksBehind: any; expireSeconds: any };

    async asyncConstruct() {
        this.rpc = new JsonRpc(this.config.eos.rpcUrl, {fetch});

        const signatureProvider = new NodeEosSignatureProvider(
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
            blocksBehind: this.config.eos.blocksBehind,
            expireSeconds: this.config.eos.expireSeconds,
        };
    }

    getKeyAccounts() {
        return [this.config.eos.fromAccount];
    }

    async commitBenchmarkTransaction(uniqueData: any) {
        return this.api!.transact({
            actions: [
                {
                    account: this.config.eos.tokenAccount.name,
                    name: 'transfer',
                    authorization: [{
                        actor: this.config.eos.fromAccount.name,
                        permission: 'active',
                    }],
                    data: {
                        from: this.config.eos.fromAccount.name,
                        to: this.config.eos.toAccount.name,
                        quantity: `${this.config.eos.transactions.tokensInOneTransfer} ${this.config.eos.transactions.tokenName}`,
                        memo: uniqueData
                    }
                }
            ]
        }, this.transactionsConf)
    }
}


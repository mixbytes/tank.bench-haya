import {Api, JsonRpc} from "eosjs";
import * as encoding from "text-encoding";
import {BenchStep} from "tank.bench-common";
import NodeEosjsSignatureProvider from "node-eosjs-signature-provider";
import {timePointSecToDate} from "eosjs/dist/eosjs-serialize";
import {SignatureProviderArgs} from "eosjs/dist/eosjs-api-interfaces";

const fetch = require("node-fetch");

export default class HayaModuleBenchStep extends BenchStep {
    private rpc?: JsonRpc;
    private api?: Api;
    private transactionsConf?: { blocksBehind: any; expireSeconds: any };
    private transactionDummy: any;

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

    async commitBenchmarkTransaction(uniqueData: any) {
        let api = this.api!;
        let transaction = {
            expiration: timePointSecToDate(Date.now() + this.benchConfig.expireSeconds),
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

        let pushTransactionArgs = await api.signatureProvider.sign(signArgs);

        return api.pushSignedTransaction(pushTransactionArgs);
    }

    private getKeyAccounts() {
        return [this.benchConfig.fromAccount];
    }

    private getActions(uniqueData: any) {
        return [
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
    }

    // return this.api!.transact({
    //                               actions: [
    //                                   {
    //                                       account: this.moduleConfig.tokenAccount.name,
    //                                       name: 'transfer',
    //                                       authorization: [{
    //                                           actor: this.moduleConfig.fromAccount.name,
    //                                           permission: 'active',
    //                                       }],
    //                                       data: {
    //                                           from: this.moduleConfig.fromAccount.name,
    //                                           to: this.moduleConfig.toAccount.name,
    //                                           quantity: `${this.moduleConfig.transactions.tokensInOneTransfer} ${this.moduleConfig.transactions.tokenName}`,
    //                                   memo: uniqueData
    //                                   }
    //                                   }
    //                               ]
    //                           }, this.transactionsConf)
}


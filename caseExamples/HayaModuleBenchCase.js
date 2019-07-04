const ser = require("eosjs").Serialize;
const encoding = require("text-encoding");
const {BenchCase} = require("tank.bench-common");
const NodeEosjsSignatureProvider = require("node-eosjs-signature-provider").default;
const fetch = require("node-fetch");
const {Api, JsonRpc} = require("eosjs");

class HayaModuleBenchCase extends BenchCase {
    async asyncConstruct(threadId) {
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
            rpc: this.rpc,
            signatureProvider: this.signatureProvider,
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


    getKeyAccounts() {
        return [this.benchConfig.fromAccount];
    }

    getActions(uniqueData) {
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

    async commitTransaction(uniqueData) {
        let api = this.api;
        let exp = (new Date().getTime() + this.benchConfig.expireSeconds * 1000) * 1000;
        let transaction = {
            expiration: ser.timePointToDate(exp),
            ...this.transactionDummy,
            actions: await api.serializeActions(this.getActions(uniqueData))
        };
        let serializedTransaction = api.serializeTransaction(transaction);

        let signArgs = {
            requiredKeys: [this.benchConfig.fromAccount.publicKey],
            abis: this.benchConfig.abis,
            chainId: api.chainId,
            serializedTransaction: serializedTransaction
        };

        let pushTransactionArgs = await this.signatureProvider.sign(signArgs);

        try {
            await this.rpc.push_transaction(pushTransactionArgs);
            return {code: 200, error: null}
        } catch (e) {
            try {
                return {code: e.json.code, error: e}
            } catch (e2) {
                return {code: -1, error: e}
            }
        }
    }
}

module.exports = HayaModuleBenchCase;

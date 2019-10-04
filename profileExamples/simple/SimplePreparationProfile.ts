import {Api, JsonRpc} from "eosjs";
import * as encoding from 'text-encoding';
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import HayaPrepareTool from "../../src/tools/HayaPrepareTool";
import Strings from "../../src/constants/Strings";
import HayaAccountsPrepareTool from "../../src/tools/HayaAccountsPrepareTool";
import {PreparationProfile} from "tank.bench-common";

const fetch = require("node-fetch");

export default class SimplePreparationProfile extends PreparationProfile {
    private rpc?: JsonRpc;
    private transactionsConf?: { blocksBehind: any; expireSeconds: any };
    private api?: Api;

    async asyncConstruct() {
        this.rpc = new JsonRpc(this.moduleConfig.rpcUrls[0], {fetch});
        this.transactionsConf = {
            blocksBehind: this.moduleConfig.blocksBehind,
            expireSeconds: this.moduleConfig.expireSeconds,
        };
        await this.prepareApi();
    }

    getKeyAccounts() {
        return [this.moduleConfig.creatorAccount, this.moduleConfig.tokenAccount];
    }

    async prepare() {
        this.checkConfig();
        let totalActions = 0;
        let contractsPrepareTool = new HayaPrepareTool(this.moduleConfig, this.logger, this.api!);
        return await new HayaAccountsPrepareTool(this.moduleConfig, this.logger)
            .prepare()
            .then((actionsAndConfig: { moduleConfig: any; actions: any; }) => {
                this.moduleConfig = actionsAndConfig.moduleConfig;
                totalActions += actionsAndConfig.actions.length;
                return this.transact(actionsAndConfig.actions);
            })
            .then(() => this.prepareApi())
            .then(() => contractsPrepareTool.deployTokenContractIfNeeded())
            .then((actions: any) => {
                totalActions += actions.length;
                return this.transact(actions);
            })
            .then(() => contractsPrepareTool.createTokensIfNeeded())
            .then((actions: any) => {
                totalActions += actions.length;
                return this.transact(actions);
            })
            .then(() => contractsPrepareTool.issueTokensIfNeeded())
            .then((actions: any) => {
                totalActions += actions.length;
                return this.transact(actions);
            })
            .then(() => {
                if (totalActions !== 0) {
                    this.logger.log(Strings.log.benchmarkPreparedWithTransaction());
                } else {
                    this.logger.log(Strings.log.benchmarkPreparedNoTransaction());
                }
                return this.rpc!.get_info();
            })
            .then(async infoResult => {
                this.moduleConfig.chainId = infoResult.chain_id;
                return this.rpc!.get_block(infoResult.head_block_num - this.moduleConfig.blocksBehind);
            })
            .then(block => {
                this.moduleConfig.refBlock = block;
                this.moduleConfig.abis = [{
                    accountName: this.moduleConfig.creatorAccount.name,
                    abi: contractsPrepareTool.getAbi(),
                }];
                this.moduleConfig.urlsPerThread = this.commonConfig.threadsAmount / this.moduleConfig.rpcUrls.length;
                return this.moduleConfig;
            });
    }

    private checkConfig() {
        if (this.commonConfig.threadsAmount % this.moduleConfig.rpcUrls.length !== 0)
            throw new Error("rpcUrls amount must be multiple of commonConfig.threadsAmount");
    }

    async prepareApi() {
        const signatureProvider = new JsSignatureProvider(
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
    }

    transact(actions: any[]): Promise<any> {
        return Promise.all(actions.map(action => {
            return this.api!.transact({actions: [action]}, this.transactionsConf)
        }));
    }
}

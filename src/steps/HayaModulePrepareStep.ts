import {Api, JsonRpc} from "eosjs";
import * as encoding from 'text-encoding';
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import HayaPrepareTool from "../tools/HayaPrepareTool";
import Strings from "../constants/Strings";
import HayaAccountsPrepareTool from "../tools/HayaAccountsPrepareTool";
import {PrepareStep} from "tank.bench-common";

const fetch = require("node-fetch");

export default class HayaModulePrepareStep extends PrepareStep {
    private rpc?: JsonRpc;
    private transactionsConf?: { blocksBehind: any; expireSeconds: any };
    private api?: Api;

    async asyncConstruct() {
        this.rpc = new JsonRpc(this.moduleConfig.rpcUrl, {fetch});
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
            .then(() => contractsPrepareTool.deployContracts())
            .then((actionsAndConfig: { config: any; actions: any; }) => {
                this.moduleConfig = actionsAndConfig.config;
                totalActions += actionsAndConfig.actions.length;
                return this.transact(actionsAndConfig.actions);
            })
            .then(() => contractsPrepareTool.prepareTokens())
            .then((actionsAndConfig: { config: any; actions: any; }) => {
                this.moduleConfig = actionsAndConfig.config;
                totalActions += actionsAndConfig.actions.length;
                return this.transact(actionsAndConfig.actions);
            })
            .then(() => {
                if (totalActions !== 0) {
                    this.logger.log(Strings.log.benchmarkPreparedWithTransaction());
                } else {
                    this.logger.log(Strings.log.benchmarkPreparedNoTransaction());
                }
                return this.moduleConfig;
            });
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
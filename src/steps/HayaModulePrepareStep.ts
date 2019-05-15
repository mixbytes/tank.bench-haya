import {Api, JsonRpc} from "eosjs";
import * as encoding from 'text-encoding';
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import HayaPrepareTool from "../tools/HayaPrepareTool";
import PrepareStep from "tank.bench-common/dist/module/steps/PrepareStep";
import Strings from "../constants/Strings";
import HayaAccountsPrepareTool from "../tools/HayaAccountsPrepareTool";

const fetch = require("node-fetch");

export default class HayaModulePrepareStep extends PrepareStep {
    private rpc?: JsonRpc;
    private transactionsConf?: { blocksBehind: any; expireSeconds: any };
    private api?: Api;

    async asyncConstruct() {
        this.rpc = new JsonRpc(this.config.eos.rpcUrl, {fetch});
        this.transactionsConf = {
            blocksBehind: this.config.eos.blocksBehind,
            expireSeconds: this.config.eos.expireSeconds,
        };
        await this.prepareApi();
    }

    getKeyAccounts() {
        return [this.config.eos.creatorAccount, this.config.eos.tokenAccount];
    }

    async prepare() {
        let totalActions = 0;
        let contractsPrepareTool = new HayaPrepareTool(this.config, this.logger, this.api!);
        return await new HayaAccountsPrepareTool(this.config, this.logger)
            .prepare()
            .then((actionsAndConfig: { config: any; actions: any; }) => {
                this.config = actionsAndConfig.config;
                totalActions += actionsAndConfig.actions.length;
                return this.transact(actionsAndConfig.actions);
            })
            .then(() => this.prepareApi())
            .then(() => contractsPrepareTool.deployContracts())
            .then((actionsAndConfig: { config: any; actions: any; }) => {
                this.config = actionsAndConfig.config;
                totalActions += actionsAndConfig.actions.length;
                return this.transact(actionsAndConfig.actions);
            })
            .then(() => contractsPrepareTool.prepareTokens())
            .then((actionsAndConfig: { config: any; actions: any; }) => {
                this.config = actionsAndConfig.config;
                totalActions += actionsAndConfig.actions.length;
                return this.transact(actionsAndConfig.actions);
            })
            .then(() => {
                if (totalActions !== 0) {
                    this.logger.log(Strings.log.benchmarkPreparedWithTransaction());
                } else {
                    this.logger.log(Strings.log.benchmarkPreparedNoTransaction());
                }
                return this.config;
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

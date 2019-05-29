import * as fs from "fs";
import {Serialize} from "eosjs";
import {Api} from "eosjs/dist";
import Strings from "../constants/Strings";
import {Logger} from "tank.bench-common";

export default class HayaPrepareTool {
    private readonly moduleConfig: any;
    private readonly api: Api;
    private readonly logger: Logger;

    constructor(moduleConfig: any, logger: Logger, api: Api) {
        this.moduleConfig = moduleConfig;
        this.api = api;
        this.logger = logger;
    }

    deployContracts(): Promise<any> {
        let allActions: any[] = [];
        let pushActions = (actions: any[]) => {
            allActions = allActions.concat(actions);
        };

        return this.deployTokenContractIfNeeded()
            .then(actions => {
                pushActions(actions);
                return {
                    actions: allActions,
                    config: this.moduleConfig
                }
            })
    }

    prepareTokens(): Promise<any> {
        let allActions: any[] = [];
        let pushActions = (actions: any[]) => {
            allActions = allActions.concat(actions);
        };

        return this.createTokensIfNeeded()
            .then(actions => {
                pushActions(actions);
                return this.issueTokensIfNeeded();
            })
            .then(actions => {
                pushActions(actions);
                return {
                    actions: allActions,
                    config: this.moduleConfig
                }
            })
    }

    private deployTokenContractIfNeeded() {
        if (this.moduleConfig.transactions.deployTokenContract) {
            this.logger.log(Strings.log.deployingTokenContract());
            return this.deployTokensContract();
        }

        this.logger.log(Strings.log.deployingTokenContractNotNeeded());
        return Promise.resolve([]);
    }

    private createTokensIfNeeded() {
        if (this.moduleConfig.transactions.createTokens) {
            let quantity = `${this.moduleConfig.transactions.createTokensAmount} ${this.moduleConfig.transactions.tokenName}`;
            this.logger.log(Strings.log.creatingTokens(quantity));

            return this.createTokens();
        }

        this.logger.log(Strings.log.creatingTokensNotNeeded());
        return Promise.resolve([]);
    }

    private issueTokensIfNeeded() {
        if (this.moduleConfig.transactions.issueTokens) {
            let quantity = `${this.moduleConfig.transactions.issueTokensAmount} ${this.moduleConfig.transactions.tokenName}`;
            this.logger.log(Strings.log.issuingTokens(quantity));

            return this.issueTokens();
        }

        this.logger.log(Strings.log.issuingTokensNotNeeded());
        return Promise.resolve([]);
    }

    private deployTokensContract(): Promise<any> {
        return new Promise((resolve) => {
            let wasm = fs.readFileSync(this.moduleConfig.tokensContract.wasmFilePath);
            let abiJson = fs.readFileSync(this.moduleConfig.tokensContract.abiFilePath);
            let abi = JSON.parse(abiJson.toString());

            let buffer = new Serialize.SerialBuffer({
                textEncoder: this.api.textEncoder,
                textDecoder: this.api.textDecoder,
            });

            let abiDefinition = this.api.abiTypes.get('abi_def');
            if (!abiDefinition) {
                resolve([]);
                return;
            }
            let abiToSerialize = abiDefinition.fields.reduce(
                (acc, {name: fieldName}) => Object.assign(acc, {[fieldName]: acc[fieldName] || []}),
                abi,
            );
            abiDefinition.serialize(buffer, abiToSerialize);
            let abiToSend = Buffer.from(buffer.asUint8Array()).toString(`hex`);

            resolve([
                {
                    account: this.moduleConfig.creatorAccount.name,
                    name: 'setcode',
                    authorization: [{
                        actor: this.moduleConfig.tokenAccount.name,
                        permission: 'active',
                    }],
                    data: {
                        account: this.moduleConfig.tokenAccount.name,
                        vmtype: 0,
                        vmversion: 0,
                        code: wasm
                    }
                },
                {
                    account: this.moduleConfig.creatorAccount.name,
                    name: 'setabi',
                    authorization: [{
                        actor: this.moduleConfig.tokenAccount.name,
                        permission: 'active',
                    }],
                    data: {
                        account: this.moduleConfig.tokenAccount.name,
                        abi: abiToSend
                    }
                }
            ])
        });
    }

    private issueTokens() {
        return Promise.resolve([{
            account: this.moduleConfig.tokenAccount.name,
            name: 'issue',
            authorization: [{
                actor: this.moduleConfig.tokenAccount.name,
                permission: 'active',
            }],
            data: {
                to: this.moduleConfig.fromAccount.name,
                quantity: `${this.moduleConfig.transactions.issueTokensAmount} ${this.moduleConfig.transactions.tokenName}`,
                memo: ""
            }
        }]);
    }

    private createTokens() {
        return Promise.resolve([{
            account: this.moduleConfig.tokenAccount.name,
            name: 'create',
            authorization: [{
                actor: this.moduleConfig.tokenAccount.name,
                permission: 'active',
            }],
            data: {
                issuer: this.moduleConfig.tokenAccount.name,
                maximum_supply: `${this.moduleConfig.transactions.issueTokensAmount} ${this.moduleConfig.transactions.tokenName}`
            }
        }]);
    }

}

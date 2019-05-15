import * as fs from "fs";
import {Serialize} from "eosjs";
import Logger from "tank.bench-common/dist/resources/Logger";
import {Api} from "eosjs/dist";
import Strings from "../constants/Strings";

export default class HayaPrepareTool {
    private readonly config: any;
    private readonly api: Api;
    private readonly logger: Logger;

    constructor(config: any, logger: Logger, api: Api) {
        this.config = config;
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
                    config: this.config
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
                    config: this.config
                }
            })
    }

    private deployTokenContractIfNeeded() {
        if (this.config.eos.transactions.deployTokenContract) {
            this.logger.log(Strings.log.deployingTokenContract());
            return this.deployTokensContract();
        }

        this.logger.log(Strings.log.deployingTokenContractNotNeeded());
        return Promise.resolve([]);
    }

    private createTokensIfNeeded() {
        if (this.config.eos.transactions.createTokens) {
            let quantity = `${this.config.eos.transactions.createTokensAmount} ${this.config.eos.transactions.tokenName}`;
            this.logger.log(Strings.log.creatingTokens(quantity));

            return this.createTokens();
        }

        this.logger.log(Strings.log.creatingTokensNotNeeded());
        return Promise.resolve([]);
    }

    private issueTokensIfNeeded() {
        if (this.config.eos.transactions.issueTokens) {
            let quantity = `${this.config.eos.transactions.issueTokensAmount} ${this.config.eos.transactions.tokenName}`;
            this.logger.log(Strings.log.issuingTokens(quantity));

            return this.issueTokens();
        }

        this.logger.log(Strings.log.issuingTokensNotNeeded());
        return Promise.resolve([]);
    }

    private deployTokensContract(): Promise<any> {
        return new Promise((resolve) => {
            let wasm = fs.readFileSync(this.config.eos.tokensContract.wasmFilePath);
            let abiJson = fs.readFileSync(this.config.eos.tokensContract.abiFilePath);
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
                    account: this.config.eos.creatorAccount.name,
                    name: 'setcode',
                    authorization: [{
                        actor: this.config.eos.tokenAccount.name,
                        permission: 'active',
                    }],
                    data: {
                        account: this.config.eos.tokenAccount.name,
                        vmtype: 0,
                        vmversion: 0,
                        code: wasm
                    }
                },
                {
                    account: this.config.eos.creatorAccount.name,
                    name: 'setabi',
                    authorization: [{
                        actor: this.config.eos.tokenAccount.name,
                        permission: 'active',
                    }],
                    data: {
                        account: this.config.eos.tokenAccount.name,
                        abi: abiToSend
                    }
                }
            ])
        });
    }

    private issueTokens() {
        return Promise.resolve([{
            account: this.config.eos.tokenAccount.name,
            name: 'issue',
            authorization: [{
                actor: this.config.eos.tokenAccount.name,
                permission: 'active',
            }],
            data: {
                to: this.config.eos.fromAccount.name,
                quantity: `${this.config.eos.transactions.issueTokensAmount} ${this.config.eos.transactions.tokenName}`,
                memo: ""
            }
        }]);
    }

    private createTokens() {
        return Promise.resolve([{
            account: this.config.eos.tokenAccount.name,
            name: 'create',
            authorization: [{
                actor: this.config.eos.tokenAccount.name,
                permission: 'active',
            }],
            data: {
                issuer: this.config.eos.tokenAccount.name,
                maximum_supply: `${this.config.eos.transactions.issueTokensAmount} ${this.config.eos.transactions.tokenName}`
            }
        }]);
    }

}

import * as fs from "fs";
import {Serialize} from "eosjs";
import {Api, JsonRpc} from "eosjs/dist";
import Strings from "../constants/Strings";
import * as encoding from "text-encoding";
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import {Accounts} from "./HayaAccountsPrepareTool";

const fetch = require("node-fetch");

export default class HayaPrepareTool {
    private readonly moduleConfig: any;
    private readonly accounts: Accounts;
    private api: Api;

    constructor(moduleConfig: any, accounts: Accounts) {
        this.moduleConfig = moduleConfig;
        this.accounts = accounts;
        const rpc = new JsonRpc("", {fetch});
        const signatureProvider = new JsSignatureProvider(
            []
        );
        this.api = new Api({
            rpc,
            signatureProvider: signatureProvider,
            textDecoder: new encoding.TextDecoder(),
            textEncoder: new encoding.TextEncoder(),
        });
    }

    deployTokenContractIfNeeded() {
        if (this.moduleConfig.transactions.deployTokenContract) {
            console.log(Strings.log.deployingTokenContract());
            return this.deployTokensContract();
        }

        console.log(Strings.log.deployingTokenContractNotNeeded());
        return Promise.resolve([] as Serialize.Action[]);
    }

    createTokensIfNeeded() {
        if (this.moduleConfig.transactions.createTokens) {
            let quantity = `${this.moduleConfig.transactions.createTokensAmount} ${this.moduleConfig.transactions.tokenName}`;
            console.log(Strings.log.creatingTokens(quantity));

            return this.createTokens();
        }

        console.log(Strings.log.creatingTokensNotNeeded());
        return Promise.resolve([] as Serialize.Action[]);
    }

    issueTokensIfNeeded() {
        if (this.moduleConfig.transactions.issueTokens) {
            let quantity = `${this.moduleConfig.transactions.issueTokensAmount} ${this.moduleConfig.transactions.tokenName}`;
            console.log(Strings.log.issuingTokens(quantity));

            return this.issueTokens();
        }

        console.log(Strings.log.issuingTokensNotNeeded());
        return Promise.resolve([] as Serialize.Action[]);
    }

    getAbi(): any {
        let buffer = new Serialize.SerialBuffer({
            textEncoder: this.api.textEncoder,
            textDecoder: this.api.textDecoder,
        });

        let abiJson = fs.readFileSync(this.moduleConfig.tokensContract.abiFilePath);
        let abi = JSON.parse(abiJson.toString());

        let abiDefinition = this.api.abiTypes.get('abi_def');
        if (!abiDefinition) {
            return;
        }
        let abiToSerialize = abiDefinition.fields.reduce(
            (acc, {name: fieldName}) => Object.assign(acc, {[fieldName]: acc[fieldName] || []}),
            abi,
        );
        abiDefinition.serialize(buffer, abiToSerialize);
        return buffer.asUint8Array();
    }

    private deployTokensContract(): Promise<Serialize.Action[]> {
        return new Promise((resolve) => {
            let wasm = fs.readFileSync(this.moduleConfig.tokensContract.wasmFilePath);
            let abi = Buffer.from(this.getAbi()).toString(`hex`);

            resolve([
                {
                    account: "eosio",
                    name: 'setcode',
                    authorization: [{
                        actor: this.accounts.tokenAccount.name,
                        permission: 'active',
                    }],
                    data: {
                        account: this.accounts.tokenAccount.name,
                        vmtype: 0,
                        vmversion: 0,
                        code: wasm
                    }
                },
                {
                    account: "eosio",
                    name: 'setabi',
                    authorization: [{
                        actor: this.accounts.tokenAccount.name,
                        permission: 'active',
                    }],
                    data: {
                        account: this.accounts.tokenAccount.name,
                        abi: abi
                    }
                }
            ])
        });
    }

    private issueTokens(): Promise<Serialize.Action[]> {
        return Promise.resolve([{
            account: this.accounts.tokenAccount.name,
            name: 'issue',
            authorization: [{
                actor: this.accounts.tokenAccount.name,
                permission: 'active',
            }],
            data: {
                to: this.accounts.fromAccount.name,
                quantity: `${this.moduleConfig.transactions.issueTokensAmount} ${this.moduleConfig.transactions.tokenName}`,
                memo: ""
            }
        }]);
    }

    private createTokens(): Promise<Serialize.Action[]> {
        return Promise.resolve([{
            account: this.accounts.tokenAccount.name,
            name: 'create',
            authorization: [{
                actor: this.accounts.tokenAccount.name,
                permission: 'active',
            }],
            data: {
                issuer: this.accounts.tokenAccount.name,
                maximum_supply: `${this.moduleConfig.transactions.issueTokensAmount} ${this.moduleConfig.transactions.tokenName}`
            }
        }]);
    }

}

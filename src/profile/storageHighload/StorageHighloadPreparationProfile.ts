import {PreparationProfile} from "tank.bench-common";
import HayaModulePreparationProfile from "../default/HayaModulePreparationProfile";
import {Api, JsonRpc, Serialize} from "eosjs/dist";
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import * as encoding from "text-encoding";
import * as fs from "fs";

const fetch = require("node-fetch");

export default class StorageHighloadPreparationProfile extends PreparationProfile {
    private defaultPP!: HayaModulePreparationProfile;

    async asyncConstruct(commonConfig: any, moduleConfig: any): Promise<any> {
        this.defaultPP = new HayaModulePreparationProfile(commonConfig, moduleConfig, this.logger);
        await this.defaultPP.asyncConstruct();
    }

    async prepare(commonConfig: any, moduleConfig: any): Promise<any> {
        let newConfig = await this.defaultPP.prepare();
        let rpc = new JsonRpc(this.moduleConfig.rpcUrls[0], {fetch});
        let transactionsConf = {
            blocksBehind: this.moduleConfig.blocksBehind,
            expireSeconds: this.moduleConfig.expireSeconds,
        };
        let signatureProvider = new JsSignatureProvider(
            [newConfig.fromAccount.privateKey]
        );
        let api = new Api({
            rpc: rpc,
            signatureProvider: signatureProvider,
            textDecoder: new encoding.TextDecoder(),
            textEncoder: new encoding.TextEncoder(),
        });

        let actions = await this.deployContract(newConfig, newConfig.fromAccount, api);
        await api.transact({actions: actions}, transactionsConf);

        return newConfig;
    }

    getAbi(api: Api): any {
        let buffer = new Serialize.SerialBuffer({
            textEncoder: api.textEncoder,
            textDecoder: api.textDecoder,
        });

        let abiJson = fs.readFileSync("src/contracts/storageload/storageload.abi");
        let abi = JSON.parse(abiJson.toString());

        let abiDefinition = api.abiTypes.get('abi_def');
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

    private async deployContract(config: any, account: any, api: Api): Promise<any> {
        return new Promise((resolve) => {
            let wasm = fs.readFileSync("src/contracts/storageload/storageload.wasm").toString(`hex`);
            let abi = Buffer.from(this.getAbi(api)).toString(`hex`);

            resolve([
                {
                    account: config.creatorAccount.name,
                    name: 'setcode',
                    authorization: [{
                        actor: account.name,
                        permission: 'active',
                    }],
                    data: {
                        account: account.name,
                        vmtype: 0,
                        vmversion: 0,
                        code: wasm
                    }
                },
                {
                    account: config.creatorAccount.name,
                    name: 'setabi',
                    authorization: [{
                        actor: account.name,
                        permission: 'active',
                    }],
                    data: {
                        account: account.name,
                        abi: abi
                    }
                }
            ])
        });
    }
}

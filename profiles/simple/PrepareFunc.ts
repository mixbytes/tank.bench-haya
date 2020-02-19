import {PrepareArgs} from "tank.bench-profile/dist";
import configSchema from "haya-common-tools/config/configSchema";
import HayaPrepareTool from "haya-common-tools/tools/HayaPrepareTool";
import HayaAccountsPrepareTool from "haya-common-tools/tools/HayaAccountsPrepareTool";
import Strings from "haya-common-tools/constants/Strings";
import {Api, JsonRpc, Serialize} from "eosjs/dist";
import {JsSignatureProvider} from "eosjs/dist/eosjs-jssig";
import * as encoding from "text-encoding";

const fetch = require('node-fetch').default;


const checkConfig = ({commonConfig, moduleConfig}: PrepareArgs<typeof configSchema>) => {
    if (commonConfig.threadsAmount % moduleConfig.rpcUrls.length !== 0)
        throw new Error("rpcUrls amount must be multiple of commonConfig.threadsAmount");
};

const transact = (api: Api, transactionsConf: any, actions: Serialize.Action[]) => {
    return Promise.all(actions.map(action => {
        return api.transact({actions: [action]}, transactionsConf)
    }));
};

const prepareApi = (rpc: JsonRpc, accounts: { name: string, privateKey: string }[]) => {
    const signatureProvider = new JsSignatureProvider(
        accounts
            .filter(account => account.privateKey)
            .map(account => account.privateKey)
    );
    return new Api({
        rpc,
        signatureProvider: signatureProvider,
        textDecoder: new encoding.TextDecoder(),
        textEncoder: new encoding.TextEncoder(),
    });
};

export const prepareFunc = async (
    {commonConfig, moduleConfig}: PrepareArgs<typeof configSchema>) => {

    checkConfig({commonConfig, moduleConfig});

    const rpc = new JsonRpc(moduleConfig.rpcUrls[0], {fetch});
    const transactionsConf = {
        blocksBehind: moduleConfig.blocksBehind,
        expireSeconds: moduleConfig.expireSeconds,
    };

    const keyAccounts = [moduleConfig.creatorAccount];
    let api = prepareApi(rpc, keyAccounts);

    let totalActions = 0;

    // Prepare accounts
    let result = await new HayaAccountsPrepareTool(moduleConfig.creatorAccount.name!, {
        tokenAccount: moduleConfig.tokenAccount,
        fromAccount: moduleConfig.fromAccount,
        toAccount: moduleConfig.toAccount
    }).prepare();
    const accounts = result.accounts;
    totalActions += result.actions.length;
    await transact(api, transactionsConf, result.actions);

    // Do this the second time to update private keys
    api = prepareApi(rpc, [moduleConfig.creatorAccount, accounts.tokenAccount]);

    let actions: Serialize.Action[];
    let contractsPrepareTool = new HayaPrepareTool(moduleConfig, accounts);
    actions = await contractsPrepareTool.deployTokenContractIfNeeded();
    totalActions += actions.length;
    await transact(api, transactionsConf, actions);

    actions = await contractsPrepareTool.createTokensIfNeeded();
    totalActions += actions.length;
    await transact(api, transactionsConf, actions);

    actions = await contractsPrepareTool.issueTokensIfNeeded();
    totalActions += actions.length;
    await transact(api, transactionsConf, actions);


    if (totalActions !== 0) {
        console.log(Strings.log.benchmarkPreparedWithTransaction());
    } else {
        console.log(Strings.log.benchmarkPreparedNoTransaction());
    }
    const rpcInfo = await rpc.get_info();

    const block = await rpc!.get_block(rpcInfo.head_block_num - moduleConfig.blocksBehind);

    return {
        ...moduleConfig,
        accounts,
        chainId: rpcInfo.chain_id,
        refBlock: block,
        abis: [{
            accountName: moduleConfig.creatorAccount.name,
            abi: contractsPrepareTool.getAbi(),
        }],
        urlsPerThread: commonConfig.threadsAmount / moduleConfig.rpcUrls.length
    }
};

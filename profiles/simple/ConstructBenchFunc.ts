import {ConstructBenchArgs} from "tank.bench-profile/dist";
import {prepare} from "./Profile";
import NodeEosjsSignatureProvider from "node-eosjs-signature-provider";
import * as encoding from "text-encoding";
import {Api, JsonRpc} from "eosjs/dist";
const fetch = require('node-fetch').default;

export const constructBenchFunc = async (
    {benchConfig, threadId}: ConstructBenchArgs<ReturnType<typeof prepare>>) => {

    const rpc = new JsonRpc(
        benchConfig.rpcUrls[Math.floor(threadId / benchConfig.urlsPerThread)],
        {fetch}
    );

    const {accounts} = benchConfig;

    const signatureProvider = new NodeEosjsSignatureProvider(
        [accounts.fromAccount.privateKey]
    );

    const api = new Api({
        rpc,
        signatureProvider,
        textDecoder: new encoding.TextDecoder(),
        textEncoder: new encoding.TextEncoder(),
    });

    api.chainId = benchConfig.chainId;

    const transactionsConf = {
        blocksBehind: benchConfig.blocksBehind,
        expireSeconds: benchConfig.expireSeconds,
    };

    const transactionDummy = {
        ref_block_num: benchConfig.refBlock.block_num & 0xffff,
        ref_block_prefix: benchConfig.refBlock.ref_block_prefix,
    };

    return {rpc, benchConfig, signatureProvider, api, transactionDummy, transactionsConf};
};

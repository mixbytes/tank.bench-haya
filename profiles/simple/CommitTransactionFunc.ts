import {constructBench, prepare} from "./Profile";
import {CommitTransactionArgs, TransactionResult} from "tank.bench-profile/dist";
import * as ser from "eosjs/dist/eosjs-serialize";
import {SignatureProviderArgs} from "eosjs/dist/eosjs-api-interfaces";
import {Accounts} from "haya-common-tools/tools/HayaAccountsPrepareTool";

const getActions = (accounts: Accounts, transactions: any, uniqueData: string) => {
    return [
        {
            account: accounts.tokenAccount.name,
            name: 'transfer',
            authorization: [{
                actor: accounts.fromAccount.name,
                permission: 'active',
            }],
            data: {
                from: accounts.fromAccount.name,
                to: accounts.toAccount.name,
                quantity: `${transactions.tokensInOneTransfer} ${transactions.tokenName}`,
                memo: uniqueData
            }
        }
    ]
};

export const commitTransactionFunc = async (
    {benchConfig, constructData, threadId, uniqueData}:
        CommitTransactionArgs<ReturnType<typeof prepare>, ReturnType<typeof constructBench>>):
    Promise<TransactionResult> => {

    const {api, transactionDummy, signatureProvider, rpc} = constructData;
    const {accounts, transactions} = benchConfig;

    let exp = (new Date().getTime() + benchConfig.expireSeconds * 1000) * 1000;
    let transaction = {
        expiration: ser.timePointToDate(exp),
        ...transactionDummy,
        actions: await api.serializeActions(getActions(accounts, transactions, uniqueData))
    };
    let serializedTransaction = api.serializeTransaction(transaction);

    let signArgs: SignatureProviderArgs = {
        requiredKeys: [accounts.fromAccount.publicKey],
        abis: benchConfig.abis,
        chainId: api.chainId,
        serializedTransaction: serializedTransaction
    };

    let pushTransactionArgs = await signatureProvider.sign(signArgs);

    try {
        await rpc.push_transaction(pushTransactionArgs);
        return {code: 200, error: null}

    } catch (e) {
        try {
            return {code: e.json.code, error: e}
        } catch (e2) {
            return {code: -1, error: e}
        }
    }
};

import * as EosToolbox from "./HayaToolbox";
import {randomAccountName} from "./HayaToolbox";
import Strings from "../constants/Strings";
import {Serialize} from "eosjs";

export type AccountToPrepare = {
    create?: boolean,
    name?: string,
    privateKey?: string,
    publicKey?: string,
};

export type AccountsToPrepare = {
    tokenAccount: AccountToPrepare,
    fromAccount: AccountToPrepare,
    toAccount: AccountToPrepare
};

export type Account = {
    name: string,
    privateKey: string,
    publicKey: string,
    created: boolean,
};

export type Accounts = {
    tokenAccount: Account,
    fromAccount: Account,
    toAccount: Account
}


export default class HayaAccountsPrepareTool {

    private readonly accounts: AccountsToPrepare;
    private readonly creatorAccountName: string;

    constructor(creatorAccountName: string, accounts: AccountsToPrepare) {
        this.accounts = accounts;
        this.creatorAccountName = creatorAccountName;
    }

    async prepare(): Promise<{ accounts: Accounts, actions: Serialize.Action[] }> {
        console.log(Strings.log.preparingAccounts());

        const roles = ["tokenAccount", "fromAccount", "toAccount"];
        let actions: Serialize.Action[] = [];
        const accs = {} as Accounts;
        for (let i = 0; i < roles.length; i++) {
            const role = roles[i] as "tokenAccount" | "fromAccount" | "toAccount";
            const account = this.accounts[role] as AccountToPrepare;
            const acc = await this._prepareAccount(account, role);

            if (acc.created) {
                const newActions = await this._newAccount(acc);
                actions = [...actions, ...newActions];
            }

            accs[role] = acc;
        }

        return {accounts: accs, actions};
    }

    async _prepareAccountWithCreation(account: AccountToPrepare, role: string): Promise<Account> {
        console.log(Strings.log.creatingAccountForRole(role));

        let name = account.name;
        if (!name) {
            name = randomAccountName();
            console.log(Strings.log.nameForRoleGenerated(role, name));
        }

        let privateKey;
        let publicKey;
        if (!account.privateKey) {
            const keys = await EosToolbox.generateRandomKeys();
            privateKey = keys.privateKey;
            publicKey = keys.publicKey;
            console.log(Strings.log.keysForAccountGenerated(role, {name, privateKey, publicKey}));
        } else {
            privateKey = account.privateKey;
            publicKey = await EosToolbox.privateToPublicKey(privateKey);
        }

        return {
            name,
            privateKey,
            publicKey,
            created: true
        };
    }

    async _prepareAccountWithoutCreation(account: AccountToPrepare, role: string): Promise<Account> {

        console.log(Strings.log.preparingWithoutCreationAccountForRole(role) + "\n");

        if (!account.name) {
            return Promise.reject(new Error(Strings.error.notCreateButNoName(role)));
        }

        if (!account.privateKey) {
            return Promise.reject(new Error(Strings.error.notCreateButNoKey(role)));
        }

        const publicKey = await EosToolbox.privateToPublicKey(account.privateKey);

        if (account.publicKey && account.publicKey !== publicKey) {
            return Promise.reject(`Public key for account ${role} does not match specified private key`);
        }

        const acc: Account = {
            name: account.name,
            privateKey: account.privateKey,
            publicKey,
            created: false
        };

        console.log(Strings.log.accountGottenFromConfigWithKeys(role, acc));

        return acc;
    }

    _prepareAccount(account: AccountToPrepare, role: string) {
        if (!account.create) {
            return this._prepareAccountWithoutCreation(account, role);
        } else {
            return this._prepareAccountWithCreation(account, role);
        }
    }

    _newAccount(account: AccountToPrepare): Promise<Serialize.Action[]> {
        return Promise.resolve([{
            account: "eosio",
            name: 'newaccount',
            authorization: [{
                actor: this.creatorAccountName,
                permission: 'active',
            }],
            data: {
                creator: this.creatorAccountName,
                name: account.name,
                owner: {
                    threshold: 1,
                    keys: [{
                        key: account.publicKey,
                        weight: 1
                    }],
                    accounts: [],
                    waits: []
                },
                active: {
                    threshold: 1,
                    keys: [{
                        key: account.publicKey,
                        weight: 1
                    }],
                    accounts: [],
                    waits: []
                }
            }
        }]);
    }
}

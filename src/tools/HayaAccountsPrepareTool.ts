import * as EosToolbox from "./HayaToolbox";
import {randomAccountName} from "./HayaToolbox";
import Strings from "../constants/Strings";
import Constants from "../constants/Constants";
import {Logger} from "tank.bench-common";

export default class HayaAccountsPrepareTool {

    private readonly moduleConfig: any;
    private readonly logger: Logger;

    constructor(moduleConfig: any, logger: Logger) {
        this.moduleConfig = moduleConfig;
        this.logger = logger;
    }

    prepare() {

        this.logger.log(Strings.log.preparingAccounts());

        let accountsToCheck = [
            this.moduleConfig.tokenAccount,
            this.moduleConfig.fromAccount,
            this.moduleConfig.toAccount
        ].map((account, i) => {
            return {
                account, role: (() => {
                    switch (i) {
                        case 0:
                            return Constants.tokenRole();
                        case 1:
                            return Constants.fromRole();
                        case 2:
                            return Constants.toRole();
                        default:
                            return ""
                    }
                })()
            }
        });

        return Promise
            .all(accountsToCheck
                .map(account => this._prepareAccount(account.account, account.role)))
            .then(actionsAndLogs => {
                actionsAndLogs.forEach(actionAndLog => {
                    if (actionAndLog.log)
                        this.logger.logfull(actionAndLog.log);
                });

                return {
                    actions: actionsAndLogs
                        .reduce((arr, actionAndLog) => arr.concat(actionAndLog.actions), [])
                        .filter((a: any) => a),
                    moduleConfig: this.moduleConfig
                };
            })
    }

    _prepareAccountWithCreation(account: any, role: string): Promise<any> {
        let log = `${Strings.log.creatingAccountForRole(role)}\n`;

        if (!account.name) {
            account.name = randomAccountName();
            log += `${Strings.log.nameForRoleGenerated(role, account)}\n`;
        }

        if (!account.privateKey) {
            return EosToolbox
                .generateRandomKeys()
                .then(keys => {

                    account.privateKey = keys.privateKey;
                    account.publicKey = keys.publicKey;

                    log += Strings.log.keysForAccountGenerated(role, account) + "\n";
                    return this._newAccount(account);
                })
                .then(actions => {
                    return {actions, log: log.trimRight()}
                });
        }

        return EosToolbox
            .privateToPublicKey(account.privateKey)
            .then((key) => {
                account.publicKey = key;
                return this._newAccount(account);
            })
            .then(actions => {
                return {actions, log: log.trimRight()}
            });

    }

    _prepareAccountWithoutCreation(account: any, role: string): Promise<any> {

        let log = Strings.log.preparingWithoutCreationAccountForRole(role) + "\n";

        if (!account.name) {
            return Promise.reject(new Error(Strings.error.notCreateButNoName(role)));
        }

        if (account.privateKey === null) {
            return Promise.reject(new Error(Strings.error.notCreateButNoKey(role)));
        }

        if (account.privateKey) {
            return EosToolbox
                .privateToPublicKey(account.privateKey)
                .then(key => {
                    account.publicKey = key;
                    log += Strings.log.accountGottenFromConfigWithKeys(role, account);
                    return {log: log.trimRight()}
                })
        }

        account.publicKey = null;
        log += Strings.log.accountGottenFromConfig(role, account);
        return Promise.resolve({log: log.trimRight()})
    }

    _prepareAccount(account: any, role: string) {
        if (!account.create) {
            return this._prepareAccountWithoutCreation(account, role);
        } else {
            return this._prepareAccountWithCreation(account, role)
        }
    }

    _newAccount(account: any) {
        return Promise.resolve([{
            account: this.moduleConfig.creatorAccount.name,
            name: 'newaccount',
            authorization: [{
                actor: this.moduleConfig.creatorAccount.name,
                permission: 'active',
            }],
            data: {
                creator: this.moduleConfig.creatorAccount.name,
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

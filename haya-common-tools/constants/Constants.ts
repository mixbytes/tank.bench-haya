export default class Constants {

    static tokenRole() {
        return "TOKEN"
    }

    static fromRole() {
        return "FROM"
    }

    static toRole() {
        return "TO"
    }

    static eosTokenWasmPath() {
        return "./haya-common-tools/contracts/eosio.token/eosio.token.wasm"
    }

    static eosTokenAbiPath() {
        return "./haya-common-tools/contracts/eosio.token/eosio.token.abi"
    }

    static configFilePath() {
        return "./module.config.json"
    }
}

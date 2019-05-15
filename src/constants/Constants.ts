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
        return "./src/contracts/eosio.token/eosio.token.wasm"
    }

    static eosTokenAbiPath() {
        return "./src/contracts/eosio.token/eosio.token.abi"
    }

    static configFilePath() {
        return "./haya.bench.config.json"
    }
}

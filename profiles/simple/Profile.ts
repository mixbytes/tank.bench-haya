import {
    DestroyBenchArgs,
    Profile,
} from "tank.bench-profile";
import {prepareFunc} from "./PrepareFunc";
import {constructBenchFunc} from "./ConstructBenchFunc";
import configSchema from "haya-common-tools/config/configSchema";
import {commitTransactionFunc} from "./CommitTransactionFunc";


export const prepare = prepareFunc;

export const constructBench = constructBenchFunc;

const destroyBench = async (
    {}:
        DestroyBenchArgs<ReturnType<typeof prepare>, ReturnType<typeof constructBench>>) => {
};

export const profile = Profile({
    configSchema,
    prepare,
    destroyBench,
    constructBench,
    commitTransaction: commitTransactionFunc
});

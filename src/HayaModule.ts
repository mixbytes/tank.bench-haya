import {BenchStep, BlockchainModule, Logger, PrepareStep} from "tank.bench-common";
import HayaModuleBenchStep from "./steps/HayaModuleBenchStep";
import HayaModulePrepareStep from "./steps/HayaModulePrepareStep";
import configTemplate from "./config/configSchema";
import Constants from "./constants/Constants";
import BenchTelemetryStep from "tank.bench-common/dist/lib/module/steps/BenchTelemetryStep";
import HayaModuleBenchTelemeryStep from "./steps/HayaModuleBenchTelemeryStep";

export default class HayaModule extends BlockchainModule {
    createBenchStep(benchConfig: any, logger: Logger): BenchStep {
        return new HayaModuleBenchStep(benchConfig, logger);
    }

    createPrepareStep(commonConfig: any, moduleConfig: any, logger: Logger): PrepareStep {
        return new HayaModulePrepareStep(commonConfig, moduleConfig, logger);
    }

    createBenchTelemetryStep(benchConfig: any, logger: Logger): BenchTelemetryStep {
        return new HayaModuleBenchTelemeryStep(benchConfig, logger)
    }

    getConfigSchema(): any {
        return configTemplate;
    }

    getDefaultConfigFilePath(): string | null {
        return Constants.configFilePath();
    }

    getFileName(): string {
        return __filename;
    }
}

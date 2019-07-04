import {BlockchainModule, Logger, Preparation} from "tank.bench-common";
import HayaModulePrepareStep from "./steps/HayaModulePrepareStep";
import configTemplate from "./config/configSchema";
import Constants from "./constants/Constants";

export default class HayaModule extends BlockchainModule {
    createPreparationStep(commonConfig: any, moduleConfig: any, logger: Logger): Preparation {
        return new HayaModulePrepareStep(commonConfig, moduleConfig, logger);
    }

    getConfigSchema(): any {
        return configTemplate;
    }

    getDefaultConfigFilePath(): string | null {
        return Constants.configFilePath();
    }
}

import {BlockchainModule, BuiltinBenchProfile, Logger, Preparation} from "tank.bench-common";
import HayaModulePrepareStep from "./steps/HayaModulePrepareStep";
import configTemplate from "./config/configSchema";
import Constants from "./constants/Constants";
import HayaModuleDefaultProfile from "./steps/HayaModuleDefaultProfile";

export default class HayaModule extends BlockchainModule {
    createPreparationStep(commonConfig: any, moduleConfig: any, logger: Logger): Preparation {
        return new HayaModulePrepareStep(commonConfig, moduleConfig, logger);
    }

    getBuiltinProfiles(): BuiltinBenchProfile[] {
        return [HayaModuleDefaultProfile.profileMeta];
    }

    getConfigSchema(): any {
        return configTemplate;
    }

    getDefaultConfigFilePath(): string | null {
        return Constants.configFilePath();
    }
}

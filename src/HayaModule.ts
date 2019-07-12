import {BlockchainModule, BuiltinProfile} from "tank.bench-common";
import configTemplate from "./config/configSchema";
import Constants from "./constants/Constants";
import HayaModuleDefaultProfile from "./profile/HayaModuleDefaultProfile";

export default class HayaModule extends BlockchainModule {
    getBuiltinProfiles(): BuiltinProfile[] {
        return [{
            profile: HayaModuleDefaultProfile,
            name: "default"
        }];
    }

    getConfigSchema(): any {
        return configTemplate;
    }

    getDefaultConfigFilePath(): string | null {
        return Constants.configFilePath();
    }
}

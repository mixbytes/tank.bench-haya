import {BlockchainModule, BuiltinProfile} from "tank.bench-common";
import Constants from "./constants/Constants";
import HayaModuleDefaultProfile from "./profile/default/HayaModuleDefaultProfile";
import StorageHighloadProfile from "./profile/storageHighload/StorageHighloadProfile";

export default class HayaModule extends BlockchainModule {
    getBuiltinProfiles(): BuiltinProfile[] {
        return [HayaModuleDefaultProfile, StorageHighloadProfile];
    }

    getDefaultConfigFilePath(): string | null {
        return Constants.configFilePath();
    }
}

import {Profile} from "tank.bench-common";
import HayaModuleBenchProfile from "./HayaModuleBenchProfile";
import HayaModulePreparationProfile from "./HayaModulePreparationProfile";
import configSchema from "../../config/configSchema";

const profile: Profile = {
    benchProfile: HayaModuleBenchProfile,
    fileName: __filename,
    preparationProfile: HayaModulePreparationProfile,
    telemetryProfile: undefined,
    configSchema: configSchema
};

export default profile;

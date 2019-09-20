import {BuiltinProfile} from "tank.bench-common";
import HayaModuleBenchProfile from "./HayaModuleBenchProfile";
import HayaModulePreparationProfile from "./HayaModulePreparationProfile";
import configSchema from "../../config/configSchema";

const profile: BuiltinProfile = {
    name: "default",
    fileName: __filename,
    benchProfile: HayaModuleBenchProfile,
    preparationProfile: HayaModulePreparationProfile,
    telemetryProfile: undefined,
    configSchema: configSchema
};

export default profile;

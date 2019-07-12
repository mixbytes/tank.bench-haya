import {Profile} from "tank.bench-common";
import HayaModuleBenchProfile from "./HayaModuleBenchProfile";
import HayaModulePreparationProfile from "./HayaModulePreparationProfile";

const profile: Profile = {
    benchProfile: HayaModuleBenchProfile,
    fileName: __filename,
    preparationProfile: HayaModulePreparationProfile,
    telemetryProfile: undefined
};

export default profile;

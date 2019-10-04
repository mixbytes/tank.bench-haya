import {Profile} from "tank.bench-common";
import SimpleBenchProfile from "./SimpleBenchProfile";
import SimplePreparationProfile from "./SimplePreparationProfile";
import configSchema from "./configSchema";

const profile: Profile = {
    benchProfile: SimpleBenchProfile,
    preparationProfile: SimplePreparationProfile,
    configSchema: configSchema
};

export default profile;

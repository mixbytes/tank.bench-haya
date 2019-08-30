import {Profile} from "tank.bench-common";
import configSchema from "../../config/configSchema";
import StorageHighloadBenchProfile from "./StorageHighloadBenchProfile";
import StorageHighloadPreparationProfile from "./StorageHighloadPreparationProfile";

const StorageHighloadProfile: Profile = {
    benchProfile: StorageHighloadBenchProfile,
    fileName: __filename,
    preparationProfile: StorageHighloadPreparationProfile,
    telemetryProfile: undefined,
    configSchema: configSchema
};

export default StorageHighloadProfile;

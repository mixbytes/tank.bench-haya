import {BuiltinProfile} from "tank.bench-common";
import configSchema from "../../config/configSchema";
import StorageHighloadBenchProfile from "./StorageHighloadBenchProfile";
import StorageHighloadPreparationProfile from "./StorageHighloadPreparationProfile";

const StorageHighloadProfile: BuiltinProfile = {
    benchProfile: StorageHighloadBenchProfile,
    fileName: __filename,
    name: "storage_highload",
    preparationProfile: StorageHighloadPreparationProfile,
    telemetryProfile: undefined,
    configSchema: configSchema
};

export default StorageHighloadProfile;

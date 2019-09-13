const SimpleBenchProfile = require("./SimpleBenchProfile");
const configSchema = require("../../dist/config/configSchema").default;

module.exports = {
    benchProfile: SimpleBenchProfile,
    telemetryProfile: "takeFromBlockchainModuleDefaultProfile",
    preparationProfile: "takeFromBlockchainModuleDefaultProfile",
    fileName: __filename,
    configSchema: configSchema
};

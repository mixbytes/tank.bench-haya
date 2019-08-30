const SimpleBenchProfile = require("./SimpleBenchProfile");
const configSchema = require("../../dist/config/configSchema");

module.exports = {
    benchProfile: SimpleBenchProfile,
    fileName: __filename,
    preparationProfile: undefined,
    telemetryProfile: undefined,
    configSchema: configSchema
};

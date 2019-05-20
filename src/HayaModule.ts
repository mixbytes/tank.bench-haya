import BlockchainModule from "tank.bench-common/dist/module/BlockchainModule";
import BenchStep from "tank.bench-common/dist/module/steps/BenchStep";
import PrepareStep from "tank.bench-common/dist/module/steps/PrepareStep";
import Logger from "tank.bench-common/dist/resources/Logger";
import HayaModuleBenchStep from "./steps/HayaModuleBenchStep";
import HayaModulePrepareStep from "./steps/HayaModulePrepareStep";
import * as fs from "fs";
import getConvict from "./config/convictConfig";

export default class HayaModule implements BlockchainModule {
    createBenchStep(config: any, logger: Logger): BenchStep {
        return new HayaModuleBenchStep(config, logger);
    }

    createPrepareStep(config: any, logger: Logger): PrepareStep {
        let convictConfig = getConvict();
        let convictFile = convictConfig.getProperties().configFile;
        if (fs.existsSync(convictFile)) {
            try {
                convictConfig.loadFile(convictFile);
                convictConfig.validate({allowed: 'strict'});
            } catch (e) {
                console.error(e);
            }
        }
        return new HayaModulePrepareStep({...config, eos: convictConfig.getProperties()}, logger);
    }

    getFileName(): string {
        return __filename;
    }
}

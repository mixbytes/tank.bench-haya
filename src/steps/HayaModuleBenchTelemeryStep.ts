import {BenchTelemetryStep, TelemetryData} from "tank.bench-common";

export default class HayaModuleBenchTelemetryStep extends BenchTelemetryStep {
    onBenchEnded(d: TelemetryData): Promise<any> {
        return Promise.resolve();
    }

    onKeyPoint(d: TelemetryData): any {
    }
}


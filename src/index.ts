import BenchRunner from "tank.bench-common";
import HayaModule from "./HayaModule";

// noinspection JSIgnoredPromiseFromCall
new BenchRunner(new HayaModule()).bench().then(() => {
    console.log("Bench finished!");
});

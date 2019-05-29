import HayaModule from "./HayaModule";
import {BenchRunner} from "tank.bench-common";

// noinspection JSIgnoredPromiseFromCall
new BenchRunner(new HayaModule())
    .bench()
    .then(() => {
        console.log("Bench finished!")
    })
    .catch(e => console.log(e));

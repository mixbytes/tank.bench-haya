import HayaModule from "./HayaModule";

// noinspection JSIgnoredPromiseFromCall
new HayaModule()
    .bench()
    .catch(e => console.log(e));

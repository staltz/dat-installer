import { run } from "@cycle/run";
import { makeScreenDriver } from "@cycle/native-screen";
import makeNodejsDriver from "./lib/drivers/nodejs";
import main from "./lib/main";

run(main, {
  screen: makeScreenDriver("DatInstaller"),
  nodejs: makeNodejsDriver()
});

import { run } from "@cycle/run";
import { makeScreenDriver } from "@cycle/native-screen";
import main from "./lib/main";

run(main, {
  screen: makeScreenDriver("DatInstaller")
});

import { run } from "@cycle/run";
import { makeScreenDriver } from "@cycle/native-screen";
import main from "./src/main";

run(main, {
  screen: makeScreenDriver("DatInstaller")
});

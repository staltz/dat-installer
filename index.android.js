import { run } from "@cycle/run";
import { makeSingleScreenNavDrivers } from "cycle-native-navigation";
import makeNodejsDriver from "./lib/drivers/nodejs";
import { navigatorStyle as centralNavigatorStyle } from "./lib/styles";
import main from "./lib/main";

const { screenVNodeDriver, commandDriver } = makeSingleScreenNavDrivers(
  ["DatInstaller.Central"],
  {
    screen: {
      screen: "DatInstaller.Central",
      title: "Dat Installer",
      navigatorStyle: centralNavigatorStyle
    }
  }
);

run(main, {
  screen: screenVNodeDriver,
  navCommand: commandDriver,
  nodejs: makeNodejsDriver()
});

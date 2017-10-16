import RNNode from "react-native-node";
import { run } from "@cycle/run";
import { makeHTTPDriver } from "@cycle/http";
import { makeSingleScreenNavDrivers } from "cycle-native-navigation";
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
  http: makeHTTPDriver()
});

RNNode.start();

import RNNode from "react-native-node";
import { run } from "@cycle/run";
import { makeHTTPDriver } from "@cycle/http";
import { makeSingleScreenNavDrivers } from "cycle-native-navigation";
import onionify from "cycle-onionify";
import { navigatorStyle } from "./lib/styles";
import apkInstallerDriver from "./lib/drivers/apk-installer";
import packageInfoDriver from "./lib/drivers/package-info";
import main from "./lib/main";
import { NativeModules } from "react-native";

const { screenVNodeDriver, commandDriver } = makeSingleScreenNavDrivers(
  ["DatInstaller.Central", "DatInstaller.Addition", "DatInstaller.Details"],
  {
    screen: {
      screen: "DatInstaller.Central",
      title: "Dat Installer",
      navigatorStyle: navigatorStyle,
    },
  },
);

run(onionify(main), {
  screen: screenVNodeDriver,
  navCommand: commandDriver,
  http: makeHTTPDriver(),
  packageInfo: packageInfoDriver,
  installApk: apkInstallerDriver,
});

RNNode.start();

const startedListener = () => {
  RNNode.start();
  NativeModules.ActivityCallbacks.setStartedListener(startedListener);
};
NativeModules.ActivityCallbacks.setStartedListener(startedListener);

const stoppedListener = () => {
  RNNode.stop();
  NativeModules.ActivityCallbacks.setStoppedListener(stoppedListener);
};
NativeModules.ActivityCallbacks.setStoppedListener(stoppedListener);

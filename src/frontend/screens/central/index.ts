import xs, { Stream } from "xstream";
import { HTTPSource, RequestOptions } from "@cycle/http";
import {
  ScreenVNode,
  ScreensSource,
  Command,
  ShowModalCommand
} from "cycle-native-navigation";
import { AppMetadata } from "../../../typings/messages";
import { navigatorStyle } from "../../styles";
import view from "./view";
const RNFS = require("react-native-fs");

export type Sources = {
  screen: ScreensSource;
  http: HTTPSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  http: Stream<RequestOptions>;
};

export default function central(sources: Sources): Sinks {
  const apps$ = sources.http
    .select("allApps")
    .flatten()
    .map(res => res.body.apps)
    .startWith([])
    .debug("apps");

  const pongRes$ = sources.http
    .select("ping")
    .flatten()
    .take(1);

  const vdom$ = view(apps$);

  const setStoragePathReq$ = pongRes$.mapTo({
    category: "setStoragePath",
    url: "/setStoragePath",
    method: "POST",
    send: { path: RNFS.ExternalStorageDirectoryPath + "/DatInstaller" }
  });

  const allAppsReq$ = pongRes$
    .map(() => xs.periodic(2000).startWith(null as any))
    .flatten()
    .mapTo({ category: "allApps", url: "/allApps" });

  const pingReq$ = xs
    .periodic(300)
    .startWith(0)
    .endWhen(pongRes$)
    .mapTo({ category: "ping", url: "/ping" });

  const request$ = xs.merge(pingReq$, setStoragePathReq$, allAppsReq$);

  const goToAddition$ = sources.screen
    .select("addApp")
    .events("press")
    .mapTo({
      type: "showModal",
      screen: "DatInstaller.Addition",
      title: "Add an Android app",
      navigatorStyle: navigatorStyle
    } as ShowModalCommand);

  return {
    screen: vdom$,
    navCommand: goToAddition$,
    http: request$
  };
}

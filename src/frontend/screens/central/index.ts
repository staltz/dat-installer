import xs, { Stream } from "xstream";
import { HTTPSource, RequestOptions as Request } from "@cycle/http";
import { StateSource, Reducer } from "cycle-onionify";
import {
  ScreenVNode,
  ScreensSource,
  Command,
  ShowModalCommand,
} from "cycle-native-navigation";
import { AppMetadata } from "../../../typings/messages";
import { navigatorStyle } from "../../styles";
import view from "./view";
import intent from "./intent";
import model, { State, Actions } from "./model";
const RNFS = require("react-native-fs");

export type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
  http: HTTPSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  onion: Stream<Reducer<State>>;
  http: Stream<Request>;
};

export { State } from "./model";

function httpIntent(httpSource: HTTPSource) {
  return {
    updateApps$: httpSource
      .select("allApps")
      .flatten()
      .map(res => res.body.apps),

    startAllowingOtherRequests$: httpSource
      .select("ping")
      .flatten()
      .take(1)
      .mapTo(null),
  };
}

function httpRequests(start$: Stream<null>): Stream<Request> {
  const pingReq$ = xs
    .periodic(300)
    .startWith(0)
    .endWhen(start$)
    .mapTo({ category: "ping", url: "/ping" });

  const setStoragePathReq$ = start$.mapTo({
    category: "setStoragePath",
    url: "/setStoragePath",
    method: "POST",
    send: { path: RNFS.ExternalStorageDirectoryPath + "/DatInstaller" },
  });

  const allAppsReq$ = start$
    .map(() => xs.periodic(2000).startWith(null as any))
    .flatten()
    .mapTo({ category: "allApps", url: "/allApps" });

  return xs.merge(pingReq$, setStoragePathReq$, allAppsReq$);
}

export default function central(sources: Sources): Sinks {
  const httpActions = httpIntent(sources.http);
  const actions = { ...intent(sources.screen), ...httpActions };
  const reducer$ = model(actions as Actions);
  const vdom$ = view(sources.onion.state$);
  const request$ = httpRequests(httpActions.startAllowingOtherRequests$);

  const goToAddition$ = actions.goToAddition$.mapTo({
    type: "showModal",
    screen: "DatInstaller.Addition",
    title: "Add an Android app",
    navigatorStyle: navigatorStyle,
  } as ShowModalCommand);

  return {
    screen: vdom$,
    navCommand: goToAddition$,
    onion: reducer$,
    http: request$,
  };
}

import xs, { Stream } from "xstream";
import flattenConcurrently from "xstream/extra/flattenConcurrently";
import isolate from "@cycle/isolate";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { StateSource, Reducer, Lens } from "cycle-onionify";
import {
  ScreenVNode,
  ScreensSource,
  Command,
  PushCommand,
} from "cycle-native-navigation";
import { AppMetadata } from "../typings/messages";
import central, { State as CentralState } from "./screens/central";
import addition, {
  State as AdditionState,
  Sinks as AdditionSinks,
} from "./screens/addition";
import details, { State as DetailsState } from "./screens/details";
import { InfoRes, InfoReq } from "./drivers/package-info";
import model, { State, centralLens, detailsLens } from "./model";

type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
  http: HTTPSource;
  packageInfo: Stream<InfoRes>;
};

type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  onion: Stream<Reducer<State>>;
  http: Stream<RequestOptions>;
  packageInfo: Stream<InfoReq>;
  installApk: Stream<string>;
};

function packageInfo(state$: Stream<State>): Stream<InfoReq> {
  return state$
    .map(state => {
      const apps = state.apps;
      const requests = Object.keys(apps)
        .filter(key => !apps[key].label && apps[key].apkFullPath)
        .map(key => ({ datHash: key, path: apps[key].apkFullPath } as InfoReq));
      return xs.fromArray(requests);
    })
    .compose(flattenConcurrently);
}

export default function main(sources: Sources): Sinks {
  const isolatedCentral = isolate(central, {
    onion: centralLens,
    "*": "central",
  }) as typeof main;

  const isolatedDetails = isolate(details, {
    onion: detailsLens,
    "*": "details",
  }) as typeof main;

  const isolatedAddition = isolate(addition, "addition") as typeof main;

  const centralSinks = isolatedCentral(sources);
  const additionSinks = isolatedAddition(sources);
  const detailsSinks = isolatedDetails(sources);

  const vdom$ = xs.merge(
    centralSinks.screen,
    additionSinks.screen,
    detailsSinks.screen,
  );

  const navCommand$ = xs.merge(
    centralSinks.navCommand,
    additionSinks.navCommand,
    detailsSinks.navCommand,
  );

  const mainReducer$ = model(
    sources.packageInfo,
    navCommand$,
    ((additionSinks as any) as AdditionSinks).newDat,
  );

  const infoReq$ = packageInfo(sources.onion.state$);

  const request$ = xs
    .merge(centralSinks.http, additionSinks.http, detailsSinks.http)
    .map(req => ({
      ...(req as object),
      url: "http://localhost:8182" + req.url,
    }));

  const reducer$ = xs.merge(
    mainReducer$,
    centralSinks.onion,
    additionSinks.onion,
    detailsSinks.onion,
  );

  return {
    screen: vdom$,
    navCommand: navCommand$,
    onion: reducer$,
    http: request$,
    packageInfo: infoReq$,
    installApk: detailsSinks.installApk,
  };
}

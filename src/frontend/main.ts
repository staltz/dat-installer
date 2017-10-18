import xs, { Stream } from "xstream";
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
import addition, { State as AdditionState } from "./screens/addition";
import details, { State as DetailsState } from "./screens/details";

type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
  http: HTTPSource;
};

type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  onion: Stream<Reducer<State>>;
  http: Stream<RequestOptions>;
  installApk: Stream<string>;
};

type State = {
  apps: Array<AppMetadata>;
  selectedApp: string;
  addition: AdditionState;
};

const centralLens: Lens<State, CentralState> = {
  get: (parent: State) => parent,
  set: (parent: State, child: CentralState) => {
    return { ...parent, apps: child.apps };
  },
};

// Read-only
const detailsLens: Lens<State, DetailsState> = {
  get: (parent: State) => ({
    app: parent.apps.find(app => app.key === parent.selectedApp) || {
      key: "",
      peers: 0,
    },
  }),
  set: (parent: State, child: DetailsState) => {
    return parent;
  },
};

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

  const setSelectedAppReducer$ = navCommand$
    .filter(
      command =>
        command.type === "push" &&
        (command as PushCommand).screen === "DatInstaller.Details",
    )
    .map(
      (command: PushCommand) =>
        function setSelectedAppReducer(prev: State): State {
          return { ...prev, selectedApp: command.passProps.datHash };
        },
    );

  const request$ = xs
    .merge(centralSinks.http, additionSinks.http, detailsSinks.http)
    .map(req => ({
      ...(req as object),
      url: "http://localhost:8182" + req.url,
    }));

  const reducer$ = xs.merge(
    centralSinks.onion,
    additionSinks.onion,
    detailsSinks.onion,
    setSelectedAppReducer$,
  );

  return {
    screen: vdom$,
    navCommand: navCommand$,
    onion: reducer$,
    http: request$,
    installApk: detailsSinks.installApk,
  };
}

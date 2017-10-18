import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { StateSource, Reducer } from "cycle-onionify";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";
import central, { State as CentralState } from "./screens/central";
import addition, { State as AdditionState } from "./screens/addition";

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
};

type State = {
  central: CentralState;
  addition: AdditionState;
};

export default function main(sources: Sources): Sinks {
  const isolatedCentral = isolate(central, "central") as typeof main;
  const isolatedAddition = isolate(addition, "addition") as typeof main;
  const centralSinks = isolatedCentral(sources);
  const additionSinks = isolatedAddition(sources);

  const vdom$ = xs.merge(centralSinks.screen, additionSinks.screen);
  const navCommand$ = xs.merge(
    centralSinks.navCommand,
    additionSinks.navCommand
  );
  const request$ = xs.merge(centralSinks.http, additionSinks.http).map(req => ({
    ...(req as object),
    url: "http://localhost:8182" + req.url
  }));
  const reducer$ = xs.merge(centralSinks.onion, additionSinks.onion);

  return {
    screen: vdom$,
    navCommand: navCommand$,
    onion: reducer$,
    http: request$
  };
}

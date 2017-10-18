import xs, { Stream } from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { StateSource, Reducer } from "cycle-onionify";
import { HTTPSource, RequestOptions } from "@cycle/http";
import {
  ScreenVNode,
  ScreensSource,
  Command,
  DismissModalCommand,
} from "cycle-native-navigation";
import intent from "./intent";
import model, { State } from "./model";
import view from "./view";

export type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
  http: HTTPSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  onion: Stream<Reducer<State>>;
  http: Stream<RequestOptions>;
};

export { State } from "./model";

export default function addition(sources: Sources): Sinks {
  const state$ = sources.onion.state$;
  const actions = intent(sources.screen);

  const request$ = actions.submit$
    .compose(sampleCombine(state$))
    .filter(([_, state]) => state.textInput.length >= 64)
    .map(([_, state]) => ({
      url: "/datSync",
      method: "POST",
      send: { datKey: state.textInput },
    }));

  const dismissThisScreen$ = request$.mapTo({
    type: "dismissModal",
  } as DismissModalCommand);

  const reducer$ = model(actions);

  const vdom$ = view(sources.onion.state$);

  return {
    screen: vdom$,
    navCommand: dismissThisScreen$,
    onion: reducer$,
    http: request$,
  };
}

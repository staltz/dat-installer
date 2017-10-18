import xs, { Stream } from "xstream";
import sampleCombine from "xstream/extra/sampleCombine";
import { StateSource, Reducer } from "cycle-onionify";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";
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
    .map(([_, state]) => ({
      url: "/datSync",
      method: "POST",
      send: { datKey: state.textInput }
    }));

  const reducer$ = model(actions);

  const vdom$ = view(sources.onion.state$);

  return {
    screen: vdom$,
    navCommand: xs.never(),
    onion: reducer$,
    http: request$
  };
}

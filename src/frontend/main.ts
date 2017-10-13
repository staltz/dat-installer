import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import central, { Sinks as CentralSinks } from "./screens/central";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";

type Sources = {
  screen: ScreensSource;
  nodejs: Stream<string>;
};

type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  nodejs: Stream<string>;
};

export default function main(sources: Sources): Sinks {
  const centralSinks: CentralSinks = isolate(central, "central")(sources);

  const vdom$ = xs.merge(centralSinks.screen);
  const navCommand$ = xs.merge(centralSinks.navCommand);
  const nodejsRequest$ = xs.merge(centralSinks.nodejs);

  return {
    screen: vdom$,
    navCommand: navCommand$,
    nodejs: nodejsRequest$.map(req => JSON.stringify(req))
  };
}

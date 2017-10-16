import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { HTTPSource, RequestOptions } from "@cycle/http";
import central, { Sinks as CentralSinks } from "./screens/central";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";

type Sources = {
  screen: ScreensSource;
  http: HTTPSource;
};

type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  http: Stream<RequestOptions>;
};

export default function main(sources: Sources): Sinks {
  const isolatedCentral = isolate(central, "central") as typeof central;
  const centralSinks = isolatedCentral(sources);

  const vdom$ = xs.merge(centralSinks.screen);
  const navCommand$ = xs.merge(centralSinks.navCommand);
  const request$ = xs.merge(centralSinks.http).map(req => ({
    ...(req as object),
    url: "http://localhost:8182" + req.url
  }));

  return {
    screen: vdom$,
    navCommand: navCommand$,
    http: request$
  };
}

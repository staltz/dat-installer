import xs, { Stream } from "xstream";
import isolate from "@cycle/isolate";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";
import central from "./screens/central";
import addition from "./screens/addition";

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
  const isolatedAddition = isolate(addition, "addition") as typeof addition;
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

  return {
    screen: vdom$,
    navCommand: navCommand$,
    http: request$
  };
}

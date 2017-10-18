import xs, { Stream } from "xstream";
import { StateSource, Reducer } from "cycle-onionify";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { h } from "@cycle/native-screen";
import { AppMetadata } from "../../../typings/messages";

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

export type State = {
  app: AppMetadata;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 15,
  },

  header: {
    flexDirection: "row",
  },

  logo: {
    width: 80,
    height: 80,
    marginRight: 10,
    backgroundColor: "#5a88c4",
    borderRadius: 6,
  },

  details: {
    flexDirection: "column",
  },

  name: {
    fontSize: 24,
    color: "#202020",
  },

  version: {
    fontSize: 18,
    color: "#202020",
  },

  readme: {
    marginTop: 15,
    fontSize: 16,
    color: "#202020",
  },
});

export default function details(sources: Sources): Sinks {
  const vdom$ = sources.onion.state$.map(state => ({
    screen: "DatInstaller.Details",
    vdom: h(View, { style: styles.container }, [
      h(View, { style: styles.header }, [
        h(View, { style: styles.logo }),
        h(View, { style: styles.details }, [
          h(Text, { style: styles.name }, state.app.name),
          h(Text, { style: styles.version }, state.app.version),
        ]),
      ]),
      h(Text, { style: styles.readme }, state.app.changelog),
    ]),
  }));

  return {
    screen: vdom$,
    navCommand: xs.never(),
    onion: xs.never(),
    http: xs.never(),
  };
}

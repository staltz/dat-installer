import xs, { Stream } from "xstream";
import { h } from "@cycle/native-screen";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";
import { AppMetadata } from "../../../typings/messages";
import { ReactElement } from "react";
import { Platform, StyleSheet, Text, View, FlatList } from "react-native";
import ActionButton from "react-native-action-button";
const RNFS = require("react-native-fs");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: "#F5FCFF"
  },
  list: {
    alignSelf: "stretch"
  },
  listContent: {
    flex: 1,
    flexDirection: "column"
  },
  emptyList: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 100,
    paddingRight: 25,
    alignItems: "flex-end"
  },
  emptyListTitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#202020",
    margin: 10
  },
  emptyListSubtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#202020",
    margin: 10
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  info: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});

export type Sources = {
  screen: ScreensSource;
  http: HTTPSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  http: Stream<RequestOptions>;
};

const emptyListVDOM = h(View, { style: styles.emptyList }, [
  h(Text, { style: styles.emptyListTitle }, "Install an Android app!"),
  h(
    Text,
    { style: styles.emptyListSubtitle },
    "Press this button to get started"
  )
]);

function view(apps$: Stream<Array<AppMetadata>>): Stream<ScreenVNode> {
  return apps$.map(apps => ({
    screen: "DatInstaller.Central",
    vdom: h(View, { style: styles.container }, [
      apps.length === 0
        ? emptyListVDOM
        : h(FlatList, {
            style: styles.list,
            contentContainerStyle: styles.listContent,
            data: apps,
            keyExtractor: (item: AppMetadata) => item.key,
            renderItem: ({ item }: { item: AppMetadata }) => h(Text, item.key)
          }),
      h(ActionButton, {
        buttonColor: "rgb(25, 158, 51)"
      })
    ])
  }));
}

export default function main(sources: Sources): Sinks {
  const apps$ = sources.http
    .select("allApps")
    .flatten()
    .map(res => res.body.apps)
    .startWith([])
    .debug("apps");

  const pongRes$ = sources.http
    .select("ping")
    .flatten()
    .take(1);

  const vdom$ = view(apps$);

  const setStoragePathReq$ = pongRes$.mapTo({
    category: "setStoragePath",
    url: "/setStoragePath",
    method: "POST",
    send: { path: RNFS.ExternalStorageDirectoryPath + "/DatInstaller" }
  });

  const allAppsReq$ = pongRes$
    .map(() => xs.periodic(2000).startWith(null as any))
    .flatten()
    .mapTo({ category: "allApps", url: "/allApps" });

  const pingReq$ = xs
    .periodic(300)
    .startWith(0)
    .endWhen(pongRes$)
    .mapTo({ category: "ping", url: "/ping" });

  const request$ = xs.merge(pingReq$, setStoragePathReq$, allAppsReq$);

  return {
    screen: vdom$,
    navCommand: xs.never(),
    http: request$
  };
}

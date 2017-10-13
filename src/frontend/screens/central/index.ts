import xs, { Stream } from "xstream";
import { h } from "@cycle/native-screen";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";
import { Req, StartDatReq } from "../../../typings/messages";
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
  nodejs: Stream<string>;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  nodejs: Stream<Req>;
};

const emptyListVDOM = h(View, { style: styles.emptyList }, [
  h(Text, { style: styles.emptyListTitle }, "Install an Android app!"),
  h(
    Text,
    { style: styles.emptyListSubtitle },
    "Press this button to get started"
  )
]);

export default function main(sources: Sources): Sinks {
  const response$ = sources.nodejs.startWith("");

  const vdom$ = response$.map(response => ({
    screen: "DatInstaller.Central",
    vdom: h(View, { style: styles.container }, [
      h(Text, { style: styles.info }, response),
      true
        ? emptyListVDOM
        : h(FlatList, {
            style: styles.list,
            contentContainerStyle: styles.listContent,
            data: [],
            keyExtractor: (item: string) => item,
            renderItem: ({ item }: any) => h(Text, item)
          }),
      h(ActionButton, {
        buttonColor: "rgb(25, 158, 51)"
      })
    ])
  }));

  const nodejsRequest$ = xs.of({
    type: "START_DAT",
    storagePath:
      RNFS.ExternalStorageDirectoryPath +
      "/dats/778f8d955175c92e4ced5e4f5563f69bfec0c86cc6f670352c457943666fe639",
    datKey:
      "dat://778f8d955175c92e4ced5e4f5563f69bfec0c86cc6f670352c457943666fe639"
  } as StartDatReq);

  return {
    screen: vdom$,
    navCommand: xs.never(),
    nodejs: nodejsRequest$
  };
}

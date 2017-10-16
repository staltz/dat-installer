import xs, { Stream } from "xstream";
import { Platform, StyleSheet, Text, View, FlatList } from "react-native";
import { ScreenVNode } from "cycle-native-navigation";
import { h } from "@cycle/native-screen";
import ActionButton from "react-native-action-button";
import { AppMetadata } from "../../../typings/messages";

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

const emptyListVDOM = h(View, { style: styles.emptyList }, [
  h(Text, { style: styles.emptyListTitle }, "Install an Android app!"),
  h(
    Text,
    { style: styles.emptyListSubtitle },
    "Press this button to get started"
  )
]);

export default function view(
  apps$: Stream<Array<AppMetadata>>
): Stream<ScreenVNode> {
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
        selector: "addApp",
        buttonColor: "rgb(25, 158, 51)"
      })
    ])
  }));
}

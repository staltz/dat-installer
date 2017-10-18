import xs, { Stream } from "xstream";
import { PureComponent } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { ScreenVNode } from "cycle-native-navigation";
import { h } from "@cycle/native-screen";
import ActionButton from "react-native-action-button";
import { AppMetadata } from "../../../typings/messages";
import { State } from "./model";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: "#e9ecef",
  },

  list: {
    alignSelf: "stretch",
  },

  listContent: {
    flex: 1,
    flexDirection: "column",
  },

  separator: {
    height: 1,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: "#ffffff",
  },

  item: {
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },

  firstItem: {
    marginTop: 5,
  },

  lastItem: {
    marginBottom: 5,
  },

  appDetails: {
    flexDirection: "column",
  },

  appTitle: {
    fontSize: 16,
    maxWidth: 160,
    color: "#202020",
  },

  appSubtitle: {
    fontSize: 14,
    color: "#202020",
  },

  logoPlaceholder: {
    width: 40,
    height: 40,
    marginRight: 10,
    backgroundColor: "#5a88c4",
    borderRadius: 6,
  },

  emptyList: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 100,
    paddingRight: 25,
    marginTop: 5,
    alignItems: "flex-end",
  },

  emptyListTitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#202020",
    margin: 10,
  },

  emptyListSubtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#202020",
    margin: 10,
  },

  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },

  info: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5,
  },
});

const emptyListVDOM = h(View, { style: styles.emptyList }, [
  h(Text, { style: styles.emptyListTitle }, "Install an Android app!"),
  h(
    Text,
    { style: styles.emptyListSubtitle },
    "Press this button to get started",
  ),
]);

/**
 * We need this in order to know the array length inside renderItem()
 * so that the last list item is rendered with "last item" styles.
 */
type HackyTotalLength = {
  _hack: number;
};

function renderItem({
  item,
  index,
}: {
  item: AppMetadata & HackyTotalLength;
  index: number;
}) {
  const style = [styles.item];
  if (index === 0) {
    style.push(styles.firstItem);
  }
  if (index === item._hack - 1) {
    style.push(styles.lastItem);
  }

  return h(View, { style }, [
    h(View, { style: styles.logoPlaceholder }),
    h(View, { style: styles.appDetails }, [
      h(Text, { style: styles.appTitle }, item.name ? item.name : item.key),
      h(
        Text,
        {
          style: styles.appSubtitle,
          numberOfLines: 1,
          ellipsizeMode: "middle",
        },
        item.version ? item.version : String(item.peers),
      ),
    ]),
  ]);
}

class Separator extends PureComponent<any> {
  public render() {
    return h(View, { style: styles.separator });
  }
}

export default function view(state$: Stream<State>): Stream<ScreenVNode> {
  return state$.map(state => {
    for (let i = 0, n = state.apps.length; i < n; i++) {
      (state.apps[i] as AppMetadata & HackyTotalLength)._hack = n;
    }

    return {
      screen: "DatInstaller.Central",
      vdom: h(View, { style: styles.container }, [
        state.apps.length === 0
          ? emptyListVDOM
          : h(FlatList, {
              style: styles.list,
              contentContainerStyle: styles.listContent,
              data: state.apps,
              keyExtractor: (item: AppMetadata) => item.key,
              ItemSeparatorComponent: Separator,
              renderItem: renderItem,
            }),
        h(ActionButton, {
          selector: "addApp",
          buttonColor: "rgb(25, 158, 51)",
        }),
      ]),
    };
  });
}

import xs, { Stream } from "xstream";
import { PureComponent } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableNativeFeedback,
} from "react-native";
import { ScreenVNode } from "cycle-native-navigation";
import { h } from "@cycle/native-screen";
import ActionButton from "react-native-action-button";
import * as Progress from "react-native-progress";
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
    marginLeft: 10,
  },

  appTitle: {
    fontSize: 16,
    maxWidth: 180,
    color: "#202020",
  },

  appSubtitle: {
    fontSize: 14,
    color: "#5e5e5e",
  },

  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
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

class Separator extends PureComponent<any> {
  public render() {
    return h(View, { style: styles.separator });
  }
}

type AppListProps = {
  apps: {
    [datHash: string]: AppMetadata;
  };
  onPressApp?: (ev: { datHash: string }) => void;
};

const placeholder = h(View, { style: styles.emptyList }, [
  h(Text, { style: styles.emptyListTitle }, "Install an Android app!"),
  h(
    Text,
    { style: styles.emptyListSubtitle },
    "Press this button to get started",
  ),
]);

function renderLogo(item: AppMetadata) {
  if (item.package) {
    return h(Image, {
      source: {
        uri: `http://localhost:8182/icon/${item.package}.png`,
      },
      style: styles.logo,
    });
  } else {
    return h(Progress.CircleSnail, {
      indeterminate: true,
      size: 40,
      color: "#199E33",
    });
  }
}

function renderTitle(item: AppMetadata) {
  return h(
    Text,
    {
      style: styles.appTitle,
      numberOfLines: 1,
      ellipsizeMode: "middle",
    },
    item.label ? item.label : item.key,
  );
}

function renderSubtitle(item: AppMetadata) {
  return h(
    Text,
    {
      style: styles.appSubtitle,
      numberOfLines: 1,
      ellipsizeMode: "middle",
    },
    item.version
      ? item.version
      : item.peers > 0
        ? `Downloading from ${item.peers} peers...`
        : "Searching...",
  );
}

class AppList extends PureComponent<AppListProps> {
  public render() {
    const apps = this.props.apps;
    const data = Object.keys(apps)
      .filter(key => key.length >= 64)
      .map(key => apps[key]);
    const onPressApp = this.props.onPressApp;

    if (data.length) {
      return h(FlatList, {
        style: styles.list,
        contentContainerStyle: styles.listContent,
        data,
        keyExtractor: (item: AppMetadata) => item.key,
        ItemSeparatorComponent: Separator,
        renderItem: ({ item, index }: { item: AppMetadata; index: number }) => {
          const style = [styles.item];
          if (index === 0) style.push(styles.firstItem);
          if (index === data.length - 1) style.push(styles.lastItem);

          const touchableProps = {
            background: TouchableNativeFeedback.SelectableBackground(),
            onPress: () => {
              if (onPressApp) onPressApp({ datHash: item.key });
            },
          };

          return h(TouchableNativeFeedback, touchableProps, [
            h(View, { style }, [
              renderLogo(item),
              h(View, { style: styles.appDetails }, [
                renderTitle(item),
                renderSubtitle(item),
              ]),
            ]),
          ]);
        },
      });
    } else {
      return placeholder;
    }
  }
}

export default function view(state$: Stream<State>): Stream<ScreenVNode> {
  return state$.map(state => ({
    screen: "DatInstaller.Central",
    vdom: h(View, { style: styles.container }, [
      h(AppList, { selector: "appList", apps: state.apps }),
      h(ActionButton, {
        selector: "addApp",
        buttonColor: "rgb(25, 158, 51)",
      }),
    ]),
  }));
}

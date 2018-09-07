/*!
* Dat Installer is a mobile app for distributing, installing and updating
* Android APK files.
*
* Copyright (C) 2017 Andre 'Staltz' Medeiros
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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
import { palette } from "../../styles";
import { State } from "./model";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: palette.almostWhite,
  },

  beforeReadySpinner: {
    alignSelf: "center",
    marginTop: 40,
    marginBottom: 15,
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
    backgroundColor: palette.white,
  },

  item: {
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: palette.white,
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
    color: palette.text,
  },

  appSubtitle: {
    fontSize: 14,
    color: palette.gray,
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
    color: palette.text,
    margin: 10,
  },

  info: {
    fontSize: 15,
    textAlign: "center",
    color: palette.text,
    margin: 10,
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
  h(Text, { style: styles.info }, "Press this button to get started"),
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
      color: palette.mainGreen,
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

const beforeReady = h(View, { style: styles.container }, [
  h(Progress.CircleSnail, {
    style: styles.beforeReadySpinner,
    indeterminate: true,
    size: 100,
    color: palette.mainGreen,
  }),
  h(Text, { style: styles.info }, "Starting up..."),
]);

function renderWhenReady(state: State) {
  return h(View, { style: styles.container }, [
    h(AppList, { selector: "appList", apps: state.apps }),
    h(ActionButton, {
      selector: "addApp",
      buttonColor: "rgb(25, 158, 51)",
    }),
  ]);
}

export default function view(state$: Stream<State>): Stream<ScreenVNode> {
  return state$.map(state => ({
    screen: "DatInstaller.Central",
    vdom: state.backendReady ? renderWhenReady(state) : beforeReady,
  }));
}

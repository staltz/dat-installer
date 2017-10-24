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
import sampleCombine from "xstream/extra/sampleCombine";
import { StateSource, Reducer } from "cycle-onionify";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";
import {
  StyleSheet,
  Text,
  ScrollView,
  Image,
  View,
  FlatList,
  TouchableNativeFeedback,
} from "react-native";
import { createElement } from "react";
import { h } from "@cycle/native-screen";
import Markdown from "react-native-simple-markdown";
import { palette } from "../../styles";
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
  installApk: Stream<string>;
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
  },

  header: {
    flexDirection: "row",
    padding: 15,
  },

  logo: {
    width: 64,
    height: 64,
    marginRight: 10,
    borderRadius: 6,
  },

  details: {
    flexDirection: "column",
  },

  name: {
    fontSize: 24,
    color: palette.text,
  },

  version: {
    fontSize: 18,
    color: palette.text,
  },

  readmeContainer: {
    marginTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },

  readmeFooter: {
    height: 20,
  },

  installContainer: {
    width: 120,
    alignSelf: "flex-end",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight: 15,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: palette.mainGreen,
  },

  installText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: palette.white,
  },
});

export const mdStyles = StyleSheet.create({
  blockQuote: {
    flexDirection: "row",
    backgroundColor: palette.almostWhite,
    marginTop: 8,
    marginBottom: 8,
  },

  blockQuoteSectionBar: {
    width: 3,
    backgroundColor: palette.gray,
    marginRight: 8,
  },

  blockQuoteText: {
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 4,
    paddingBottom: 5,
    color: palette.text,
  },

  codeBlock: {
    backgroundColor: palette.almostWhite,
    color: palette.text,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 2,
    fontFamily: "monospace",
  },

  inlineCode: {
    backgroundColor: palette.almostWhite,
    color: palette.text,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 2,
    fontFamily: "monospace",
  },

  em: {
    fontStyle: "italic",
  },

  heading: {
    fontWeight: "bold",
  },

  heading1: {
    fontSize: 20,
  },

  heading2: {
    fontSize: 18,
  },

  heading3: {
    fontSize: 16,
  },

  heading4: {
    fontSize: 15,
    fontWeight: "bold",
  },

  heading5: {
    fontSize: 14,
    fontWeight: "bold",
  },

  heading6: {
    fontSize: 13,
    fontWeight: "bold",
  },

  hr: {
    backgroundColor: palette.gray,
    height: 2,
  },

  image: {
    width: 640,
    height: 480,
  },

  list: {
    marginTop: 5,
    marginBottom: 15,
  },

  link: {
    textDecorationLine: "underline",
  },

  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
    marginBottom: 3,
  },

  listItemBullet: {
    alignSelf: "center",
    marginRight: 3,
  },

  listItemNumber: {
    fontWeight: "bold",
  },

  mailTo: {
    textDecorationLine: "underline",
  },

  paragraph: {
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginTop: 5,
    marginBottom: 5,
  },

  listItemText: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    color: palette.text,
  },

  text: {
    color: palette.text,
  },

  video: {
    width: 300,
    height: 300,
  },
});

const rules = {
  inlineCode: {
    react: (node: any, output: any, state: any) => {
      state.withinText = true;
      return createElement(
        Text,
        { key: state.key, style: mdStyles.inlineCode },
        node.content,
      );
    },
  },

  codeBlock: {
    react: (node: any, output: any, state: any) => {
      state.withinText = true;
      return createElement(
        Text,
        {
          key: state.key,
          style: mdStyles.codeBlock,
        },
        node.content,
      );
    },
  },

  blockQuote: {
    react: (node: any, output: any, state: any) => {
      const wasWithinQuote = !!state.withinQuote;
      state.withinText = true;
      state.withinQuote = true;

      const blockBar = createElement(View, {
        key: state.key,
        style: mdStyles.blockQuoteSectionBar,
      });

      const blockText = createElement(
        Text,
        { key: state.key + 1, style: mdStyles.blockQuoteText },
        output(node.content, state),
      );

      state.withinQuote = wasWithinQuote;
      return createElement(
        View,
        { key: state.key, style: mdStyles.blockQuote },
        [blockBar, blockText],
      );
    },
  },

  text: {
    react: (node: any, output: any, state: any) => {
      if (state.withinQuote) {
        return createElement(
          Text,
          { key: state.key, style: mdStyles.blockQuoteText },
          node.content,
        );
      } else {
        return createElement(
          Text,
          { key: state.key, style: mdStyles.text },
          node.content,
        );
      }
    },
  },
};

export default function details(sources: Sources): Sinks {
  const state$ = sources.onion.state$;

  const installApk$ = sources.screen
    .select("install")
    .events("press")
    .compose(sampleCombine(state$))
    .map(([_, state]) => state.app.apkFullPath as string);

  const vdom$ = state$.map(state => ({
    screen: "DatInstaller.Details",
    vdom: h(View, { style: styles.container }, [
      h(View, { style: styles.header }, [
        h(Image, {
          source: {
            uri: `http://localhost:8182/icon/${state.app.package}.png`,
          },
          style: styles.logo,
        }),
        h(View, { style: styles.details }, [
          h(
            Text,
            { style: styles.name, numberOfLines: 1, ellipsizeMode: "middle" },
            state.app.label ? state.app.label : state.app.key,
          ),
          h(
            Text,
            {
              style: styles.version,
              numberOfLines: 1,
              ellipsizeMode: "middle",
            },
            state.app.version,
          ),
        ]),
      ]),
      h(
        TouchableNativeFeedback,
        {
          selector: "install",
          background: TouchableNativeFeedback.SelectableBackground(),
        },
        [
          h(View, { style: styles.installContainer }, [
            h(Text, { style: styles.installText }, "Install"),
          ]),
        ],
      ),
      h(ScrollView, { style: styles.readmeContainer }, [
        h(Markdown, { styles: mdStyles, rules }, state.app.readme),
        h(View, { style: styles.readmeFooter }),
      ]),
    ]),
  }));

  return {
    screen: vdom$,
    navCommand: xs.never(),
    onion: xs.never(),
    http: xs.never(),
    installApk: installApk$,
  };
}

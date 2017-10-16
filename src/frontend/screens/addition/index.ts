import xs, { Stream } from "xstream";
import { h } from "@cycle/native-screen";
import {
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
  TouchableNativeFeedback,
  View,
  TextInput
} from "react-native";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { ScreenVNode, ScreensSource, Command } from "cycle-native-navigation";

export type Sources = {
  screen: ScreensSource;
  http: HTTPSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  http: Stream<RequestOptions>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: "#F5FCFF"
  },

  info: {
    fontSize: 16,
    textAlign: "left",
    color: "#202020",
    marginTop: 16,
    marginLeft: 20,
    marginRight: 20
  },

  input: {
    fontSize: 16,
    marginLeft: 20,
    marginRight: 20
  },

  buttonContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: "#199E33"
  },

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff"
  }
});

export default function addition(sources: Sources): Sinks {
  const request$ = sources.screen
    .select("doneAdd")
    .events("press")
    .mapTo({
      url: "/datSync",
      method: "POST",
      send: { datKey: "1029310239102" }
    });

  const vdom$ = xs.of({
    screen: "DatInstaller.Addition",
    vdom: h(View, { style: styles.container }, [
      h(Text, { style: styles.info }, "Paste a Dat link here:"),
      h(TextInput, {
        style: styles.input,
        placeholder: "dat://1a2a3c45d67e89f"
      }),
      h(
        TouchableNativeFeedback,
        {
          selector: "doneAdd",
          background: TouchableNativeFeedback.SelectableBackground()
        },
        [
          h(View, { style: styles.buttonContainer }, [
            h(Text, { style: styles.buttonText }, "Add")
          ])
        ]
      )
    ])
  });

  return {
    screen: vdom$,
    navCommand: xs.never(),
    http: request$
  };
}

import xs, { Stream } from "xstream";
import { h, ScreenSource } from "@cycle/native-screen";
import { ReactElement } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});

type Sources = {
  screen: ScreenSource;
  nodejs: Stream<string>;
};

type Sinks = {
  screen: Stream<ReactElement<any>>;
  nodejs: Stream<string>;
};

export default function main(sources: Sources): Sinks {
  const vdom$ = xs.of(
    h(View, { style: styles.container }, [
      h(Text, { style: styles.welcome }, "Dat Installer"),
      h(
        Text,
        { style: styles.instructions },
        "Double tap R to reload, or shake"
      )
    ])
  );

  sources.nodejs.addListener({
    next: x => {
      console.log("Cycle app got from nodejs:", x);
    }
  });

  return {
    screen: vdom$,
    nodejs: xs.never()
  };
}

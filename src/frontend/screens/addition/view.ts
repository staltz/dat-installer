import xs, { Stream } from "xstream";
import { h } from "@cycle/native-screen";
import {
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
  TextInput,
} from "react-native";
import { ScreenVNode } from "cycle-native-navigation";
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

  info: {
    fontSize: 16,
    textAlign: "left",
    color: palette.text,
    marginTop: 16,
    marginLeft: 20,
    marginRight: 20,
  },

  input: {
    fontSize: 16,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
  },

  buttonContainer: {
    width: 120,
    alignSelf: "flex-end",
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: palette.grayLight,
  },

  buttonContainerValid: {
    backgroundColor: palette.mainGreen,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: palette.white,
  },
});

export default function view(state$: Stream<State>): Stream<ScreenVNode> {
  return state$.map(state => {
    const looksValid = state.textInput.length >= 64;
    const buttonStyle = [styles.buttonContainer];
    if (looksValid) {
      buttonStyle.push(styles.buttonContainerValid);
    }

    return {
      screen: "DatInstaller.Addition",
      vdom: h(View, { style: styles.container }, [
        h(Text, { style: styles.info }, "Paste a Dat link here:"),
        h(TextInput, {
          selector: "inputAdd",
          multiline: false,
          autoFocus: true,
          style: styles.input,
          placeholder: "dat://1a2a3c45d67e89f",
          placeholderTextColor: palette.grayLight,
        }),
        h(
          TouchableNativeFeedback,
          {
            selector: "doneAdd",
            background: TouchableNativeFeedback.SelectableBackground(),
          },
          [
            h(View, { style: buttonStyle }, [
              h(Text, { style: styles.buttonText }, "Add"),
            ]),
          ],
        ),
      ]),
    };
  });
}

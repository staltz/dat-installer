import xs, { Stream } from "xstream";
import { ScreensSource } from "cycle-native-navigation";
import { Actions } from "./model";

export default function intent(screenSource: ScreensSource) {
  return {
    goToAddition$: screenSource
      .select("addApp")
      .events("press")
      .mapTo(null),
  };
}

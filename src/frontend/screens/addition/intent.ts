import { ScreensSource } from "cycle-native-navigation";

export default function intent(screenSource: ScreensSource) {
  return {
    submit$: screenSource
      .select("doneAdd")
      .events("press")
      .mapTo(null),

    updateText$: screenSource.select("inputAdd").events("changeText"),
  };
}

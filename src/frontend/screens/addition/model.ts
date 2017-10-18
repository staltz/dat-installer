import xs, { Stream } from "xstream";
import { Reducer } from "cycle-onionify";

export type Actions = {
  submit$: Stream<null>;
  updateText$: Stream<string>;
};

export type State = {
  textInput: string;
};

export default function model(actions: Actions): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev: State): State {
    return prev || { textInput: "" };
  });

  const updateReducer$ = actions.updateText$.map(
    nextText =>
      function updateReducer(prev: State): State {
        return { ...prev, textInput: nextText };
      }
  );

  return xs.merge(initReducer$, updateReducer$);
}

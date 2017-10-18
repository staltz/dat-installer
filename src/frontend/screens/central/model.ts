import xs, { Stream } from "xstream";
import { Reducer } from "cycle-onionify";
import { AppMetadata } from "../../../typings/messages";

export type Actions = {
  goToAddition$: Stream<null>;
  updateApps$: Stream<Array<AppMetadata>>;
};

export type State = {
  apps: Array<AppMetadata>;
};

export default function model(actions: Actions): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev: State): State {
    return prev || { apps: [] };
  });

  const updateAppsReducer$ = actions.updateApps$.map(
    apps =>
      function updateAppsReducer(prev: State): State {
        return { ...prev, apps };
      }
  );

  return xs.merge(initReducer$, updateAppsReducer$);
}

import xs, { Stream } from "xstream";
import { Reducer } from "cycle-onionify";
import { AppMetadata } from "../../../typings/messages";

export type Actions = {
  goToAddition$: Stream<null>;
  goToDetails$: Stream<{ datHash: string }>;
  updateApps$: Stream<{ [k: string]: AppMetadata }>;
};

export type State = {
  apps: {
    [datHash: string]: AppMetadata;
  };
};

export default function model(actions: Actions): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev: State): State {
    return prev || { apps: {} };
  });

  const updateAppsReducer$ = actions.updateApps$.map(
    apps =>
      function updateAppsReducer(prev: State): State {
        const next: State = { ...prev };
        Object.keys(apps).forEach(key => {
          if (!next.apps[key]) {
            next.apps[key] = apps[key];
          } else if (next.apps[key].apkFullPath !== apps[key].apkFullPath) {
            next.apps[key].apkFullPath = apps[key].apkFullPath;
          } else if (next.apps[key].readme !== apps[key].readme) {
            next.apps[key].readme = apps[key].readme;
          }
        });
        return next;
      },
  );

  return xs.merge(initReducer$, updateAppsReducer$);
}

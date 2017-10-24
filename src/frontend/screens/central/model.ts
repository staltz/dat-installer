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
        let next: State | undefined = undefined;
        Object.keys(apps).forEach(key => {
          if (!prev.apps[key]) {
            next = next || { ...prev };
            next.apps[key] = apps[key];
          } else if (prev.apps[key].apkFullPath !== apps[key].apkFullPath) {
            next = next || { ...prev };
            next.apps[key].apkFullPath = apps[key].apkFullPath;
          } else if (prev.apps[key].readme !== apps[key].readme) {
            next = next || { ...prev };
            next.apps[key].readme = apps[key].readme;
          } else if (prev.apps[key].peers !== apps[key].peers) {
            next = next || { ...prev };
            next.apps[key].peers = apps[key].peers;
          }
        });
        return next ? next : prev;
      },
  );

  return xs.merge(initReducer$, updateAppsReducer$);
}

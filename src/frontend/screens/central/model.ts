import xs, { Stream } from "xstream";
import { Reducer } from "cycle-onionify";
import { AppMetadata } from "../../../typings/messages";

export type Actions = {
  goToAddition$: Stream<null>;
  goToDetails$: Stream<{ datHash: string }>;
  updateFromBackend$: Stream<{
    apps: { [k: string]: AppMetadata };
    backendReady: boolean;
  }>;
};

export type State = {
  apps: {
    [datHash: string]: AppMetadata;
  };
  backendReady: boolean;
};

export default function model(actions: Actions): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(prev: State): State {
    return prev || { apps: {}, backendReady: false };
  });

  const updateReducer$ = actions.updateFromBackend$.map(
    backendState =>
      function updateAppsReducer(prev: State): State {
        let next: State | undefined = undefined;
        const apps = backendState.apps;
        if (prev.backendReady !== backendState.backendReady) {
          next = next || { ...prev };
          next.backendReady = backendState.backendReady;
        }
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

  return xs.merge(initReducer$, updateReducer$);
}

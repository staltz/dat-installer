/*!
* Dat Installer is a mobile app for distributing, installing and updating
* Android APK files.
*
* Copyright (C) 2017 Andre 'Staltz' Medeiros
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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

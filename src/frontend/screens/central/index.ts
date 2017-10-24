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
import { HTTPSource, RequestOptions as Request } from "@cycle/http";
import { StateSource, Reducer } from "cycle-onionify";
import {
  ScreenVNode,
  ScreensSource,
  Command,
  ShowModalCommand,
  PushCommand,
} from "cycle-native-navigation";
import { AppMetadata } from "../../../typings/messages";
import { navigatorStyle } from "../../styles";
import view from "./view";
import intent from "./intent";
import model, { State, Actions } from "./model";
const RNFS = require("react-native-fs");

export type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
  http: HTTPSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  onion: Stream<Reducer<State>>;
  http: Stream<Request>;
};

export { State } from "./model";

function httpIntent(httpSource: HTTPSource) {
  const pingRes$ = httpSource.select("ping").flatten();

  return {
    updateFromBackend$: httpSource
      .select("latest")
      .flatten()
      .map(res => res.body),

    startAllowingOtherRequests$: pingRes$
      .replaceError(err => pingRes$)
      .take(1)
      .mapTo(null),
  };
}

function httpRequests(start$: Stream<null>): Stream<Request> {
  const pingReq$ = xs
    .periodic(300)
    .startWith(0)
    .endWhen(start$)
    .mapTo({ category: "ping", url: "/ping" });

  const setStoragePathReq$ = start$.mapTo({
    category: "setStoragePath",
    url: "/setStoragePath",
    method: "POST",
    send: { path: RNFS.ExternalStorageDirectoryPath + "/DatInstaller" },
  });

  const latestReq$ = start$
    .map(() => xs.periodic(2000).startWith(null as any))
    .flatten()
    .mapTo({ category: "latest", url: "/latest" });

  return xs.merge(pingReq$, setStoragePathReq$, latestReq$);
}

function navigation(actions: Actions): Stream<Command> {
  const goToAddition$ = actions.goToAddition$.mapTo({
    type: "showModal",
    screen: "DatInstaller.Addition",
    title: "Add an Android app",
    navigatorStyle: navigatorStyle,
  } as ShowModalCommand);

  const goToDetails$ = actions.goToDetails$.map(
    ev =>
      ({
        type: "push",
        screen: "DatInstaller.Details",
        title: "",
        navigatorStyle: navigatorStyle,
        passProps: ev,
      } as PushCommand),
  );

  return xs.merge(goToAddition$, goToDetails$);
}

export default function central(sources: Sources): Sinks {
  const httpActions = httpIntent(sources.http);
  const actions = { ...intent(sources.screen), ...httpActions };
  const navCommand$ = navigation(actions as Actions);
  const reducer$ = model(actions as Actions);
  const vdom$ = view(sources.onion.state$);
  const request$ = httpRequests(httpActions.startAllowingOtherRequests$);

  return {
    screen: vdom$,
    navCommand: navCommand$,
    onion: reducer$,
    http: request$,
  };
}

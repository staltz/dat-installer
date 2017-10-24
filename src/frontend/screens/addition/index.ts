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
import sampleCombine from "xstream/extra/sampleCombine";
import { StateSource, Reducer } from "cycle-onionify";
import { HTTPSource, RequestOptions } from "@cycle/http";
import {
  ScreenVNode,
  ScreensSource,
  Command,
  DismissModalCommand,
} from "cycle-native-navigation";
import intent from "./intent";
import model, { State } from "./model";
import view from "./view";

export type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
  http: HTTPSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navCommand: Stream<Command>;
  onion: Stream<Reducer<State>>;
  http: Stream<RequestOptions>;
  newDat: Stream<string>;
};

export { State } from "./model";

export default function addition(sources: Sources): Sinks {
  const state$ = sources.onion.state$;
  const actions = intent(sources.screen);

  const addDat$ = actions.submit$
    .compose(sampleCombine(state$))
    .filter(([_, state]) => state.textInput.length >= 64)
    .map(([_, state]) => state.textInput);

  const request$ = addDat$.map(datHash => ({
    url: "/datSync",
    method: "POST",
    send: { datKey: datHash },
  }));

  const dismissThisScreen$ = addDat$.mapTo({
    type: "dismissModal",
  } as DismissModalCommand);

  const reducer$ = model(actions);

  const vdom$ = view(sources.onion.state$);

  return {
    screen: vdom$,
    navCommand: dismissThisScreen$,
    onion: reducer$,
    http: request$,
    newDat: addDat$,
  };
}

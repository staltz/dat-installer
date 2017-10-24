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
      },
  );

  return xs.merge(initReducer$, updateReducer$);
}

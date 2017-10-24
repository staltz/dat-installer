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

import { Observable } from "rxjs";
const Dat = require("dat-node");

export const createDat = Observable.bindNodeCallback<string, any, any>(Dat);

export function readFileInDat(
  dat: any,
  file: string,
  encoding: string,
): Observable<string> {
  return Observable.bindNodeCallback<string, string, string>(
    dat.archive.readFile.bind(dat.archive),
  )(file, encoding);
}

export function downloadFileFromDat(dat: any, file: string): Observable<null> {
  return Observable.bindNodeCallback<string, null>(
    dat.archive.download.bind(dat.archive),
  )(file);
}

export function readFileFromDat(dat: any, file: string): Observable<null> {
  return Observable.bindNodeCallback<string, null>(
    dat.archive.readFile.bind(dat.archive),
  )(file);
}

export function joinNetwork(dat: any): Observable<any> {
  return Observable.bindNodeCallback<any>(dat.joinNetwork.bind(dat))();
}

export function looksLikeDatHash(str: string): boolean {
  return str.length === 64;
}

export function trimProtocolPrefix(str: string): string {
  const parts = str.split("/");
  const datHash = parts[parts.length - 1];
  return datHash;
}

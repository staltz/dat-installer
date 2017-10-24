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
import flattenConcurrently from "xstream/extra/flattenConcurrently";
import { NativeModules } from "react-native";
const path = require("path");
const PackageInfo = NativeModules.PackageInfo;

export interface PackageInfo {
  package: string;
  label: string;
  versionName: string;
  versionCode: number;
  firstInstallTime: number;
  lastUpdateTime: number;
}

export type InfoReq = {
  datHash: string;
  path: string;
};

export type InfoRes = {
  datHash: string;
  info: PackageInfo;
};

export default function packageInfoDriver(
  sink: Stream<InfoReq>,
): Stream<InfoRes> {
  const source = sink
    .map(req => {
      const apkPath = req.path;
      const iconsPath = path.join(apkPath, "../../icons");
      return xs
        .fromPromise(PackageInfo.getPackageInfo(apkPath, iconsPath))
        .map(info => ({ datHash: req.datHash, info: info as PackageInfo }));
    })
    .compose(flattenConcurrently)
    .remember();

  source.addListener({
    error: e => {
      console.error(e);
    },
  });

  return source;
}

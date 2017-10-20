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

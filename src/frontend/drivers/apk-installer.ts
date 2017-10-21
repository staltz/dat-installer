import xs, { Stream } from "xstream";
const ApkInstaller = require("react-native-apk-installer");

export default function apkInstallerDriver(fullPath$: Stream<string>): void {
  fullPath$.addListener({
    next: fullPath => ApkInstaller.install(fullPath),
    error: e => console.error(e),
  });
}

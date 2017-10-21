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

import { Observable } from "rxjs";
const Dat = require("dat-node");

export const createDat = Observable.bindNodeCallback<string, any, any>(Dat);

export function joinNetwork(dat: any): Observable<any> {
  return Observable.bindNodeCallback(dat.joinNetwork.bind(dat))();
}

export function looksLikeDatHash(str: string): boolean {
  return str.length === 64;
}

import { Observable } from "rxjs";
import { Stats } from "fs";
const Dat = require("dat-node");
const fs = require("fs");

export const createDat = Observable.bindNodeCallback<string, any, any>(Dat);

export function joinNetwork(dat: any): Observable<any> {
  return Observable.bindNodeCallback(dat.joinNetwork.bind(dat))();
}

export const fsreaddir = Observable.bindNodeCallback<string, Array<string>>(
  fs.readdir
);

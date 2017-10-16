import { Observable } from "rxjs";
import {
  Req,
  SetStoragePathReq,
  DatSyncReq,
  Res,
  AllAppsRes,
  AppMetadata,
  ErrorRes,
  DatEventRes
} from "../typings/messages";
import { createDat, joinNetwork, fsreaddir } from "./utils";
import { Request, Response } from "express";
const express = require("express");
const Dat = require("dat-node");
const path = require("path");
const Rx = require("rxjs");
const fs = require("fs");

const server = express();

function isSetStoragePathReq(req: Req): req is SetStoragePathReq {
  return req.type === "SET_STORAGE_PATH";
}
function isDatSyncReq(req: Req): req is DatSyncReq {
  return req.type === "DAT_SYNC";
}

server.get("/ping", (req: Request, res: Response) => {
  res.json({ msg: "pong" });
});

server.post("/setStoragePath", (req: Request, res: Response) => {
  res.json({ msg: "TODO, set storage path here" });
});

server.listen(8182);

// const request$: Observable<Req> = (Observable.bindNodeCallback as any)(
//   rn_bridge.channel.on.bind(rn_bridge.channel)
// )("message").map((message: string) => JSON.parse(message));

// const storagePath$: Observable<string> = request$
//   .filter(isSetStoragePathReq)
//   .map(req => req.path)
//   .do(path => sendResponse({ type: "storagePath", message: path } as any))
//   .publishReplay(1)
//   .refCount();

// const datRes$ = request$
//   .filter(isDatSyncReq)
//   .combineLatest(storagePath$)
//   .do(arr => sendResponse({ type: "combineLatest", message: arr } as any))
//   .mergeMap(arr => {
//     const req = arr[0];
//     const storagePath = arr[1];
//     const datHash = req.datKey.split("dat://")[1];
//     const datPath = path.join(storagePath, "DatInstaller", datHash);
//     return createDat(datPath, { key: req.datKey });
//   })
//   .mergeMap(dat => joinNetwork(dat).mapTo(dat))
//   .map(
//     dat =>
//       ({
//         type: "DAT_EVENT",
//         peers: dat.network.connected
//       } as DatEventRes)
//   );
// .catch(err =>
//   Observable.of({ type: "ERROR", message: String(err) } as ErrorRes)
// );

// const allAppsRes$ = storagePath$
//   .switchMap(path => fsreaddir(path))
//   .do(files => sendResponse({ type: "fsreaddir", message: files } as any))
//   .map(files =>
//     files.filter(file => fs.lstatSync(file).isDirectory()).map(
//       file =>
//         ({
//           key: file,
//           name: "<App name>",
//           version: "<App version>",
//           peers: 0
//         } as AppMetadata)
//     )
//   )
//   .do(apps => sendResponse({ type: "apps", message: apps } as any))
//   .map(apps => ({ type: "ALL_APPS", apps } as AllAppsRes));

// const response$: Observable<Res> = Observable.merge(datRes$, allAppsRes$);

// function sendResponse(res: Res): void {
//   const msg = JSON.stringify(res);
//   rn_bridge.channel.send(msg);
// }

// response$.subscribe({
//   next: sendResponse,
//   error: e => {
//     sendResponse({ type: "ERROR", message: "Unexpected error: " + e });
//   }
// });

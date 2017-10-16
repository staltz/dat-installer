import { Observable, Subject, ReplaySubject } from "rxjs";
import { AppMetadata } from "../typings/messages";
import { createDat, joinNetwork, looksLikeDatHash } from "./utils";
import { Request, Response } from "express";
const bodyParser = require("body-parser");
const express = require("express");
const Dat = require("dat-node");
const path = require("path");
const Rx = require("rxjs");
const fs = require("fs");

console.log("Initializing express app and Dat peer");

const server = express();
server.use(bodyParser.json());

const storagePath$: ReplaySubject<string> = new Rx.ReplaySubject(1);
const startDatSync$: Subject<string> = new Subject();

type State = {
  [key: string]: AppMetadata;
};

let global_state: State = {};

server.get("/ping", (req: Request, res: Response) => {
  res.json({ msg: "pong" });
});

server.post("/setStoragePath", (req: Request, res: Response) => {
  storagePath$.next(req.body.path);
  res.sendStatus(200);
});

server.post("/datSync", (req: Request, res: Response) => {
  startDatSync$.next(req.body.datKey);
  res.sendStatus(200);
});

server.get("/allApps", (req: Request, res: Response) => {
  const allApps = Object.keys(global_state)
    .filter(looksLikeDatHash)
    .map(key => global_state[key]);
  res.json({ apps: allApps });
});

// Read cold stored Dats and start syncing them
storagePath$
  .take(1)
  .map(storagePath =>
    (fs.readdirSync(storagePath) as Array<string>)
      .filter(looksLikeDatHash)
      .filter(file => {
        const fullPath = path.join(storagePath, file);
        return fs.lstatSync(fullPath).isDirectory();
      })
  )
  .switchMap(files => Rx.Observable.from(files))
  .subscribe({
    next: (datDir: string) => {
      const parts = datDir.split("/");
      const datHash = parts[parts.length - 1];
      startDatSync$.next(datHash);
    }
  });

// Start syncing Dats detected by the backend
startDatSync$
  .withLatestFrom(storagePath$)
  .switchMap(arr => {
    const datHash = arr[0];
    const storagePath = arr[1];
    const datKey = "dat://" + datHash;
    const datPath = path.join(storagePath, datHash);
    return createDat(datPath, { key: datKey });
  })
  .switchMap(dat => joinNetwork(dat).mapTo(dat))
  .subscribe({
    next: dat => {
      const datKey = (dat.key as Buffer).toString("hex");
      if (global_state[datKey]) {
        global_state[datKey].peers = dat.network.connected;
      } else {
        global_state[datKey] = {
          key: datKey,
          peers: dat.network.connected
        };
      }
    }
  });

server.listen(8182);

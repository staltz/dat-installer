import { Observable, Subject, ReplaySubject } from "rxjs";
import { AppMetadata } from "../typings/messages";
import {
  createDat,
  joinNetwork,
  trimProtocolPrefix,
  looksLikeDatHash,
  downloadFileFromDat,
  readFileInDat,
} from "./utils";
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
const startDatSync$: Subject<string> = new Rx.Subject();
const METADATA_FILENAME = "/metadata.json";

let global_state: { [key: string]: AppMetadata } = {};
let global_errors: Array<object> = [];

server.get("/ping", (req: Request, res: Response) => {
  res.json({ msg: "pong" });
});

server.post("/setStoragePath", (req: Request, res: Response) => {
  console.log("/setStoragePath", req.body.path);
  storagePath$.next(req.body.path);
  res.sendStatus(200);
});

server.get("/error", (req: Request, res: Response) => {
  const err = global_errors.shift();
  res.json(err);
});

server.post("/datSync", (req: Request, res: Response) => {
  console.log("/datSync", req.body.datKey);
  startDatSync$.next(trimProtocolPrefix(req.body.datKey));
  res.sendStatus(200);
});

server.get("/allApps", (req: Request, res: Response) => {
  res.json({ apps: global_state });
});

// Create dat and sync, when given a new dat hash
const dat$ = startDatSync$
  .withLatestFrom(storagePath$)
  .switchMap(arr => {
    const datHash = arr[0];
    const storagePath = arr[1];
    const datKey = "dat://" + datHash;
    const datPath = path.join(storagePath, datHash);
    console.log("createDat", datPath, datKey);
    return createDat(datPath, { key: datKey });
  })
  .switchMap(dat => joinNetwork(dat).mapTo(dat))
  .publishReplay(1)
  .refCount();

// Update the number of connected peers
dat$.subscribe({
  next: dat => {
    function updatePeers() {
      const datHash = (dat.key as Buffer).toString("hex");
      console.log(`${dat.network.connected} other peers sharing ${datHash}`);
      if (global_state[datHash]) {
        global_state[datHash].peers = dat.network.connected;
      } else {
        global_state[datHash] = {
          key: datHash,
          peers: dat.network.connected,
        };
      }
    }

    updatePeers();
    dat.network.on("connection", updatePeers);
  },
  error: e => {
    console.error(e);
    global_errors.push(e);
  },
});

// Read metadata to update global_state
const metadata$ = dat$
  .do(x => console.log("attempt to read " + METADATA_FILENAME + " file"))
  .switchMap(dat =>
    readFileInDat(dat, METADATA_FILENAME, "utf-8").map(contents => ({
      json: JSON.parse(contents),
      dat,
    })),
  )
  .publishReplay(1)
  .refCount();

const readme$ = metadata$.switchMap(({ json, dat }) => {
  console.log("attempt to read readme file " + json.readme);
  return json.readme
    ? readFileInDat(dat, json.readme, "utf-8").map(contents => ({
        contents,
        dat,
      }))
    : Rx.Observable.empty();
});

const apkFullPath$ = metadata$
  .switchMap(({ json, dat }) => {
    const apkFilename: string = json.apk;
    console.log("attempt to download apk file " + apkFilename);
    return downloadFileFromDat(dat, json.apk).mapTo({ dat, apkFilename });
  })
  .withLatestFrom(storagePath$)
  .map(([{ dat, apkFilename }, storagePath]) => {
    const datHash = (dat.key as Buffer).toString("hex");
    const apkFullPath: string = path.join(storagePath, datHash, apkFilename);
    return { apkFullPath, datHash };
  });

// Update global_state metadata for an app
metadata$.subscribe({
  error: (e: Error) => {
    if (e.message === `${METADATA_FILENAME} could not be found`) {
      global_errors.push({
        message: "The Dat for this app is missing " + METADATA_FILENAME,
      });
    } else {
      global_errors.push(e);
    }
  },
});

// Update global_state readme for an app
readme$.subscribe({
  next: ({ contents, dat }) => {
    const datHash = (dat.key as Buffer).toString("hex");
    if (global_state[datHash]) {
      global_state[datHash].readme = contents;
    } else {
      global_state[datHash] = {
        key: datHash,
        peers: 0,
        readme: contents,
      };
    }
  },
  error: (e: Error) => {
    if (e.message.endsWith("could not be found")) {
      global_errors.push({
        message: "The Dat for this app has a broken Readme file",
      });
    } else {
      global_errors.push(e);
    }
  },
});

// Update global_state apk full path for an app
apkFullPath$.subscribe({
  next: ({ apkFullPath, datHash }) => {
    if (global_state[datHash]) {
      global_state[datHash].apkFullPath = apkFullPath;
    } else {
      global_state[datHash] = {
        key: datHash,
        peers: 0,
        readme: apkFullPath,
      };
    }
  },
  error: (e: Error) => {
    if (e.message.endsWith("could not be found")) {
      global_errors.push({
        message: "The Dat for this app has a broken APK file",
      });
    } else {
      global_errors.push(e);
    }
  },
});

// Read cold stored Dats and start syncing them
storagePath$
  .take(1)
  .do(x => console.log("storagePath exists, lets read everything"))
  .map(storagePath =>
    (fs.readdirSync(storagePath) as Array<string>)
      .filter(looksLikeDatHash)
      .filter(file => {
        const fullPath = path.join(storagePath, file);
        return fs.lstatSync(fullPath).isDirectory();
      }),
  )
  .switchMap(files => Rx.Observable.from(files))
  .subscribe({
    next: (datDir: string) => {
      console.log("read dir " + datDir + " from fs and will dat sync it");
      startDatSync$.next(trimProtocolPrefix(datDir));
    },
    error: e => {
      global_errors.push(e);
    },
  });

server.listen(8182);

export type AppMetadata = {
  key: string;
  name: string;
  version: string;
  peers: number;
};

// Requests
//
export type SetStoragePathReq = {
  type: "SET_STORAGE_PATH";
  path: string;
};

export type DatSyncReq = {
  type: "DAT_SYNC";
  datKey: string;
};

export type Req = SetStoragePathReq | DatSyncReq;

// Responses
//
export type AllAppsRes = {
  type: "ALL_APPS";
  apps: Array<AppMetadata>;
};

export type ErrorRes = {
  type: "ERROR";
  message: string;
};

export type DatEventRes = {
  type: "DAT_EVENT";
  key: string;
  peers: number;
};

export type Res = AllAppsRes | ErrorRes | DatEventRes;

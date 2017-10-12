export type StartDatReq = {
  type: "START_DAT";
  storagePath: string;
  datKey: string;
};

export type Req = StartDatReq;

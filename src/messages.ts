export type StartDatMsg = {
  type: "START_DAT";
  storagePath: string;
  datKey: string;
};

export type Msg = StartDatMsg;

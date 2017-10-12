const rn_bridge = require("rn-bridge");
const Dat = require("dat-node");
import { Req, StartDatReq } from "../typings/messages";

rn_bridge.channel.on("message", (message: string) => {
  const req: Req = JSON.parse(message);
  rn_bridge.channel.send("Backend got message from frontend: " + message);
  switch (req.type) {
    case "START_DAT":
      startDat(req);
      break;

    default:
      break;
  }
});

function startDat(req: StartDatReq) {
  Dat(
    req.storagePath,
    {
      key: req.datKey
    },
    function(err: any, dat: any) {
      if (err) {
        rn_bridge.channel.send("ERROR: " + err);
      } else {
        dat.joinNetwork(function(err2: any) {
          if (err) {
            rn_bridge.channel.send("ERROR: " + err2);
          } else {
            rn_bridge.channel.send(
              "There are " + dat.network.connected + " connected peers"
            );
          }
        });
      }
    }
  );
}

rn_bridge.channel.send("Node was initialized.");

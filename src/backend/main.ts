const rn_bridge = require("rn-bridge");
const Dat = require("dat-node");
import { Msg, StartDatMsg } from "../messages";

rn_bridge.channel.on("message", (packet: string) => {
  const msg: Msg = JSON.parse(packet);
  rn_bridge.channel.send("Background got packet from foreground: " + packet);
  switch (msg.type) {
    case "START_DAT":
      startDat(msg);
      break;

    default:
      break;
  }
});

function startDat(msg: StartDatMsg) {
  Dat(
    msg.storagePath,
    {
      key: msg.datKey
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

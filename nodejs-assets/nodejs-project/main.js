var rn_bridge = require("rn-bridge");
var Dat = require("dat-node");

rn_bridge.channel.on("message", packet => {
  var msg = JSON.parse(packet);
  rn_bridge.channel.send("Background got packet from foreground: " + packet);
  switch (msg.type) {
    case "START_DAT":
      startDat(msg);
      break;

    default:
      break;
  }
});

function startDat(msg) {
  Dat(
    msg.storagePath,
    {
      key: msg.datKey
    },
    function(err, dat) {
      if (err) {
        rn_bridge.channel.send("ERROR: " + err);
      } else {
        dat.joinNetwork(function(err2) {
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

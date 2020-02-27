/************* Moduls **************/
import bodyParser from "body-parser";
import express from "express";
import os from "os";

// Config the
const app: express.Application = express();
const port: number = +process.env.PORT || 8810; // + means cast to number in typescript

// Get the server's local ip
const ifaces = os.networkInterfaces();
let localIP: string;

Object.keys(ifaces).forEach((ifname) => {
  let alias = 0;

  ifaces[ifname].forEach((iface) => {
    if ("IPv4" !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // This single interface has multiple ipv4 addresses
      //  console.log(ifname + ':' + alias, iface.address);
    } else {
      // This interface has only one ipv4 adress
      // console.log(ifname, iface.address);
        localIP = iface.address;
    }
    
    ++alias;
  });
});

// Middelwares
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

require('./middlewares/app.middleware')(app);

/******************** API ********************/
require("./config/routes.config")(app);
/*********************************************/

app.listen(port, () => {
  console.log(`Our app server is running on http://${os.hostname()}:${port}`);
  console.log(`Server running on: http://${localIP}:${port}`);
});
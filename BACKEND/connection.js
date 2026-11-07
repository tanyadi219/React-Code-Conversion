const mongoose = require('mongoose');
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const url = process.env.MONGO_URL;

mongoose.connect(url)
    .then(() => {
        console.log('database connected');
    })
    .catch((err) => {
        console.log(err);
    });
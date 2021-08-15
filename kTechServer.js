// kTechServer API - Only serves up Schedule that is downloaded with fs. 
const express = require('express');
const app = express();
// const http = require('http').Server(app);
const fs = require("fs");

const https_options = {
    key: fs.readFileSync(`/etc/letsencrypt/live/www.kawaiisutech.com/privkey.pem`),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.kawaiisutech.com/fullchain.pem')
}
// var server = https.createServer(options, app);
const https = require('https');
let server = https.createServer(https_options, app)
server.listen(443);

const io = require('socket.io')(https);
const path = require('path');
const ktechHeader = 'ktech_sends_message';
const myDeviceName = 'kTechAPIServer';

// SOCKET CONNECTIONS //
io.on('connection', socket => {
    console.log(`${myDeviceName}:io.on:connection: Device connected.`)
    socket.emit(ktechHeader, {'message':'connected_to_ktech'});

    // INCOMING MESSAGES //
    // socket.on('')
});

io.on('server_as_client_sends_message', data => {
    console.log(`${myDeviceName}:io.on:server_as_client_sends_message`);
    console.dir(data);
})

// EXPRESS SETUP //
app.use(express.static('public'));

// API SETUP //
app.get('/', (req, res) => {
        res.status(200).send('Future site of KawaiisuTech.com.');
});

app.get('/schedule', (req, res) => {
    // First, read schedule from disk.
    gs().then((sched) => {
        console.log(`${myDeviceName}:getScheduleFromFile.then...:`);
        if(sched) { console.log(`${myDeviceName}: was successful.`); }
        else { console.log(`${myDeviceName}: failed.`); }
        // console.dir(sched);

        res.status(200).send(sched);
    });
});

async function gs() {
    return await getScheduleFromFile().then(d => {
        return d;
    });
}

async function getScheduleFromFile() {
    return await fs.readFileSync(
        __dirname + "/schedule.json",
        'utf8',
        (err, data) => {
        return data;
    });
}

// let server = app.listen(443, function () {
//    let host = server.address().address
//    let port = server.address().port
//    console.log("kTech Server listening at http://%s:%s", host, port)
// });


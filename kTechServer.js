const fa = require('./public/js/fileAccess');
const fs = require('fs');
const notifier = require('./public/js/Notifier');
const express = require('express');
const app = express();
const https_options = {
    key: fs.readFileSync(`/etc/letsencrypt/live/www.kawaiisutech.com/privkey.pem`),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.kawaiisutech.com/fullchain.pem')
}
const myDeviceName = 'kTechServer';

// API ACCESS /////////////////////////////////////////
const https = require('https');
let server = https.createServer(https_options, app)
server.listen(443);
// EXPRESS SETUP //
app.use(express.static('public'));
// WEB PAGE SETUP (Don't put in the API?) //
app.get('/', (req, res) => {
        res.status(200).send('Future site of KawaiisuTech.com.');
});
// API PULL DATA REQUEST (Requires effort from the Client.) //
app.get('/schedule', (req, res) => {
    // First, read schedule from disk.
    fa.gs().then((sched) => {
        console.log(`${myDeviceName}:app.get/schedule:fa.gs():sched pull...`);
        if(sched) { console.log(`${myDeviceName}: was successful.`); }
        else { console.log(`${myDeviceName}: failed.`); }
        res.status(200).send(sched);
    });
});
///////////////////////////////////////////////////////

// NON-SECURE SOCKET ACCESS ///////////////////////////
const http = require('http');
const io = require('socket.io')(http);
io.listen(56010);
///////////////////////////////////////////////////////

// SOCKET CONNECTIONS //
io.on('connection', socket => {
    console.log(`${myDeviceName}:io.on:connection: Device connected.`)
    socket.emit('ktech_sends_message', {'message':'connected_to_ktech','data': 'Connected to kTechServer @ http://www.kawaiisutech.com.'});
    
    // INCOMING MESSAGES //
    socket.on('client_sends_message_to_ktech', data => {
        let {message} = data;
        if(message === 'request_api_schedule') {
            let apiSched = fa.getSchedJSON().then((sched) => {
                console.log(`${myDeviceName}:sending schedule...`);
                console.dir(sched);
                socket.emit('ktech_sends_message', {'message':'requested_api_schedule', 'data': sched});
                return sched;
            });
        } else if (message === 'my_id') {
            let {id} = data;
            console.log(`${myDeviceName}:socket:on:my_id:id: '${id}' is connected.`);
            console.log(`${myDeviceName}:Sending API schedule...`);
            let apiSched = fa.getSchedJSON().then((sched) => {
                console.log(`${myDeviceName}:sending schedule...`);
                console.dir(sched);
                socket.emit('ktech_sends_message', {'message':'requested_api_schedule', 'data': sched});
                return sched;
            });
        }
    });
});

notifier.on('file_access_sends_message', data => {
    console.log(`${myDeviceName}:notifier.on:file_access_sends_message`);
    if(data.message === 'new_schedule') {
        console.log('NEW SCHEDULE IN:');
        console.dir(data.data);
        io.emit('ktech_sends_message', {'message':'new_schedule', 'data':data.data});
    }
});

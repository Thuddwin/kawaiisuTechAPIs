const fa = require('./public/js/fileAccess'); 
const fs = require('fs');
const notifier = require('./public/js/Notifier');
const express = require('express');
const app = express();
const path = require('path');
const https_options = {
    key: fs.readFileSync(`/etc/letsencrypt/live/www.kawaiisutech.com/privkey.pem`),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.kawaiisutech.com/fullchain.pem')
}
const myDeviceName = 'kTechServer';

/* EXPRESS SETUP - POSSIBLE FUTURE FEATURE */
    // app.use(express.static('public'));
    app.use(express.static(__dirname + '/public'));
/* WEB PAGE SETUP */
    app.get('/', (req, res) => {
            res.status(200).sendFile(path.join(__dirname, 'public/views/home.html'));
    });
/* API PULL DATA REQUEST (Requires effort from the Client.) */
    app.get('/schedule', (req, res) => {
        // First, read schedule from disk. TODO:9.15.23:Get from database based on 'church code'.
        fa.gs().then((sched) => {
            console.log(`${myDeviceName}:app.get/schedule:fa.gs():sched pull from Client in the wild`);
            if(sched) {
                console.log(`${myDeviceName}: was successful.`);
                res.status(200).send(sched);
            }
            else {
                console.log(`${myDeviceName}: failed.`);
                res.status(500).send(`Attemp to fetch schedule failed.`);
            }
        }
    );
});
/*****************************************************/

/* NON-SECURE SOCKET ACCESS */
    const http = require('http');
    const io = require('socket.io')(http);
    io.listen(56010);
/****************************/

/* SOCKET CONNECTIONS */
    io.on('connection', socket => {
        console.log(`${myDeviceName}:io.on:connection: Device connected.`)
        socket.emit('ktech_sends_message', {'message':'connected_to_ktech','data': 'Connected to kTechServer @ http://www.kawaiisutech.com.'});
        
        // INCOMING MESSAGES //
        socket.on('client_sends_message_to_ktech', data => {
            let {message} = data;
            if(message === 'request_api_schedule') {
                getScheduleAsync();
            } else if (message === 'my_id') {
                let {id} = data;
                console.log(`${myDeviceName}:Client ID: ${id}.`);
                getScheduleAsync();
            }
        });
    });
/**********************/

/* NOTIFICATIONS */
    notifier.on('file_access_sends_message', dataIn => {
        console.log(`${myDeviceName}:notifier.on:file_access_sends_message`);
        ({message} = dataIn);
        if(message === 'new_schedule') {
            ({data} = dataIn);
            io.emit('ktech_sends_message', {'message':'new_schedule', 'data':data});
        }
    })
/*****************/

async function getScheduleAsync() {
    return await fa.getSchedJSON().then((sched) => {
        io.emit('ktech_sends_message', {'message':'new_schedule', 'data': sched});
        return sched;
    });
}

/* API ACCESS */
const https = require('https');
let server = https.createServer(https_options, app)
server.listen(443);
console.log(`kTechServer listening on Port 443.`);

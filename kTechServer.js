const fa = require('./public/js/fileAccess');
const fs = require('fs');
const notifier = require('./public/js/Notifier');
const express = require('express');
const app = express();
const https_options = {
    key: fs.readFileSync(`/etc/letsencrypt/live/www.kawaiisutech.com/privkey.pem`),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.kawaiisutech.com/fullchain.pem')
}
const scraper = require('./public/js/mediaCenterScraper');
const myDeviceName = 'kTechServer';

/* API ACCESS */
    const https = require('https');
    let server = https.createServer(https_options, app)
    server.listen(443);
/* EXPRESS SETUP - POSSIBLE FUTURE FEATURE */
    app.use(express.static('public'));
/* WEB PAGE SETUP */
    app.get('/', (req, res) => {
            res.status(200).send('Future site of KawaiisuTech.com.');
    });
/* API PULL DATA REQUEST (Requires effort from the Client.) */
    app.get('/schedule', (req, res) => {
    // First, read schedule from disk. //
    fa.gs().then((sched) => {
        console.log(`${myDeviceName}:app.get/schedule:fa.gs():sched pull...`);
        if(sched) { console.log(`${myDeviceName}: was successful.`); }
        else { console.log(`${myDeviceName}: failed.`); }
        res.status(200).send(sched);
    });
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
        scraper.grabVideoData(); // Sends notifier event when data is ready. //
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
    notifier.on('file_access_sends_message', data => {
        console.log(`${myDeviceName}:notifier.on:file_access_sends_message`);
        if(data.message === 'new_schedule') {
            io.emit('ktech_sends_message', {'message':'new_schedule', 'data':data.data});
        }
    });

    notifier.on('scraper_sends_message', data => {
        io.emit('ktech_sends_message', {'message': 'new_video_list', 'data': data.data})
    });
/*****************/

async function getScheduleAsync() {
    return await fa.getSchedJSON().then((sched) => {
        io.emit('ktech_sends_message', {'message':'new_schedule', 'data': sched});
        return sched;
    });
}

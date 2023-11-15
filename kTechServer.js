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
    socket.emit('ktech_sends_message', {'message':'connected_to_ktech','data': 'Connected to kTechServer @ http://www.kawaiisutech.com.'});
    
    // INCOMING MESSAGES //
    socket.on('client_sends_message_to_ktech', async(data) => {
        let {message} = data;
        if(message === 'request_api_schedule') {
            await getScheduleAsync();
        } else if (message === 'my_id') {
            let {id} = data;
            const timeObj = new Date().toLocaleString('en-US', {hour12: false});
            console.log(`\n${myDeviceName}:CONNECTED:`);
            socket.clientInfo = {'username': id, 'connectTime': timeObj};
            console.dir(socket.clientInfo);
            getScheduleAsync();
            const allClients = await getClientsList();
            io.emit('ktech_sends_message', {'message': 'requested_client_list', 'data': allClients});
        }
    });

    socket.on('disconnect', async() => {
        console.log(`\n${myDeviceName}:DISCONNECTED:`);
        const allClients = await getClientsList();
        const timeObj = new Date().toLocaleString('en-US', {hour12: false});
        if(socket.hasOwnProperty('clientInfo')) {
            socket.clientInfo.DconnectTime = timeObj;
            const dConnClient = buildClient(socket.clientInfo);
            console.log(`${myDeviceName}: DCONN OBJ:`);
            console.dir(dConnClient);
            allClients.push(dConnClient.client);
            console.dir(allClients);
        }
        io.emit('ktech_sends_message', {'message': 'requested_client_list', 'data': allClients});
    });

    socket.on('webModAPIService_sends_message', async(dataIn) => {
        ({message, data} = dataIn);
        if(message == 'request_client_list') {
            const clientList = await getClientsList();
            socket.emit('ktech_sends_message', {'message': 'requested_client_list', 'data': clientList});
        } else if(message === 'set_stream_valve') {
            // * kTech forwards the stream_valve_enb/denb message.
            // * kTech uses incoming clientId in data to find the socket in the io object
            // * kTech bounces the message to the socketInWild
            await emitToSocketBykTechID(data);
        }
    })
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
});
/*****************/

/* METHODS */
const getScheduleAsync = async() => {
    return await fa.getSchedJSON().then((sched) => {
        io.emit('ktech_sends_message', {'message':'new_schedule', 'data': sched});
        return sched;
    });
}

const emitToSocketBykTechID = async(dataIn) => {
    ({clientId, setStream} = dataIn);

    const ioSockets = await io.fetchSockets();
    for(let i = 0; i < ioSockets.length; i++) {
        let sock = ioSockets[i];
    // ioSockets.forEach(sock => {
        // console.dir(sock);
        if(sock.hasOwnProperty('clientInfo')) {
            if(sock.clientInfo.username !== 'schedEdAPI') {
                const speaker = sock.clientInfo.username.split(':')[0];
                console.log(`${myDeviceName}: Looking for match clientIdIn:${clientId}: to :${speaker}:`)
                if(speaker === clientId) {
                    console.log(`${myDeviceName}: FOUND SOCK!`);
                    sock.emit('ktech_sends_message', {'message':setStream, 'data':'NO DATA'});
                    console.log(`${myDeviceName}: Emittied ${setStream} to client ${speaker}.`);
                    return;
                }
            }
        }
    };
}

const getClientsList = async() => {
    const sockClients = await io.fetchSockets();
    let allClients = [];
    
    sockClients.forEach(element => {
        if(element.hasOwnProperty('clientInfo')) {
            newClientVals = buildClient(element.clientInfo);
            if(newClientVals.nameLen > 1 ) {
                allClients.push(newClientVals.client);
            }
        }
    });
    console.log(`${myDeviceName}:getClientsList(): allClients:`);
    console.dir(allClients);
    return allClients;
}

// Build both newly connected and disconnected clients //
// Incoming object keys: username, connectTime, DconnectTime //
const buildClient = (sockClientIn) => {
    let clientItem = new Object();
    console.log(`${myDeviceName}: buildClient sockClientIn:`);
    console.dir(sockClientIn);
    const usernameParts = sockClientIn.username.split(':');
    if(usernameParts.length > 1) {
        console.log(`${myDeviceName}: speaker: ${usernameParts[0]}`);
        clientItem.speaker = usernameParts[0];
    }
    console.log(`${myDeviceName}: title: ${usernameParts[1]}`);
    clientItem.title = usernameParts[1];

    clientItem.state = 'ON';

    clientItem.onTime = sockClientIn.connectTime;
    if(sockClientIn.hasOwnProperty('DconnectTime')) {
        clientItem.offTime = sockClientIn.DconnectTime;
        clientItem.state = 'OFF';
    }

    console.log(`${myDeviceName}: state: ${clientItem.state}`);

    return {'nameLen':usernameParts.length, 'client': clientItem};
}
/*****************/

/* API ACCESS */
const https = require('https');
let server = https.createServer(https_options, app)
server.listen(443);
console.log(`${myDeviceName}: kTechServer listening on Port 443.`);

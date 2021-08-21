const fs = require('fs');
const notifier = require('./Notifier');

const schedFile = `${__dirname}/../data/schedule.json`;
const myDeviceName = 'fileAccess';

// const io = require('socket.io-client');
// const serverUrl = 'http://localhost:56010';
// const socket = io(serverUrl);

module.exports = {
    gs:gs,
    getSchedJSON:getSchedJSON
}
// FILE ACCESS FUNCTIONS //
// WATCH THE SCHEDULE FILE FOR CHANGES, TRIGGER EVENT //
let lock = false;
fs.watch(schedFile, (event, filename) => {
    if (event == 'change' && !lock) {
        lock = true;
        console.log(`${myDeviceName}:fs.watch():event:change. ${filename} has been saved.`);
        // SOME EDITORS CAUSES MULTIPLE EVENTS TO FIRE WHEN SAVING FILE,
        // LOCK/TIMEOUT PREVENTS SOCKET.EMIT FROM FIRING MORE THAN ONCE
        setTimeout(() => {
            getSchedJSON().then((sched) => {
                console.log(`${myDeviceName}:fs.watch():fa.gs():sched:`);
                console.dir(sched);
                if(sched) { console.log(`${myDeviceName}: was successful.`); }
                else { console.log(`${myDeviceName}: failed.`); }
                notifier.emit('file_access_sends_message', {'message':'new_schedule', 'data': sched})
            });
            lock = false;
        }, 2000);
    }
  });

async function getSchedJSON() {
    return await gs().then((sched) => {
        console.log(`${myDeviceName}:getSchedJSON():sched:`);
        console.dir(sched);
        let prepString = sched.replace(/\\n/g, '');
        let jsonObj = JSON.parse(prepString);
        console.log(`${myDeviceName}:getSchedJSON():jsonObj:`);
        console.dir(jsonObj);
        return jsonObj;
    });
}


async function getGS() {
    return await gs()
    .then(data => {
        console.log(`${myDeviceName}:getGS():data:`);
        console.dir(data);
        return data;
    })
}

async function gs() {
    return await getScheduleFromFile().then(d => {
        console.log(`${myDeviceName}:gs():d:`);
        console.dir(d);
        return d;
    });
}

async function getScheduleFromFile() {
    return await fs.readFileSync(
        schedFile,
        'utf8',
        (err, data) => {
            if(err) {
                console.log(`${myDeviceName}:getSchduleFromFile():ERROR:${err}.`);
            }
        return data;
    });
}

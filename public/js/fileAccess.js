const fs = require('fs');
const notifier = require('./Notifier');

const schedFile = `${__dirname}/../data/schedule.json`;
const myDeviceName = 'fileAccess';

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
        // SOME EDITORS CAUSES MULTIPLE EVENTS TO FIRE WHEN SAVING FILE,
        // LOCK/TIMEOUT PREVENTS SOCKET.EMIT FROM FIRING MORE THAN ONCE
        setTimeout(() => {
            getSchedJSON().then((sched) => {
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
        let prepString = sched.replace(/\\n/g, '');
        let jsonObj = JSON.parse(prepString);
        return jsonObj;
    });
}

async function gs() {
    return await getScheduleFromFile().then(d => {
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

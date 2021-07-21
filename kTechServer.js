// kTechServer API - Only serves up Schedule that is downloaded with fs. 

let express = require('express');
let app = express();
let fs = require("fs");

app.get('/online-test', (req, res) => {
        res.status(200).send('freak la sheik');
});

app.get('/schedule', (req, res) => {
    // First, read schedule from disk.
    gs().then((sched) => {
        console.log('getScheduleFromFile.then...:');
        console.dir(sched);

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

let server = app.listen(8081, function () {
   let host = server.address().address
   let port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
});


/**
 * Description. mediaCenterScraper - Is a scraper pump on a 24 hour interval that 
 * retrieves Vimeo and SoundCloud URLs from 
 * http://apostolicfaith.org/media-center.
 * This module pushes data to the Server on the interval expiry.
 * 
 * @param: None
 * 
 * @fires: 
 *  notifier.emit('scraper_sends_message', 
 *  {
 *      'message': 'data_ready', 
 *      'data': vimLinks
 *  });
 */
const request = require('request');
const notifier = require('./Notifier');
const cron = require('node-cron');
const myDeviceName = 'mediaCenterScraper';

module.exports = {
    grabVideoData: grabVideoData
}

let task = cron.schedule('*/15 * * * *', () => {
    console.log(`${myDeviceName}: cron: grabbing video data.`);
    grabVideoData();
});

task.start()

/** Description. grabVideoData() - Called by Server when a Client connects via socket.
 * 
 * @param: (boolean) - mode: false (default) = fires event OR true = return data
 * 
 * @fires: notifier.emit('scraper_sends_message', 
 *  {
 *      'message': 'data_ready', 
 *      'data': vimLinks
 *  });
 * 
 */
async function grabVideoData() {
    await request("https://api.vimeo.com/channels/1029210/videos?per_page=100",
    {
        'auth': {
        'bearer': '16c2225dacb52ea28658fdbfca2e4dcb'
        }
    },
        (error, response, body) => {
            let vimLinks = [];
            if (error){
            console.log(error);
            }
            else {
                try {
                    let jsonBod = JSON.parse(body);
                    // GRAB THE 'DATA' ARRAY WHICH CONTAINS ALL THE VIMEO LINKS //
                    let dataArray = jsonBod.data;
                    console.log('dataArray:', dataArray); // REMOVE ME //
                    for(let _idx = 0; _idx < 20; _idx++) {
                        let elem = dataArray[_idx];
                        if(elem.hasOwnProperty('type')) {
                            if(elem.type === 'video') {
                                let o = createNewVimObj(_idx, elem);
                                vimLinks.push(o);
                            }
                        }
                    }
    console.log(vimLinks);
                    notifier.emit('scraper_sends_message', {'message': 'data_ready', 'data': vimLinks});
                    
                } catch (error) {
                    console.log(`${myDeviceName}:grabVideoData():silent ERROR:${error}`);
                }
            }
        }
    );
}

function createNewVimObj(_idx, dataIn) {
    let dataParts = dataIn.name.split(' - ');
    let lastPart = dataParts.length - 1;
    let vimObj = {
            "index": _idx,
            "date": dataParts[0],
            "speaker": dataParts[2],
            "title": dataParts[lastPart],
            "link": dataIn.link
      };
      return vimObj;
}
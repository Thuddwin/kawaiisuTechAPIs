# KawaiisuTech APIs
An API the strictlyLIVE modules periodically query for the latest Schedule.

## strictlyLIVE API
strictlyLIVE (sL) modules in the wild come here to get Schedule information.  For now, all sL clients will receive the same data. Schedule is a JSON document, for now.  No database.
<br>2023.09.04 (WIP) - Today a User said that the owner of her mother's care facility saw a need for <b>strictlyLIVE</b> to be deployed into the local Ukranian community - they also have elderly folks that would love to hear the Word of God via their own churches! :)
<br>To provide the same 'auto-schedule-updates' for the Ukranian (and other) Users, paths to different church-event schedules is required.
<br>Additionally, a Godly person from the Ukranian (or other) community MAY be required to keep the schedule updated for their events.
<br>For now, the plan is to enhance the kTechServer's aptitude by integrating a lookup table that it can refer to when pushing the schedule to <b>strictlyLIVE</b> modules in the wild. A bit like an on-the-fly seperator that can distribute events to a module based on its Church Code that will be found in the kTechServer's database. How to tie database to module is being worked out.
#### TODO (WIP) ####
  * <b>NO CHANGES TO THE strictlyLIVE module should be needed. This implementation should be all on the kTechServer.</b>
  * Add a table to the database that holds records of each deployed strictlyLIVE module:
    * The table shall have fields for: User Name, User Address, date of deployment, mac address, church code (i.e. PDX1, UKR1), (more?)
    * The database shall be accessable locally, for all CRUD activities.  NOTE: I may need to open a path for the Ukranian folks to update their own schedules sInce I probably won't have the timely information needed to stay in sync with their activities.
  * To Schedule Editor (rename this???) add:
    * A Modules List view,
    * A Module Records list view

## Prayer Request Services (PRS) API
This API services the Twilio phone-in line. Database used. 

## slServer
This app receives connections to strictlyLIVE clients in the wild.  Each client's connects/disconnects, and schedule pushes go through this app.<br>
It also serves up a very basic, text only web page, and will display a dump of the currect schedule.<br>
It requires an SSL certificate which is provided by and automatically renewed via certbot.<br>

The platform used for this project is a Le Potato (arm64) running the Buster distro (2022-09-22-raspbian-bullseye-arm64+aml-s905x-cc.img from the Le Potato web site).
### To build:
```
Flash a GOOD quality microSD with 2022-09-22-raspbian-bullseye-arm64+aml-s905x-cc.img,
Follow the setup that auto-launches at first boot, (requires a USB Mouse/Keyboard),
Install certbot via snapd as per instructions here: https://certbot.eff.org/instructions?ws=other&os=debianbuster (When the time comes, Choose Yes, okay to stop server...)
Install Node.js: 
  Download from https://nodejs.org/en/download/prebuilt-binaries THEN SELECT "I want the _v20.13.1 (LTS)_ version of Node.js for _Linux_ running _ARM64_,
  Install Node per Instructables: https://www.instructables.com/Install-Nodejs-and-Npm-on-Raspberry-Pi/,
From pi home directory: git clone kawaiisuTechAPIs project,
From pi home directory: git clone kawaiisuSlSchedEd project,
In each of the projects run: npm install,
In /home/pi/kawaiisuTechAPIs: sudo node kTechServer.js
In /home/pi/kawaiisuSlSchedEd: node schedEd.js
OPTIONAL: From kawaiisuSlSchedEd, copy .bash_aliases to /home/pi then: source .bash_aliases.  Type: alias to see shortcuts.
```

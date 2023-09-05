# KawaiisuTech APIs
An API the strictlyLIVE modules periodically query for the latest Schedule.

## strictlyLIVE API
strictlyLIVE (sL) modules in the wild come here to get Schedule information.  For now, all sL clients will receive the same data. Schedule is a JSON document, for now.  No database.
<br>2023.09.04 (WIP) - Today a User said that the owner of her mother's care facility saw a need for <b>strictlyLIVE</b> to be deployed into the Ukranian community.  They also have elderly folks that would love to hear the Word of God via their own churches! :)
<br>To provide the same 'auto-schedule-updates' for the Ukranian Users, a seperate church schedule of services is required.
<br>Additionally, a Godly person from the Ukranian community MAY be required to keep the schedule updated for their events.
<br>For now, the plan is to enhance the kTechServer's aptitude by integrating a lookup table that it can refer to when pushing the schedule to <b>strictlyLIVE</b> modules in the wild.
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

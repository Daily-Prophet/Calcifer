This TSG provide a basic overview for the data flows of attendance report and how to handle the customer escalation issues for attendance report, if you want quick figure out the solutions please focus on the [Triage Scenarios](#triage)
and [Known limitations and enhancement](#limitations). also you can locate issues by navigate to [Triage Scenarios](#triage) and filter the sub scenarios by search the keyword(like meetingpolicy/channelmeeting/calendar/coorganizer)

# Core Flow of attendance report

Within the attendance report domain, there are two main flows: the report generation flow and the report retrieval flow.
![Report Generation Flow](./flow1.png)

The above diagram show the data flow for report generation flow, this is an simplified flow based on attendance report perspective. the participants join the meeting through different teams clients, and the clients will pass the participant data to backend service.
the data also include the configuration data(like ecs config,meeting policy,meeting options,user settings). the NGC is one of the core backend service in attendance report flow. After meeting end, NGC will send related data to dependency services according to configuration.
if attendance report is enabled NGC will save a engagement report to scheduling service, and also send a NGCParticipantsActivity to MSAI and also send a meeting end signal to TMIS, the meeting end signal contains the url for the engagement report. Then MSAI/TMIS Received
the signal/data they will try to generate the report. when generate report they will retrieve all the related data from other services. ie: engagement report and meeting details infor from scheduling service, QnA information from yammer service, user name information
from DSAPI service. and after the report generated. the report will be stored in SDS(Substrate Data Storage). This is a storage based on customer's mailbox, it's tenant/user isolated. customer has the full control of their data.
Besides these report, there is also another way to generate the report, it's implemented in the TAC, the report is a simple version of attendance report, usually controlled by tenant admin. and it didn't contains flexible
engagement data, virtual event data, yammer data and so on. usually when customer couldn't download a report, and we couldn't figure out the reason quickly, we would suggest the customer to download report through TAC, it also support live event/broadcast 's reports. but
the retation time of the report is only one month.

![Report Retrieval Flow](./flow2_2.png)

There are multiple ways that customer can do the retrieval of reports, one is as described above, customer can download report thorugh TAC. the other way is through Graph API , in these two cases, we can forward the icms to
corresponding team. while the core flow is the retrieval from teams clients( including desktop/web/android/ios), while this digram will mainly focus on desktop/web client. there are multiple entrances for the reports, like chiclet, attendancetab and so on.(In meeting report is a simple version of attendance report, it can only be accessed during the meeting. it only contains user,action,timestamp information, more details please search inmeetingreport in this page.) while the
wether customer could see the entrances is controlled by ecs/meetingpolicy/meetingoptions. when user click to view or download the attendance report. it will point to backend services, currently most of the requests willl point to TMIS, in GCC it will point to CMD-ArtifactService
and if any of the requests failed, it will fallback to MSAI.

# Owner Teams:

There are two main Project Team for attendance report, `Skype Teams/CMD Client - Meeting Analytics`(The client team for attendance report, short name is MA-Client) and `Teams Meeting Intelligence Service/Teams Meeting Attendance Report` (The backend service team for attendance report, short name is TMIS)
You can just assign ICM to the first project team.

# Partner Teams:

| Scope                                 | Partner Team                                                | Example incident                                                                                                                                                              | Comments                                                                                                                                              |
| ------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Conversation Service(NGC)**         | **Skype Calling / NGC Meeting Core**                        | [402803994](https://portal.microsofticm.com/imp/v3/incidents/details/402803994/home)                                                                                          | When meeting end signal(NGCParticipantsActivity,EngagementReportUrl) didn't sent to MSAI/TMIS, or the content of the NGCParticipantsActivity is wrong |
| **MSAI V3 report**                    | **MSAI Meeting Intelligence / MSAI Meeting Intelligence**   | [401431705](https://portal.microsofticm.com/imp/v3/incidents/details/401431705/home)                                                                                          | when report retrievement api sent to MSAI but failed.                                                                                                 |
| Live event/broadcast report           | Skype Teams / CMD Client - Broadcast/Live Events - attendee | [251313781](https://portal.microsofticm.com/imp/v3/incidents/details/251313781/home)                                                                                          | Live event's attendance report contains the watching records of the meeting record (VOD), and can be downloaded through TAC.                          |
| Report from TAC(tenant admin center)  | Skype Teams / ITPro – Analytics & Reporting                 | [250704607](https://portal.microsofticm.com/imp/v3/incidents/details/250704607/home)                                                                                          | [TODO] how tac report works, where the data source                                                                                                    |
| Graph API related issue               | Skype Platform Service/Server Platform                      | [280324784](https://portal.microsofticm.com/imp/v3/incidents/details/280324784/home)                                                                                          | [TODO] how graph report api works. where's the data source                                                                                            |
| Scheduling Service                    | Skype Calling / NGC Meeting Core                            | [373614973](https://portal.microsofticm.com/imp/v3/incidents/details/373614973/home) and [373614063](https://portal.microsofticm.com/imp/v3/incidents/details/373614063/home) |                                                                                                                                                       |
| Webinar Service/Virtual Event Service | Teams CMD Services and Data / Teams CMD Services            |                                                                                                                                                                               |                                                                                                                                                       |
| Yammer Service                        |                                                             | [282731708](https://portal.microsofticm.com/imp/v3/incidents/details/282731708/home)                                                                                          | Yammer hasn't onboard ICM, check this [site](https://whos-on-call.azurewebsites.net/), find the OCE under `DATA PLATFORM & INSIGHTS`                  |
| Network Issue                         | Cloudnet/Azure Frontdoor                                    | [369489539](https://portal.microsofticm.com/imp/v3/incidents/details/369489539/home)                                                                                          |                                                                                                                                                       |

<span id="triage"></span><br/><br/>

# Triage Scenarios

There are five key scenarios when do the triage of the issue. **[Missing entrance](#t1), [Missing Reports](#t2), [Download failed](#t3), [Missing Data](#t4), [Wrong Report Content](#t5)**
<span id="t1"></span><br/><br/>

## Missing entrance

Customer couldn't see the entrance of the report, the entrance contains chiclet and attendance tab. The visibility of entrance depend on multiple factors(ECS, Meeting Policy, Meeting Option, Coorganizer solution)
<span id='inmeetingtenantlist'/>

| Sub-Scenarios(Keywords/Filters)                                            | Description                                                                                                                                                                      | Example incident                      | How to mitigate                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| reporttype: inmeetingreport                                                | Customer could always see the entrance of in meeting attendance reports (this case is not missing entrance, but it's entrance related issue, it focus on the in meeting report.) |                                       | [ByDesign]Those tenants can always use in-meeting report feature regardless of the policy value, tenant list please see [Reference-TenantList](#tenantlist)                                                                                                                                                                                                          |     |     |
| meetingrole: coorganizer<br/> environment: GCC/GCCH/DOD                    | Co-organizer couldn't see the entrance of reports in GCC/GCCH/DOD environment                                                                                                    |                                       | [ByDesign] Currently not support yet                                                                                                                                                                                                                                                                                                                                 |
| meetingrole: coorganizer<br/> entrancetype: calendar-attendancetab         | Co-organizer couldn't see the attendance tab when viewing the meeting through calendar                                                                                           |                                       | [ByDesign] Don't support co-organizer in calendar due to co-organizer feature crew limitation. the coorganizer thread property couldn't be accessed, We'll support it once new calendar GAed. [Workaround] View the report through chat panel, then the coorganizer can see the attendance tab                                                                       |     |
| meetingrole: coorganizer<br/> meetingcreatedfrom: outlook or sharedmailbox | Co-organizer couldn't see the entrance of reports for the meeting created through shared mailbox/outlook                                                                         | 385230317<br/>390137157<br/>393908249 | [Limitation] Currently not support yet, due to technical limitation the coorganizer thread property is not set. tracked by [Support co-organizers to access attendance report](https://domoreexp.visualstudio.com/MSTeams/_workitems/edit/3166047) [Workaround] Reset the co-organizer in Teams - meeting options, More details please see [References](#resetcoorg) |
| meetingrole: coorganizer<br/> meetingtype: channelmeeting<br/>             | Co-organizer couldn't see the entrance of attendance reports in chat or attendance tab for channel meeting                                                                       | 381027050                             | [Limitation] The coorganizer thread property is overrided. tracked by [Support co-organizers to access attendance report](https://domoreexp.visualstudio.com/MSTeams/_workitems/edit/3166047). [Workaround] Reset the co-organizer in Teams - meeting options, More details please see [References](#resetcoorg)                                                     |
| meetingrole: coorganizer<br/> meetingtype: regularmeeting                  | Co-organizer couldn't see the entrance of attendance reports in chat or attendance tab for regular meeting                                                                       |                                       | [Limitation] The coorganizer thread property is overrided. tracked by [Support co-organizers to access attendance report](https://domoreexp.visualstudio.com/MSTeams/_workitems/edit/3166047). [Workaround] Reset the co-organizer in Teams - meeting options, More details please see [References](#resetcoorg)                                                     |
| entrancetype: calendar-attendancetab                                       | ~~Organizer couldn't see the entrance of attendance reports in the calendar view~~ supported now.                                                                                | 383110077                             | [ByDesign] there is ecs to control the visibility of attendance tab in calendar context, sometimes organizer couldn't see the tab due the ecs is not open                                                                                                                                                                                                            |     |
| meetingtype: channelmeeting<br/>entrancetype: post-chiclet                 | Customer couldn't find channel meeting's report download chiclet from its post comments                                                                                          |                                       | [Limitation]Channel 2.0 team no longer provides report control messages after an update. Due to there is no official announcement of support channel meeting report, this is new feature not bug. [Workaround] View the report through attendance tab                                                                                                                |     |
| others:meetingpolicy<br/>tac                                               | Customer couldn't see the entrance of attendance reports                                                                                                                         |                                       | [ByDesign]The visibility of the entrance is controled by admin config/organizer config/ecs feature flag/user role/user env. Please make sure set correctly, more details please refer [References] how meeting policy works.                                                                                                                                         |     |

<span id="t2"></span><br/><br/>

## Missing Reports

Customer couldn't see some reports in attendance tab. The report list are retrived from backend service, the potential reasons are 1: wrong config of meeting policy/meeting options. 2: issues in report generation. 3: issues in retrive report list.
| Sub-Scenarios(Keywords/Filters) | Description | Example incident | How to mitigate |  
| ------------------------------------------------------ | --- | ----------------------|-------------------|
| meetingtype: channelmeeting <br/> entrancetype: attendancetab |Customer couldn't see some reports in attendance tab for channel meetings | 382143126<br/>392141826<br/>391672387| [Issue]There is an issue when handling channel meeting's report list. Tracked by [Task 3099921: Enhance the channel meeting to support meetings with different messageId](https://domoreexp.visualstudio.com/DefaultCollection/MSTeams/_workitems/edit/3099921)
| meetingperiod: lessthanonemonth <br/>others:meetingpolicy |Customer couldn't see some reports in attendance tab (less than one month) | | Possible reason [ByDesign] The organizer disable the generation of attendance report for these reports, For less than one month report, we can check the meeting policy by cfv. otherwise please refer below oldmeeting case|
| meetingperiod: oldmeeting/morethanonemonth |Customer couldn't see some reports in attendance tab for some old meetings | 392815853<br/>381465940| usually the related logs retention time is only one month, [Limitation] We can't provide any help due to MS policy, suggest customer to provide reproduce steps or raise the ICM within one month.
<span id="t3"></span><br/><br/>

## Download failed

Customer couldn't download report through chiclet. The possible reasons of download failed are 1: Auth failed(401/403) 2: Network Issue(Finished) 3: not found(404)
| Sub-Scenarios(Keywords/Filters) | Description | Example incident | How to mitigate |  
| ------------------------------------------------------ | --- | ----------------------|-------------------|
| harstatuscode: 401/Unauthorized |Customer download report failed through chiclet with status code 401| 395636359<br/>378904438 | [Transfer] transfer to client auth team |
| harstatuscode: 403/Forbidden |Customer download report failed through chiclet with status code 403| | [workaround] Please ask the customer to make sure the user is the organizer/coorganizer of the meeting|
| harstatuscode: 404/Notfound <br/>meetingperiod: lessthanonemonth |Customer download report failed through chiclet with status code 404| 393905120 | Steps to verify 1:check if the enableengangementreport is enabled in meeting policy and enableattendancereport is enabled in meeting options, this can be verified by CFV data, if any is not enabled, then this is [ByDesign] <br/> 2: If both enabled, please check if NGC send the meeting end signal to TMIS/MSAI, if not, then please tranfer to NGC<br/> 3: if sent, then check the logs in TMIS/MSAI, check if there is error when generating report, more details please refer [References]How to investigate download failed 404|
| harstatuscode: 404/Notfound <br/>meetingperiod: oldmeeting/morethanonemonth |Customer download report failed through chiclet with status code 404| | usually the related logs retention time is only one month, [Limitation] We can't provide any help due to MS policy, suggest customer to provide reproduce steps or raise the ICM within one month.|
| harstatuscode: Finished|Customer download report failed through chiclet with the Network status code - "Finished" or just empety |[369489539](https://portal.microsofticm.com/imp/v3/incidents/details/369489539/home) |[Transfer] transfer to Cloudnet/Azure Frontdoor |
<span id="t4"></span><br/><br/>

## Missing Data

There are some data/users missed in the attendance report. The data is controlled by MeetingPolicy/UserSetting/SpecialHandle. Most of the case are by design/limitations.
| Sub-Scenarios(Keywords/Filters) | Description | Example incident | How to mitigate |  
| ------------------------------------------------------ | --- | ----------------------|-------------------|
| customertype: MSIT |Customer couldn't see some MSIT users in report || It's a requirement from CELA, some countries' users shouldn't be tracked. country list please see [Reference-CountryList](#countrylist)<span id="missingdatacountrylist"/> ||
| customertype: MSIT |Customer couldn't see some MSIT pstn users in report || [ByDesign] Privacy requirement.||
| contenttype: Email of anonymous user |Customer couldn't see anonymous users' email in regular meeting's report | 279144231| by design|
| meetingtype: overflow meeting <br/> others:streaming |Customer couldn't see overflow users in report | | [ByDesign] This is bydesign, NGC team is still working on it. ||
| meetingpolicy: allowtracking<br/> |Customer couldn't see some users in report, even set 'everyone' in meeting policy |393381369<br/>387895648 | [ByDesign] The allowtracking value is calculated through ecs/tac/userseeting. and it's an per-attendee meeting policy, more details please refer [References] How meeting policy ||
| reporttype: inmeetingreport |Customer couldn't see participants data in in meeting report |399847288 | [Issue] tracked by [3166216](https://domoreexp.visualstudio.com/DefaultCollection/MSTeams/_workitems/edit/3166216) | |
<span id="t5"></span><br/><br/>

## Wrong Report Content

The are some wrong data/dataformat in the attendance report. Possible reasons for wrong report content are 1: wrong data source, 2: Issues in handling raw data.
| Sub-Scenarios(Keywords/Filters) | Description | Example incident | How to mitigate |  
| ------------------------------------------------------ | --- | ----------------------|-------------------|
| meetingpolicy:partialredaction<br/> |Customer could see users's join leave time in report, even set 'only who attended' in meeting policy |382718634<br/>391783098<br/>381814963 | [ByDesign] The partial redaction value is calculated through ecs/tac/userseeting. and it's an per-attendee meeting policy, more details please refer [References] How meeting policy ||
| reporttype: inmeetingreport | The in meeting report didn't respect meeting policy | | [Limitation] currently in meeting policy didn't respect meeting policy|
| meetingtype: channelmeeting<br/> |Incorrect report content when downloaded in channel meeting | | [Limitation] Channel post comments context can't get correct callId but just thread's latest callId. Due to there is no official announcement of support channel meeting report, this is new feature not bug. [Workaround] View in attendance tab. | |
| others: ngc |The participants is empty in the report, the duration is wrong | 300091638<br/>261967887 | [Transfer] Verified the NGC data, Meeting doesn't end gracefully, Transfer to NGC team|

<span id="limitations"></span><br/><br/>

# Known limitations and enhancement

| Scope           | Reason and Limitation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Enhancement                                                                                                                                         | Workaround                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Co-organizer    | The support of co-organizer is implemented through set 'coOrganizerIds' in Chat Service's thread property, the code is implemented in MiddleTier service[link](https://domoreexp.visualstudio.com/Teamspace/_git/Teamspace-MiddleTier?path=/Source/Provider/Provider/MeetingsOptions/V1/MeetingsOptionsProvider.cs&version=GBdevelop&line=779&lineEnd=779&lineStartColumn=13&lineEndColumn=58&lineStyle=plain&_a=contents). but <br/>1) not all the cases that setting coorganizer will call this method. such as set coorganizer for virtual event or set coorganizer through outlook, <br/>2) The method are not rolled out in all environments, such as GCC/GCCH/DOD <br/>3) the thread perperty is nest inside a shared thread property, some other methods may override the thread property without keep the old value. <br/>Due to above reason, there would be limitations for co-organizer, such as <br/>1) Couldn't see the entrance accidently <br/>2) Couldn't see entrance for channel meeting <br/>3) couldn't see entrance for meeting created by outlook/mailbox | [Support co-organizers to access attendance report](https://domoreexp.visualstudio.com/MSTeams/_workitems/edit/3166047)                             | Reset co-organizer, More details please see [References](#resetcoorg) |
| Meeting policy  | The meeting policy allowtracking is per-attendee policy, but due to the in-accurate public docs and dropdown options in tac, customer would consider it an organizer/meeting level configuration. besides the configruation in tac there are also user's privacy settings and special handle in TMIS. [besides] The privacy setting not work in real time on T2.1 Due to above reason, sometimes there would be icms said that we have set 'who in report' to 'everyone' but still miss some users.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | [Task 3160283: Refine meeting policy strings in TAC](https://domoreexp.visualstudio.com/MSTeams/_workitems/edit/3160283)                            |
| Channel meeting | The structure of regular meeting is threadId-callId(1:n), but the channel meeting's structure is threadId-messageId-callId(1:n:n), while the coorganizer's support is thread level. There will be cases that the coorganizer is overrided for different messageId, thus the coorganizer couldn't see the entrance                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Overall tasks for channel meetings: [Users can use reports in Channel meetings](https://domoreexp.visualstudio.com/MSTeams/_workitems/edit/2767344) | View the attendance report through the attendance tab                 |
|                 | In meeting post channel, due to technical limitation, we couldn't get the correct callid There will be cases that the downloaded report are always the same even click different chiclet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                     |
|                 | Channel 2.0 team no longer provides report control messages after an update. There will be cases that the chiclets are missing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                                                                                                     |
|                 | Client side always fetch at most 10 calls for the threads, if the calls belong to differnt messageId. There will be cases that customer couldn't see any report in attendance tab or could only see some reports in attendance tab.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |                                                                                                                                                     |

# The Key fields/logs/evidences

the logs/evidences need collected by support and customer.
| Data | Description |  
| ----------------------------------------------| ----------------------------------------------------------- |  
| Customized Fields | ThreadId,CallId,TimeStamp,meetingjoinurl <br/> samples: <br/>a normal meeting's threadId: `19:meeting_Y2Q2ZTg4YmUtZWMzNS00ZjhmLWFkODQtZTVkODA0MjJjYzVl@thread.v2` <br/>a channel meeting's threadId: `19:RxfJhLYjomN91l2U5Og8SvAKv2PY1G45DjMAxQLxQMU1@thread.tacv2` <br/> a meeting join url: `https://teams.microsoft.com/l/meetup-join/19%3ameeting_Y2Q2ZTg4YmUtZWMzNS00ZjhmLWFkODQtZTVkODA0MjJjYzVl%40thread.v2/0?context=%7b%22Tid%22%3a%2211929c11-5570-47fb-bd7d-597b6413cf94%22%2c%22Oid%22%3a%224884dcc4-0bab-4620-9ec2-3f2b05e59e0a%22%7d` |  
| Screenshot | The scresshot usually should contains the UI of the user experience, like chat panel/meetingoption/attendancetab and also the screeshot of the attendance report. which should give a baisc information of the issues mentioned in ICM. |  
| HAR | The requests that frontend send to backend service. should care about the url request destination, the url pattern, the response status code, the request payload and the response body. the scenarios usually we need to collect har is download failed, missing reports in ar tab. sometimes we also collect har for meeting options. for how to collect har, please refer the [References] [Collect HAR](#collecthar) |  
| PSR | Sometimes we couldn't reproduce the issues customer mentioned, we need to know the detailed steps that cx taken, and cx couldn't provide recording due to some policies, cx/support could provide PSR(Problems steps recorder), Please make sure that the screenshots in the psr files are visiable. |  
| BRB/DiagnosticLogs | The brb or the diagnostic logs contains the details information for the user's client side, it's logged by frontend codes, it contains ecs,meetingpolicy and also the logs for user actions. which will give a detailed logs for the user's setting or actions. for how to collect brb, please refer the [References] |  
| MeetingPolicy | Sometimes we need to make sure that the meeting policy are correctly configed, especially for the policy configed per attendee. there are powershells that we can get the policy and also we can get the policy through TAC. tips: we couldn't set meeting policy for guest users. the policy for guest users are default/hard-coded config. |  
| CSV | The csv file of attendance report |

different data needed for different scenarios, the customized fields are required for each scenario.
| Senario | Data |  
| ----------------------------------------------| ----------------------------------------------------------- |  
| Missing entrance | DiagnosticLogs,HAR,MeetingPolicy,Screenshot |
| Missing Reports | HAR |
| Download failed | HAR |
| Missing Data |HAR,CSV or screenshot,MeetingPolicy for the missing attendee|
| Wrong Report Content | HAR,CSV or screenshot,MeetingPolicy for the wrong attendee|

Tips:

- How to access GCCH/DOD data? Example icm: 381623065, the access to the data/logs provided by GCCH and DOD tenant are restircted.
  Restricted Access: This is a GCC High/DoD tenant. No Support SOP's are available to engineers. Escort: If you don't have access to the restricted tenant, invoke your escort process here https://skype.visualstudio.com/SKYPECENTRAL/_wiki/wikis/SKYPECENTRAL.wiki/167/Teams-Fairfax-Devops-Escort-Interaction?anchor=escort-assistance-for-24x7-troubleshooting---new-(from-07/01/2019))
  Files: Files are in the DTM and cannot be uploaded to the bug. If you don't have access, invoke your escort process as indicated above. For permanent access, fill out a Standing Access request here: https://aka.ms/USGovCloudSupport
  sample DTM: https://dtmffprodclient.usgovtrafficmanager.net/Home?srNumber=2302130040007958

The logs/evidencs need investigated by engineers.
| Data |Keyword| Description |  
| ----------------------------------------------- |-----| ----------------------------------------------------------- |  
| **CFV** |attendancereport| [Example Link](https://ngc.skype.net/call/ef967dc9-a55d-4205-ab5d-aef19065e5fc/) |  
| **TMIS log** |TraceTelemetry message,traceId,operation_id| [Example Link](https://dataexplorer.azure.com/clusters/msteamsrow.southcentralus/databases/TeamsGraniteFabric?query=H4sIAAAAAAAAA82TQU/jMBCF7/kVo16aSlFZsXuDgBDqokrLgkruaJIMjZE9LuMxFSt+PE5L1bDLaRESJ8vznj7b78mWFIKiaGUcQQm49PlhNznKbBKI29cx+3X+OjRtuLr78e172dgYlCQfu7SgCxTbespetKMofkXjybRFxRoD5eOqd1wIslH6ibWYJskLeogUtCJLjlSesmeIbDzD32jx62nwUbuGWAWT+l/wdUdCAGdh9Zv03AvN+NGIZ5eo0HhWNBxgtBLfjgC5hYW3NOeUDzc0MKgzYWuo5pezm+rs8hpOykGOb6Xjcpdk1gtCIdp0fJuCLSElubFHsdBhgt8ZS6ej7OAAniHd5J4a3bOK3lcMEMWbOxaQchfUlOHtvM32gOH4aMsO0TkU86d/WGTNJ1A/AYl4WRAGz8V2cxPr/pzs421Xgg19Ttf/oL9G07/okWxf8uFmOywBDEO++0qT7N2qHYWAy1TqhvMCAXC9l6oDAAA=) |  
| Frontend log |||
| MiddleTier log |mttracev1,mtrootrequestv1 Trace_Message,ApiName| [Example Link](https://dataexplorer.azure.com/clusters/msteamsrow.southcentralus/databases/TeamsGraniteFabric?query=H4sIAAAAAAAAA11SO0/DMBDe+yusLFkw2K5TOwNDkwbEUBWJwIqc5NIapU6wXVj48ThtKlokS37cfY+7897bvvcWPg/g/Bed3d2hH/S9AwvIgf0CO4V0g+7vUZQITtLVsphnKeXLPFmKvOBC5ILwPEkyEl0SZAfdNW9gne4N2imHIkbYnCyIuGVYNbu+xtp4TBYRuoSpQRu1B1T3xittAuw1WMnDzfZdB/aocVr/IUeR6+z3R/DjS2mVcbXVg18DeG22L+DHzUWzM4sHo4x/OlYaE0I4zCnDsm0p5pzwcGIVhlbKRLaCENHESJkGHQL7pvqA+gyVbCGkSiVWtKowb9MEKxKgCaukqFouZUPj2X/vf/XGk0O3GXxonbso5nVolIcpPoVHqk7vtUeUnPo42H60g/I+jK9TY1aptjeT0k35tC5eyuX6eczee29VDdejvwYeJ5/RIsx7wfKHQvIs/IE5ZwnL6GpFeLZKeXQtXY6k72twTm0vFH8BZII5Km8CAAA=) |  
| CMD Artifact - GCC log |TraceTelemetry message,traceId,operation_id| GCC connection string: https://govmsteams.usgovtexas.kusto.usgovcloudapi.net To connect to the Gov databases, you have to use Kusto desktop client and choose dSTS-Federated auth under "Security". You have to use your MSFT/CORP credentials (not Torus) and use Windows Hello authentication (preferred) or Physical Smart Card. Detailed steps: [Main Kusto for MT Service](https://dev.azure.com/domoreexp/Teamspace/_wiki/wikis/Teamspace.wiki/9128/Main-Kusto-for-MT-Service?anchor=manually-connect-to-gov-cluster)
| MSAI log - ArtifactService |ActionItemsLogs CorrelationId, `Received a request for posting artifact types for a call` callId| [Example Link](https://dataexplorer.azure.com/clusters/cortanadiagnosticslogs/databases/CompliantCortana?query=H4sIAAAAAAAAA4WTYW/aMBCGv/dXnPyJTAl10o4CWycoVBVSA+vmL6WrkJtcwCwkzL61o+qPnyEh0I2tUqQk53ufu3ttp0hgSGoSaoFwDrEkJPtZYwEPAo+feAEXnLc3z5g5H45Sq8As/nf+yev8bkQqzwaEC3OdT83RCzzNUCOIQXj5VXTDz/Bp18GB1Y/batVaiMbIKRYq86RoBuwLRqgeMQYJGn/8REOQ5BqWuSGVTcEmqkRGBLRaotksSYhkmta/ZewvcJRnJFVmgPmt9gJxjZgMr4aLWxHPR/0bGvVDP+xxPhIX6bWY+qG4oTC4XI3FLR9fDefj/oXq0EyjjOuPAYPjYyj+QMX1/5Rr8pafnDW5Z9/cOw34g/eQvG95zWbUOPNbjcSXDQZr3Lr3Eoa/yDoEMVpIauyemGWqqFbSXWB2RGeXl+upzNQz6onM4okNSao0NkVbl2pstE2CQb8Ntfo7h7ngu0DWT23dqJXV7vx7x7ElOvsVKvEgtuRKcqDwHb/f0wkbyuhtkf9KtPF1I9p232FF8K3eA9v7DtSzjv6B6W5PzXdcmQJ1XvKCA7zTgrfU+RytqJdrjancnP7YrbZjzx23GtndjuGWfbi7G/AbbsnHiKMDAAA=) |  
| MSAI log - ArtifactService - GCC ||[Example Link](https://portal.microsoftgeneva.com/s/25847F4C) |  
| MSAI log - SCIS Service |ScisChangeEvent_Global ClientRequestId, `Summary` | [Example Link](https://dataexplorer.azure.com/clusters/o365monwus.westus/databases/o365monitoring?query=H4sIAAAAAAAAA22SQW/iMBCF7/wKry8EqQ1JCm033V0tomyF1EBbskLlgtxklJg6No0nRF31x9eQEtKlN2vefM/2mxGARCPLMeQZkJ+EJcry0s5VSxgBZPxRlqq0TLHbJeI/IGYIaI4W9RzPO3UuTt3L0HV8p+f3zuyLXr9/6S3ogT14HpOeF7r9Y3KLYZoDi8ex4aj73c/AoDJZBqtBb3I9KifzAKc3k+dg5jiLcFzezv+I6fweg1XKH+eBt7i+f30MBf9d+dgbj1a+kcpzEAy5kjvzSBQaIbeoEZBJFnOWSKWRR1qoRNvPRlZ2yWWsSm1LQNqxzUfYE9NgtYcqWwvOJA4rut2xB9HOGyHTt8ag9UbKFHIg4TgYzcJBcEd+NfJkMm4oP+q0tvUAtGYJVN265JgS+vdh7JMuW/PuxuuqPGGS/9u+fgfURKQkMi41oQFgqmKf3E1nISWfbL8durKqRFtNvZb3ozBfWedqBRGSYTPFkxp5I4JnHIl71drn2lZn5/1MybLQdgkaiy8ibTcj/ejnqHIzcCPNIq6HKZMJjDYgcXkj1BMTda4gN8vtVh3FWgt1qjUzFNw4PcBLYV5k1oBLYn1ajE4VVfbFBGZFlrH81aeNOPZXneyJdyAXAOVmAwAA) |  
| MSAI log - SCIS GCCH/DOD ||[Query SCIS GCCH and DoD](https://microsoftapc.sharepoint.com/teams/SOXTeams/_layouts/OneNote.aspx?id=%2Fteams%2FSOXTeams%2FShared%20Documents%2FMeeting%20Report%2FMeetingReport&wd=target%28SCIS%20-%20Onboarding.one%7C6F5F0554-66DF-4498-82F9-7120317C1585%2FQuery%20SCIS%20GCCH%20and%20DoD%7C5B7CA8A4-C143-4B08-B8FA-2CE2F724C083%2F%29)
| ECS ||

Tips:

- TMIS & MT & CMDArtifact share the same kusto clusters and databases(TeamsGraniteFabric).

# References

<span id="countrylist"><br/><br/></span>

## [R1] Country list

Some users not shown in attendance reports. mentioned in [Link](#missingdatacountrylist)
<br/>It's a requirement from CELA,some countries' users shouldn't be tracked. country list: Austria, Belgium, Bulgaria, Croatia, Cyprus, the Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, the Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, and the United Kingdom, Iceland, Liechtenstein, and Norway, South Korea and Russia, China  
<span id="tenantlist"><br/><br/></span>

## [R2] Tenant list

Some customers could always see in meeting reports. mentioned in [Link](#inmeetingtenantlist)

"05a0e69a-418a-47c1-9c25-9387261bf991", "0cdcb198-8169-4b70-ba9f-da7e3ba700c2", "18492cb7-ef45-4561-8571-0c42e5f7ac07", "3485b963-82ba-4a6f-810f-b5cc226ff898", "4578f68f-86cd-4af9-b317-93e3826ca0f5", "6a7d403b-39e8-4da0-be4a-828a8ccb59b3", "7e4ad44a-fe90-40b3-9a85-41f3726c50c9", "8deb1d4d-d0a4-4d04-89ae-f7076cbaa9fb", "9360c11f-90e6-4706-ad00-25fcdc9e2ed1", "973ba820-4a58-4246-84bf-170e50b3152a", "a0b12cb2-d411-44ee-a2aa-2aa055a64cb6", "b50daf19-b943-4734-9bb2-292a55b4e912", "c65a3ea6-0f7c-400b-8934-5a6dc1705645", "d7d161b0-844d-4ca2-a808-6e032673f8cc", "d92c92d5-676a-4f74-b9fe-02f7ae57db25", "d96cb337-1a87-44cf-b69b-3cec334a4c1f", "da49a844-e2e3-40af-86a6-c3819d704f49", "e485946d-a44c-479f-85ff-b4a0925f0b39", "eeacb5cb-5370-4358-a96a-a3783c95d422", "f891e8af-0b2e-445e-87f6-64446b016889", "fc2b8238-9289-425f-b1b7-b27003d711f3", "8c4b47b5-ea35-4370-817f-95066d4f8467", "264b9899-fe1b-430b-9509-2154878d5774", "0ee9b5f9-52b3-4351-8198-c4804cd66b68", "19309433-eec0-484d-bde9-dd255cdc1ed6", "1fd4673f-df96-4621-8638-a1d88c4c85d7", "2b3b311e-177e-479a-8cb2-cbc43cb41fc5", "30f488da-74cf-4ac6-9f34-40583320daa4", "351870f2-4eec-4c75-805a-4db4f811aea1", "4e9dbbfb-394a-4583-8810-53f81f819e3b", "6370a6c0-7b90-4709-bd6e-59c28ede833b", "64f97741-c470-495e-bd77-4b3003f3a9af", "733c9305-39d7-461a-866f-fdf27bf3c7ff", "7a916015-20ae-4ad1-9170-eefd915e9272", "7aa9292c-a052-434a-9ab7-5bd0ad479474", "7b7dc2f5-4e6a-4004-96dd-6c7923625b25", "7c4357a6-cad4-4f49-bca2-153d47af5ae7", "7d30f33f-8bbb-4685-804b-9afcd2d1658d", "8c4858b5-f020-483a-b7ef-71ded6e81767", "90592b52-d760-466f-bb25-3098a7cf80e0", "912a5d77-fb98-4eee-af32-1334d8f04a53", "9c5012c9-b616-44c2-a917-66814fbe3e87", "9e2f1485-3e53-4662-b1de-0c2bcb66d447", "a9c6fa70-d6e2-4563-adf3-0b24d921b140", "b67d722d-aa8a-4777-a169-ebeb7a6a3b67", "c82f2d55-67d0-4a4a-8820-2f84a18c1cdd", "c972a348-dcb3-4d4d-b449-2136a50d84d4", "cb856884-1379-4c62-8016-278f19cc570b", "cf72e2bd-7a2b-4783-bdeb-39d57b07f76f", "d193e68c-e53f-4610-a66d-56ff300fec7a", "e36726e9-4d94-4a77-be61-d4597f4acd02", "ed38466c-b641-437d-9ae9-d801b829fa94", "edf442f5-b994-4c86-a131-b42b03a16c95", "f1e31150-57dd-4b78-9208-3c24b9366a23", "fabb61b8-3afe-4e75-b934-a47f782b8cd7", "031a3bbc-cf7c-4e2b-96ec-867555540a1c", "042a40a1-b128-4ac4-8648-016ffa121487", "0d18bfe2-7051-44cb-9cc5-18027eb1cfd0", "17317bba-81f5-4c4a-bf4b-081e8fc27724", "19646c18-1578-452e-b5fb-8504eb919aaa", "19e2b708-bf12-4375-9719-8dec42771b3e", "29bebd42-f1ff-4c3d-9688-067e3460dc1f", "35d59036-0257-499b-a738-5fa931a1d169", "4c8e5fff-8339-44f1-8c5a-7cf5e537e6da", "4e48955e-4086-41a6-97da-f6ec42d10af6", "5b973f99-77df-4beb-b27d-aa0c70b8482c", "be73ba9d-1d9a-4698-b9ae-6d5eab36e08e", "c22cfe42-7ef4-4032-b4e2-0ea8e1a7378d", "d44ff723-4fa7-405e-afc0-43c21e573043", "df5e0802-a654-4327-a868-76b71fece1f5", "f4b4f9cd-c417-4e65-8143-10d0fe789053"

## [R3] how to collect har log<span id='collecthar'/>

Please copy the link of this section about how to collect har and past as comment in the ICM or copy the below step if couldn't access.

Could you help customer to download the har with enable "disable cache"? You can follow below steps:

1. Use chrome to visit Teams website: https://teams.microsoft.com,
   click on Chat icon on left navigation panel and then click on the meeting with issue. then stay on the chat tab.
   <br/> for channel meeting, please also make sure you stay on the chat tab of the meeting.
2. open devtools -> network tab, enable the "disable cache":

   ![har1](./har_1.png)

3. stay on the chat page, **force refresh current page (ctrl+shift+R)**, the page will turn to blank and load again.
4. click one of the report with issue. (if there is download chiclet/button)

   ![har2](./har_2.png)

5. click on the meeting attendance tab(if there is attendance tab) and click download link (if there is download link):

   ![har3](./har_3.png)

6. verify the har, filter the request with keyword:`attendancereport`, **make sure there is at least one request with the keyword**.

   ![har4](./har_4.png)

7. click chrome devtools network export har file button:

   ![har3](./har_5.png)

## [R4] how to collect diagnostic log

ctrl+shift+alt+1

## [R5] how meeting policy works.

![](./allowtracking1.png)
![](./allowtracking2.png)

Teams attendance report has three policies to control user's behaviour:

| PolicyName                                                  | PolicyValue                   | DisplayValue                           | Description                                                                                                                                |
| ----------------------------------------------------------- | ----------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| AllowEngagementReport<br/>`Attendance Report`               | ForceEnabled                  | On                                     | Enable all report entrances for the user as meeting organizer                                                                              |
|                                                             | Enabled (default)             | On , but organizers can turn it off    | and organizer can decide whether or not to generate report by specific meeting's meeting options toggle                                    |
|                                                             | Disabled                      | Off                                    | Disable all report entrances for the user as meeting organizer                                                                             |
| AllowTrackingInReport<br/>`who is in the attendance report` | Enabled                       | Everyone                               | Enable logging of participant information when the user joins meeting                                                                      |
|                                                             | Disabled                      | No one                                 | Disable logging of participant information when the user joins meeting                                                                     |
|                                                             | EnabledUserOverride (default) | Everyone, but participants can opt-out | Enable logging of participant information when the user joins meeting, and user can decide to disable it by client privacy settings toggle |
|                                                             | DisabledUserOverride          | No one , but participants can opt-in   | Disable logging of participant information when the user joins meeting, and user can decide to enable it by client privacy settings toggle |
| InfoShownInReportMode <br/>`Attendance Summary`             | FullInformation (default)     | Show everything                        | Logging all information when the user joins meeting                                                                                        |
|                                                             | IdentityOnly                  | Only show who attended                 | Only logging name&email&role when the user joins meeting                                                                                   |

## [R6] how to investigate download report failed

### 1. Check whether TMIS/MSAI received the retrivement requests.

check the request logs[TODO:provide sample logs] to make sure it's due to TMIS/MSAI service exception or other dependency issue(report not generated), if dependency issue, move to next step.

### 2. Check whether TMIS / MSAI Artifact Service generated attendence report

If customer has correct prerequirement for attendance report, we need to check whether the report has been correct generated - If report is not generated, please transfer to **MSAI Meeting Intelligence/MSAI Meeting Intelligence**

### 3. Check the cfv according to the callId provided by customer. Make sure the meeting end signal/NGCParticipantsActivity have been sent to TMIS/MSAI.

Use CFV portal to confirm, try search the attendancereport. according to the scheduling service's reponse, you can also check the meeting policy.
https://ngc.skype.net/call/e62ec843-c1be-406e-94d6-19a7a241f889/
![](./cfv.png)

### 4. Check customer's network har file

If you already confrimed the MSAI & NGC log have no issue, you can ask customer to provide the network har file that when they view/download report. [Collect HAR](#collecthar)

- If the report response status code is not number but "Finished"/just empty, please transfer to **Cloudnet/Azure Frontdoor**
- If the report response is empty array or other error, please transfer to **MSAI Meeting Intelligence - MSAI Meeting Intelligence**

## [R7] [Teams Admin Center](https://admin.teams.microsoft.com/policies/meetings)

![tac](./TAC.jpg)

## [R8] Can support escalate incident to sev2?

You can check the latest Teams CEN document to double confirm whether support can escalate incident to sev2 -[Teams CEN](https://microsoft.sharepoint.com/teams/SkypeTeamsMajorIncidents/Shared%20Documents/Forms/AllItems.aspx?id=%2Fteams%2FSkypeTeamsMajorIncidents%2FShared%20Documents%2F%28MI%29%20Major%20Incidents%20%28Teams%29%2FIncident%20Management%20Processes%2FTeamsCEN%2Epdf&parent=%2Fteams%2FSkypeTeamsMajorIncidents%2FShared%20Documents%2F%28MI%29%20Major%20Incidents%20%28Teams%29%2FIncident%20Management%20Processes&p=true)

As of 2023/5/5 of Teams CEN, report related incident can be escalated to sev2 in this scenario: Pre-/Post-Meeting Webinar issues
(Registration, Attendance Report)

## [R9] Reset the co-organizer <span id='resetcoorg'/>

Make sure take below steps through Teams's meeting option.

1, Open the meeting details:<br/>
![Meeting details](./reset11.png)

2, Click the meeting options and navigate to a new page.<br/>
3, Make sure the coorganizer is selected and then click save.<br/>
![Meeting option](./reset21.png)<br/>
4, co-organizer restart the client to check attendance report.
<br/>
<br/><br/><br/>
Tips: there are other ways to setup coorganizer, but sometimes they may not work for attendance reprt. plesae follow above steps.
setup through outlook:
![Set through outlook](./reset31.png)
setup through meeting option pop up:
![Set through popup](./reset41.png)

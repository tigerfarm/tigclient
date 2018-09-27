<?php
// Load Twilio PHP Helper Library.
// require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
require __DIR__ . '/../twilio-php-master/Twilio/autoload.php';

use Twilio\Rest\Client;
use Twilio\Jwt\TaskRouter\WorkerCapability;

// -------------------------------------------------------
$account_sid = getenv("ACCOUNT_SID");
$auth_token = getenv('AUTH_TOKEN');
$client = new Client($account_sid, $auth_token);
// -------------------------------------------------------
$workspace_sid = getenv("WORKSPACE_SID");
$activities = $client->taskrouter->v1->workspaces($workspace_sid)->activities->read();
$activity = [];
foreach ($activities as $record) {
    $activity[$record->friendlyName] = $record->sid;
    $activityName[$record->sid] = $record->friendlyName;
}
// -------------------------------------------------------
$workerSid = 'WK10ec1823ae8a54d715ba424599ea473f';   // For worker: David
$capability = new WorkerCapability($account_sid, $auth_token, $workspace_sid, $workerSid);
$capability->allowFetchSubresources();
$capability->allowActivityUpdates();
$capability->allowReservationUpdates();
$workerToken = $capability->generateToken(28800);  // Expire: 60 * 60 * 8
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Tiger Voice</title>
        <link href="custom/favicon.ico" rel="shortcut icon" type="image/x-icon">
        <script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
        <script src="https://media.twiliocdn.com/sdk/js/client/releases/1.5.1/twilio.min.js"></script>
        <script src="client.js"></script>
        <!-- script src="clientTr.js"></script -->
        <link rel="stylesheet" href="custom/client.css">
        <script type="text/javascript">
            // -----------------------------------------------------------------
            // TaskRouter JS code
            // -----------------------------------------------------------------
            //
            let ReservationObject;
            // -----------------------------------------------------------------
            let worker = new Twilio.TaskRouter.Worker("<?= $workerToken ?>");
            setTrButtons(worker);
            worker.on('ready', function (worker) {
                logger("Successfully registered as: " + worker.friendlyName + ".");
                if (worker.attributes.skills) {
                    logger("Skills: " + worker.attributes.skills.join(', '));
                }
                if (worker.attributes.languages) {
                    logger("Languages: " + worker.attributes.languages.join(', '));
                }
                logger("Current activity is: " + worker.activityName);
                setTrButtons(worker);
            });
            worker.on('activity.update', function (worker) {
                // let activityName = worker.activityName;
                // logger("Worker activity updated to: " + activityName);
                setTrButtons(worker);
            });
            // -----------------------------------------------------------------
            function setTrButtons(worker) {
                let activityName = activityOverride || worker.activityName;
                logger("Worker activity: " + activityName);
                switch (activityName) {
                    case "Idle":
                        $('#btn-online').prop('disabled', true);
                        $('#btn-offline').prop('disabled', false);
                        $('#btn-acceptTR').prop('disabled', true);
                        $('#btn-rejectTR').prop('disabled', true);
                        break;
                    case "Offline":
                        $('#btn-online').prop('disabled', false);
                        $('#btn-offline').prop('disabled', true);
                        $('#btn-acceptTR').prop('disabled', true);
                        $('#btn-rejectTR').prop('disabled', true);
                        break;
                    case "Incoming Reservation":
                        $('#btn-online').prop('disabled', true);
                        $('#btn-offline').prop('disabled', true);
                        $('#btn-acceptTR').prop('disabled', false);
                        $('#btn-rejectTR').prop('disabled', false);
                        break;
                    case "In a Call":
                        $('#btn-online').prop('disabled', true);
                        $('#btn-offline').prop('disabled', true);
                        $('#btn-acceptTR').prop('disabled', true);
                        $('#btn-rejectTR').prop('disabled', true);
                        // buttons['hangup'] = true;
                        break;
                    case "WrapUp":
                        $('#btn-online').prop('disabled', false);
                        $('#btn-offline').prop('disabled', false);
                        $('#btn-acceptTR').prop('disabled', true);
                        $('#btn-rejectTR').prop('disabled', true);
                        break;
            }
            }
            // -----------------------------------------------------------------
            function goAvailable() {
                logger("goAvailable(): update worker's activity to: Idle.");
                worker.update("ActivitySid", "<?= $activity['Idle'] ?>", function (error, worker) {
                    if (error) {
                        console.log(error.code);
                        console.log(error.message);
                    }
                    ReservationObject.task.complete();
                });
                logger("---------");
            }
            function goOffline() {
                logger("goOffline(): update worker's activity to: Offline.");
                worker.update("ActivitySid", "<?= $activity['Offline'] ?>", function (error, worker) {
                    if (error) {
                        console.log(error.code);
                        console.log(error.message);
                    }
                });
            }
        </script>
    </head>
    <body>
        <script type="text/javascript" src="custom/pageTop.js"></script>
        <div id="chatBox">
            <div class="panelTitle">
                Dashboard
            </div>
            <div class="panelArea">
                <table>
                    <tr>
                        <td>Call to </td><td><input id="callTo" type="text"/></td>
                        <td>
                            <div class="msgCallTo" style='width: 210px;'></div>
                        </td>
                        <td rowspan="3"> 
                            <div style='margin-left: 3px;'>
                                <table>
                                    <tr>
                                        <td><button class="keyPadButton" onclick='sendDigits("1");'>1</button></td>
                                        <td><button class="keyPadButton" onclick='sendDigits("2");'>2</button></td>
                                        <td><button class="keyPadButton" onclick='sendDigits("3");'>3</button></td>
                                    </tr>
                                    <tr>
                                        <td><button class="keyPadButton" onclick='sendDigits("4");'>4</button></td>
                                        <td><button class="keyPadButton" onclick='sendDigits("5");'>5</button></td>
                                        <td><button class="keyPadButton" onclick='sendDigits("6");'>6</button></td>
                                    </tr>
                                    <tr>
                                        <td><button class="keyPadButton" onclick='sendDigits("7");'>7</button></td>
                                        <td><button class="keyPadButton" onclick='sendDigits("8");'>8</button></td>
                                        <td><button class="keyPadButton" onclick='sendDigits("9");'>9</button></td>
                                    </tr>
                                    <tr>
                                        <td><button class="keyPadButton" onclick='sendDigits("*");'>*</button></td>
                                        <td><button class="keyPadButton" onclick='sendDigits("0");'>0</button></td>
                                        <td><button class="keyPadButton" onclick='sendDigits("#");'>#</button></td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    <tr><td>Call to type </td>
                        <td>
                            <select id="callType">
                                <option value="pstn" selected>PSTN</option>
                                <option value="client">Twilio Client</option>
                                <option value="conference">Conference</option>
                                <option value="enqueue">Enqueue (caller)</option>
                                <option value="queue">Queue (agent)</option>
                                <option value="sip">SIP address</option>
                            </select>
                        </td>
                        <td><div class="msgCallType"></div></tr>
                    <tr><td>Client ID </td><td><input id="clientid" type="text"/></td><td><div class="msgClientid">Set Client ID.</div></td></tr>
                    <tr><td>Password </td><td><input type="password" id="tokenPassword" name="tokenPassword" placeholder="Your access password"/></td><td><div class="msgTokenPassword"></div></tr>
                </table>
            </div>
            <div style="margin-top: 6px;">
                <table>
                    <tr>
                        <td><button id="btn-refresh" onclick="refreshClientId();">Refresh token</button></td>
                        <td><button id="btn-call"   onclick="call();" disabled>Call</button></td>
                        <td><button id="btn-hangup" onclick="hangup();" disabled>Hangup</button></td>
                        <td><button id="btn-accept" onclick="accept();" disabled>Accept Call</button></td>
                        <td><button id="btn-reject" onclick="reject();" disabled>Reject Call</button></td>
                        <!-- td><button id="btn-reset" onclick="reset();"  style='visibility: visible;'>Reset Device</button></td -->
                    </tr>
                    <tr style='visibility: visible;'>
                        <td><button id="btn-join" onclick="join();" disabled style='visibility: hidden;'>Join</button></td>
                        <td><button id="btn-online" onclick="goAvailable();" disabled style='visibility: visible;'>Go Online</button></td>
                        <td><button id="btn-offline" onclick="goOffline();" disabled style='visibility: visible;'>Go Offline</button></td>
                        <td><button id="btn-acceptTR" onclick="acceptReservation();" disabled style='visibility: visible;'>Accept</button></td>
                        <td><button id="btn-rejectTR" onclick="rejectReservation();" disabled style='visibility: visible;'>Reject</button></td>
                    </tr>
                    <tr>
                        <td><div style='padding-top: 9px;'>Messages: </div></td>
                        <td colspan="4"><div class='callMessages' style='padding-top: 9px;'>Need to refresh the token.</div></td>
                    </tr>
                </table>
            </div>
        </div>
        <div id="logBox">
            <div class="panelTitle">
                Call session messages
            </div>
            <div class="panelArea">
                <textarea id="log"></textarea>
            </div>
            <div>
                <table>
                    <tr>
                        <td><button id="clearLog" onclick="clearLog();">Clear</button></td>
                        <!-- td><button id="playSong" onclick="playSong();">Play</button></td -->
                    </tr>
                </table>
            </div>
        </div>

        <div style="padding-top: 10px; padding-left: 12px;width: 645px;">
            <table style="background-color: black; color: black; margin: 3px;">
                <thead>
                    <tr>
                        <td style="background-color: white; color: black; padding: 3px; font-weight: bold;">Type of call</td>
                        <td style="background-color: white; color: black; padding: 3px; font-weight: bold;">Sample (Call to)</td>
                        <td style="background-color: white; color: black; padding: 3px; font-weight: bold;">Description</td>
                    </tr>
                </thead>
                <tbody style="background-color:#6782A8; border: 1px solid #000000; color: white; padding: 3px">
                    <tr>
                        <td style="background-color: white; color: black; padding: 3px;">Any PSTN Phone number</td>
                        <td style="background-color: white; color: black; padding: 3px;">+15552221234</td>
                        <td style="background-color: white; color: black; padding: 3px;">Use to call your mobile phone.</br>Use <a target="console" style='color:#954C08;' href="https://www.twilio.com/docs/glossary/what-e164">E.164 format.</a></td>
                    </tr>
                    <tr>
                        <td style="background-color: white; color: black; padding: 3px;">Client to Client</td>
                        <td style="background-color: white; color: black; padding: 3px;">david</td>
                        <td style="background-color: white; color: black; padding: 3px;">Call other Voice Clients.</td>
                    </tr>
                    <tr>
                        <td style="background-color: white; color: black; padding: 3px; ">Conference</td>
                        <td style="background-color: white; color: black; padding: 3px;">allhands</td>
                        <td style="background-color: white; color: black; padding: 3px;">Music plays until others join.</td>
                    </tr>
                    <tr>
                        <td style="background-color: white; color: black; padding: 3px;">Enqueue</td>
                        <td style="background-color: white; color: black; padding: 3px;">support</td>
                        <td style="background-color: white; color: black; padding: 3px;">Call into a Twilio queue.
                            <br/>Music plays until an agent calls the queue.</td>
                    </tr>
                    <tr>
                        <td style="background-color: white; color: black; padding: 3px;">De-queue</td>
                        <td style="background-color: white; color: black; padding: 3px;">support</td>
                        <td style="background-color: white; color: black; padding: 3px;">As an agent, call into the queue to be connected to an enqueued caller.</td>
                    </tr>
                    <tr>
                        <td style="background-color: white; color: black; padding: 3px;">SIP address</td>
                        <td style="background-color: white; color: black; padding: 3px;">david@dav.sip.us1.twilio.com</td>
                        <td style="background-color: white; color: black; padding: 3px;">Call a SIP address that is in the same account.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <script type="text/javascript" src="custom/pageBottom.js"></script>
    </body>
</html>
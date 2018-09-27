// -----------------------------------------------------------------
// TaskRouter JS code
// -----------------------------------------------------------------
//
let worker;
let ReservationObject;
var trTokenValid = false;

// -----------------------------------------------------------------
// let worker = new Twilio.TaskRouter.Worker("<?= $workerToken ?>");
function registerTaskRouterCallbacks() {
    logger("registerTaskRouterCallbacks().");
    worker.on('ready', function (worker) {
        logger("Worker registered: " + worker.friendlyName + ".");
        if (worker.attributes.skills) {
            logger("Skills: " + worker.attributes.skills.join(', '));
        }
        if (worker.attributes.languages) {
            logger("Languages: " + worker.attributes.languages.join(', '));
        }
        logger("Current activity is: " + worker.activityName);
        setTrButtons(worker.activityName);
    });
    worker.on('activity.update', function (worker) {
        logger("Worker activity updated to: " + worker.activityName);
        setTrButtons(worker.activityName);
    });
    // -----------------------------------------------------------------
    worker.on('reservation.accepted', function (reservation) {
        logger("Reservation " + reservation.sid + " accepted.");
        logger("---------");
        ReservationObject = reservation;
    });
    worker.on('reservation.rejected', function (reservation) {
        logger("Reservation " + reservation.sid + " rejected.");
    });
    worker.on('reservation.timeout', function (reservation) {
        logger("Reservation " + reservation.sid + " timed out.");
    });
    worker.on('reservation.canceled', function (reservation) {
        logger("Reservation " + reservation.sid + " canceled.");
    });
    // -----------------------------------------------------------------
}

// -----------------------------------------------------------------
function goAvailable() {
    logger("goAvailable(): update worker's activity to: Idle.");
    worker.update("ActivitySid", "WA8cdaee07d1554465405fcd1dda2dcf56", function (error, worker) {
        if (error) {
            logger("--- goAvailable, Error:");
            logger(error.code);
            logger(error.message);
        }
        ReservationObject.task.complete();
    });
    logger("---------");
}
function goOffline() {
    logger("goOffline(): update worker's activity to: Offline.");
    worker.update("ActivitySid", "WA0ab3bfa9b0954df4aeca47cd5051799d", function (error, worker) {
        if (error) {
            logger("--- goOffline, Error:");
            logger(error.code);
            logger(error.message);
        }
    });
}
// -----------------------------------------------------------------
function rejectReservation() {
    logger("rejectReservation().");
    ReservationObject.reject();
}
function acceptReservation() {
    logger("acceptReservation(): start a conference call, and connect caller and agent.");
    // https://www.twilio.com/docs/taskrouter/js-sdk/worker#reservation-conference
    // 
    // To record calls, set: "Record": "true", and enable Agent Conference:
    //     https://www.twilio.com/console/voice/conferences/settings
    //
    var options = {
        // "PostWorkActivitySid": "<?= $activity['WrapUp'] ?>",
        "Timeout": "20",
        "Record": "false"
    };
    logger("Record the confernece call: " + options.ConferenceRecord + ", Post Activity: WrapUp");
    // https://www.twilio.com/docs/taskrouter/api/reservations
    ReservationObject.conference(null, null, null, null,
            function (error, reservation) {
                if (error) {
                    logger("--- acceptReservation, Error:");
                    logger(error.code);
                    logger(error.message);
                }
            },
            options
            );
    logger("Conference initiated.");
    refreshWorkerUI(worker, "In a Call");
}

// -----------------------------------------------------------------------------
// Getting the TaskRouter Worker token.

function trToken() {
    if (trTokenValid) {
        $("div.msgTokenPassword").html("TaskRouter token already valid.");
        return;
    }
    clearMessages();
    clientId = $("#clientid").val();
    if (clientId === "") {
        $("div.msgClientid").html("<b>Required</b>");
        logger("- Required: Client id.");
        return;
    }
    tokenPassword = $("#tokenPassword").val();
    if (tokenPassword === "") {
        $("div.msgTokenPassword").html("<b>Required</b>");
        logger("- Required: Token password.");
        return;
    }
    // Since, programs cannot make an Ajax call to a remote resource,
    // Need to do an Ajax call to a local program that goes and gets the token.
    logger("Refresh the TaskRouter token using client id: " + clientId);
    $("div.callMessages").html("Refreshing token, please wait.");
    //
    $.get("generateTrToken.php?clientid=" + clientId + "&tokenPassword=" + tokenPassword, function (theToken) {
        if (theToken === "0") {
            $("div.callMessages").html("Invalid password.");
            return;
        }
        // $("div.callMessages").html("TaskRouter token received.");
        worker = new Twilio.TaskRouter.Worker(theToken);
        registerTaskRouterCallbacks();
        $("div.msgClientid").html("TaskRouter Token id: " + clientId);
        trTokenValid = true;
        // logger("Token refreshed.");
        tokenClientId = clientId;
    })
            .fail(function () {
                logger("- Error refreshing the TaskRouter token.");
                return;
            });
}

// -----------------------------------------------------------------
function setTrButtons(workerActivity) {
    logger("setTrButtons, Worker activity: " + workerActivity);
    $("div.callMessages").html("Current TaskRouter status is: " + workerActivity);
    switch (workerActivity) {
        case "none":
            $('#btn-online').prop('disabled', false);
            $('#btn-offline').prop('disabled', false);
            $('#btn-acceptTR').prop('disabled', true);
            $('#btn-rejectTR').prop('disabled', true);
            break;
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
// eof
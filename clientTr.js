// -----------------------------------------------------------------
// TaskRouter JS code
// -----------------------------------------------------------------
//
let worker;
let ReservationObject;
var trTokenValid = false;

// Workspace activity SIDs:
var ActivitySid_Idle = "WA8cdaee07d1554465405fcd1dda2dcf56";
var ActivitySid_Offline = "WA0ab3bfa9b0954df4aeca47cd5051799d";

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
        logger("---------");
        setTrButtons(worker.activityName);
        $('#btn-trtoken').prop('disabled', true);
    });
    worker.on('activity.update', function (worker) {
        logger("Worker activity updated to: " + worker.activityName);
        setTrButtons(worker.activityName);
    });
    // -----------------------------------------------------------------
    worker.on('reservation.created', function (reservation) {
        logger("---------");
        logger("reservation.created: You are reserved to handle a call from: " + reservation.task.attributes.from);
        if (reservation.task.attributes.selected_language) {
            logger("Caller selected language: " + reservation.task.attributes.selected_language);
        }
        logger("Customer request, task.attributes.selected_product: " + reservation.task.attributes.selected_product);
        logger("Reservation SID: " + reservation.sid);
        setTrButtons("Incoming Reservation");
        ReservationObject = reservation;
    });
    worker.on('reservation.accepted', function (reservation) {
        logger("Reservation " + reservation.sid + " accepted.");
        logger("---------");
        ReservationObject = reservation;
        $('#btn-trHangup').prop('disabled', false);
        $('#btn-hangup').prop('disabled', true);
    });
    worker.on('reservation.rejected', function (reservation) {
        logger("Reservation " + reservation.sid + " rejected.");
    });
    worker.on('reservation.timeout', function (reservation) {
        logger("Reservation timed out: " + reservation.sid);
    });
    worker.on('reservation.canceled', function (reservation) {
        logger("Reservation canceled: " + reservation.sid);
    });
    // -----------------------------------------------------------------
}

// -----------------------------------------------------------------
function goAvailable() {
    logger("goAvailable(): update worker's activity to: Idle.");
    worker.update("ActivitySid", ActivitySid_Idle, function (error, worker) {
        if (error) {
            logger("--- goAvailable, Error:");
            logger(error.code);
            logger(error.message);
        }
        ReservationObject.task.complete();
    });
}
function goOffline() {
    logger("goOffline(): update worker's activity to: Offline.");
    worker.update("ActivitySid", ActivitySid_Offline, function (error, worker) {
        if (error) {
            logger("--- goOffline, Error:");
            logger(error.code);
            logger(error.message);
        }
    });
}
function trHangup() {
    logger("trHangup(), set ReservationObject.task.complete().");
    ReservationObject.task.complete();
    worker.update("ActivitySid", ActivitySid_Offline, function (error, worker) {
        logger("Worker ended the call: " + worker.friendlyName);
        hangup();   // Call client hangup to take care of: Twilio.Device.disconnectAll();
        if (error) {
            logger("--- trHangup, Error:");
            logger(error.code);
            logger(error.message);
        } else {
            logger(worker.activityName);
        }
        logger("---------");
    });
    logger("---------");
}
// -----------------------------------------------------------------
function rejectReservation() {
    logger("rejectReservation(): reject the reservation.");
    ReservationObject.reject();
}
function acceptReservation() {
    logger("acceptReservation(): start a conference call, and connect caller and agent.");
    // 
    // Agent Conference call options:
    //     https://www.twilio.com/console/voice/conferences/settings
    var options = {
        "PostWorkActivitySid": ActivitySid_Offline,
        "Timeout": "20",
        "Record": "false"
    };
    logger("Conference call attribute, Record: " + options.Record);
    logger("Conference call attribute, Timeout: " + options.Timeout);
    logger("TaskRouter post activity SID: " + options.PostWorkActivitySid);
    //
    // https://www.twilio.com/docs/taskrouter/api/reservations
    // https://www.twilio.com/docs/taskrouter/js-sdk/worker#reservation-conference
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
    setTrButtons("In a Call");
}

// -----------------------------------------------------------------------------
// Get a TaskRouter Worker token.
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
    $("div.trMessages").html("Refreshing token, please wait.");
    //
    $.get("generateTrToken.php?clientid=" + clientId + "&tokenPassword=" + tokenPassword, function (theToken) {
        if (theToken === "0") {
            $("div.trMessages").html("Invalid password.");
            return;
        }
        // $("div.trMessages").html("TaskRouter token received.");
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
    // logger("setTrButtons, Worker activity: " + workerActivity);
    $("div.trMessages").html("Current TaskRouter status is: " + workerActivity);
    switch (workerActivity) {
        case "Idle":
            $('#btn-online').prop('disabled', true);
            $('#btn-offline').prop('disabled', false);
            $('#btn-acceptTR').prop('disabled', true);
            $('#btn-rejectTR').prop('disabled', true);
            $('#btn-trHangup').prop('disabled', true);
            break;
        case "Offline":
            $('#btn-online').prop('disabled', false);
            $('#btn-offline').prop('disabled', true);
            $('#btn-acceptTR').prop('disabled', true);
            $('#btn-rejectTR').prop('disabled', true);
            $('#btn-trHangup').prop('disabled', true);
            break;
        case "Incoming Reservation":
            $('#btn-online').prop('disabled', true);
            $('#btn-offline').prop('disabled', true);
            $('#btn-acceptTR').prop('disabled', false);
            $('#btn-rejectTR').prop('disabled', false);
            $('#btn-trHangup').prop('disabled', true);
            break;
        case "In a Call":
            $('#btn-online').prop('disabled', true);
            $('#btn-offline').prop('disabled', true);
            $('#btn-acceptTR').prop('disabled', true);
            $('#btn-rejectTR').prop('disabled', true);
            $('#btn-trHangup').prop('disabled', false);
            break;
    }
}

// -----------------------------------------------------------------
// eof
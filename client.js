// -----------------------------------------------------------------------------
// To do:
// Docs: https://www.twilio.com/docs/voice/client/javascript/connection
// 
// .mute(bool)  ...  .isMuted()
// 
// Call time out when receiving a call.

var tokenValid = false;
var tokenClientId = "";
var clientId = tokenClientId;
var theConnection = "";
var theCaller = "";
var theCallTo = "";
var theCallSid = "";
var theCallSidUrl = "";
var theConference = "";
var theCallType = "";

// -----------------------------------------------------------------------------
// Using the Client SDK calls and objects.

Twilio.Device.ready(function (device) {
    // Docs: https://www.twilio.com/docs/voice/client/javascript/device
    $("div.msgTokenPassword").html("Token refreshed");
    $("div.callMessages").html("Ready to make and receive calls.");
    logger("Ready to make and receive calls.");
    $('#btn-call').prop('disabled', false);
    $('#btn-refresh').prop('disabled', true);
});
Twilio.Device.connect(function (conn) {
    logger("Call connected.");
    // https://www.twilio.com/docs/api/client/connection#outgoing-parameters
    theConnection = conn;
    theCallSid = conn.parameters.CallSid;
    logger("+ CallSid: " + theCallSid);
    // ---------------------
    theCallSidUrl = '<a target="console"'
            + 'href="https://www.twilio.com/console/voice/calls/logs/'
            + theCallSid + '" style="color:#954C08">See log.</a>';
    $("div.msgCallTo").html("Call connected. " + theCallSidUrl);
    theCallerMsg = theCallTo;
    if (theCaller !== "") {
        theCallerMsg = "Calling: " + theCaller + ". ";
    }
    $("div.callMessages").html("Call connected with: " + theCallerMsg);
    $('#btn-call').prop('disabled', true);
    $('#btn-hangup').prop('disabled', false);
    logger("+ theCallType: " + theCallType);
    if (theCallType === "conference") {
        $('#btn-endconf').prop('disabled', false);
    }
});
Twilio.Device.disconnect(function (conn) {
    logger("Call ended.");
    $("div.msgCallTo").html("Call ended. " + theCallSidUrl);
    theCallerMsg = "Call ended: " + theCallTo + ". ";
    if (theCaller !== "") {
        theCallerMsg = "Call ended: " + theCaller + ". ";
    }
    $("div.callMessages").html(theCallerMsg + "Ready to make and receive calls.");
    $('#btn-call').prop('disabled', false);
    $('#btn-hangup').prop('disabled', true);
    $('#btn-endconf').prop('disabled', true);
    $('#btn-accept').prop('disabled', true);
    $('#btn-reject').prop('disabled', true);
});
Twilio.Device.cancel(function () {
    logger("++ Twilio.Device.cancel");
});
Twilio.Device.offline(function () {
    logger("++ Twilio.Device.offline");
});
Twilio.Device.error(function (error) {
    logger("Error: " + error.message + ".");
    if (error.message.indexOf("token parsing failed") > 0) {
        //  Error: "JWT token parsing failed"
        $("div.msgTokenPassword").html("<b>Invalid password</b>");
        $('#btn-call').prop('disabled', true);
        tokenValid = false;
        return;
    }
    if (error.message.indexOf("Token Expired") > 0) {
        //  Error: "JWT Token Expired."
        $("div.msgTokenPassword").html("Token Expired");
        $("div.msgClientid").html("");
        $('#btn-refresh').prop('disabled', false);
        $('#btn-call').prop('disabled', true);
        $('#btn-hangup').prop('disabled', true);
        $('#btn-endconf').prop('disabled', true);
        tokenValid = false;
        return;
    }
});
Twilio.Device.incoming(function (conn) {
    theCaller = conn.parameters.From;
    $("div.callMessages").html("Incomming call from: " + theCaller);
    logger("+ Incoming call, CallSid: " + conn.parameters.CallSid);
    logger("+ From:   " + theCaller);
    logger("+ To:     " + conn.parameters.To);
    logger("+ Region: " + Twilio.Device.region());
    // --------------------
    // Accept the incoming connection and start two-way audio
    // https://www.twilio.com/docs/api/client/connection#incoming-parameters
    theConnection = conn;
    // conn.accept();
    // Or conn.reject();
    $('#btn-accept').prop('disabled', false);
    $('#btn-reject').prop('disabled', false);
    /* Not used. It runs after: reject().
     theConnection.on('reject', function () {
     logger("theConnection.on('reject'");
     }); */
});
function accept() {
    logger("Accepted call.");
    theConnection.accept();
    $("div.callMessages").html("Accepted: incomming call from: " + theCaller);
    $("div.msgTokenPassword").html("");
    $('#btn-call').prop('disabled', true);
    $('#btn-hangup').prop('disabled', false);
    $('#btn-endconf').prop('disabled', true);
    $('#btn-accept').prop('disabled', true);
    $('#btn-reject').prop('disabled', true);
}
function reject() {
    logger("Rejected call.");
    theConnection.reject();
    $("div.callMessages").html("Rejected: incomming call from: " + theCaller);
    $("div.msgTokenPassword").html("");
    $('#btn-accept').prop('disabled', true);
    $('#btn-reject').prop('disabled', true);
}
function reset() {
    logger("Reset device.");
    Twilio.Device.destroy();
}

function call() {
    // clearMessages();
    $("div.msgCallTo").html("");
    callToValue = $("#callTo").val();
    if (callToValue === "") {
        $("div.msgCallTo").html("<b>Required</b>");
        logger("- Required: Call to.");
        return;
    }
    if (tokenClientId === "") {
        $("div.msgTokenPassword").html("<b>Refresh the token</b>");
        logger("- Required: Refresh the token before making the call.");
        return;
    }
    theCallType = $('#callType :selected').val();
    theCallTo = callToValue;
    if (theCallType !== "pstn") {
        theCallTo = theCallType + ":" + callToValue
    }
    theCaller = "";
    logger("++ Make an outgoing call from: " + clientId + ", To: " + theCallTo + ", Call Type: " + theCallType);
    params = {"To": theCallTo, "From": "client:" + clientId};
    $("div.callMessages").html("Calling: " + theCallTo);
    Twilio.Device.connect(params);
    if (theCallType === "conference") {
        theConference = callToValue;
        logger("+ theConference: " + theConference);
    }
}
function hangup() {
    logger("Hangup.");
    $('#btn-call').prop('disabled', false);
    $('#btn-hangup').prop('disabled', true);
    $('#btn-endconf').prop('disabled', true);
    Twilio.Device.disconnectAll();
}
function endConference() {
    $("div.callMessages").html("Please wait, ending conference.");
    logger("End Conference.");
    $.get("conferenceEndFn.php?name=" + theConference, function (theResponse) {
        logger("Response: " + theResponse);
        theConference = "";
        $('#btn-call').prop('disabled', false);
        $('#btn-hangup').prop('disabled', true);
        $('#btn-endconf').prop('disabled', true);
    }).fail(function () {
        logger("- Error ending conference.");
        return;
    });
    // If not using call transfer/escalations, totally shutdown the conference call:
    // $.post("/hangup", {
    //    participant: ReservationObject.task.attributes.conference.participants.customer,
    //    conference: ReservationObject.task.attributes.conference.sid
    //});
    // /hangup :
    //    participant = client.conferences(request.values.get('conference')).update(status="completed")
    //    resp = VoiceResponse
    //    return Response(str(resp), mimetype='text/xml')
}

function sendDigits(aDigit) {
    // logger("sendDigits: " + aDigit);
    theConnection.sendDigits(aDigit);
}

// Play a song for amusement.
function playDigit(aDigit) {
    logger("playDigit: " + aDigit);
    theConnection.sendDigits(aDigit);
}
// from: http://www.dumb.com/touchtones/
// var theSong=" 9#963692363699#963692931"; // London Bridge
var theSong = " 1199##96633221996633299663321199##96633221"; // Twinkle, Twinkle, Little Star
var theDigit = 0;
function playSong() {
    theDigit++;
    if (theDigit >= theSong.length) {
        theDigit = 0;
        return;
    }
    playDigit(theSong.substring(theDigit, theDigit + 1));
    setTimeout('playSong()', 500);
}
// function donothing() {}

// -----------------------------------------------------------------------------
// .status() : Return the status of this connection. 
// 
// theConnection.on('reject', handler)
// theConnection.on('disconnect', handler)
// theConnection.on('accept', handler)
// Example:
// yes: Twilio.Device.error(function (error) {
// not: Twilio.Device.on('error', function(error) {

// -----------------------------------------------------------------------------
// Getting the access token.

function refresh() {
    if (tokenValid) {
        $("div.msgTokenPassword").html("Token already valid.");
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
    logger("Refresh the token using client id: " + clientId);
    $("div.callMessages").html("Refreshing token, please wait.");
    //
    $.get("clientTokenGet.php?clientid=" + clientId + "&tokenPassword=" + tokenPassword, function (theToken) {
        // alert("theToken :" + theToken.trim() + ":");
        // Twilio.Device documentation: https://www.twilio.com/docs/api/client/device-13
        // Optional, control sounds:
        //   Twilio.Device.setup(theToken.trim(), { sounds: {
        //      incoming: 'http://tigerfarmpress.com/tech/docs/sound/HAL.mp3',
        //      outgoing: 'http://tigerfarmpress.com/tech/docs/sound/st-affirmative.mp3'}});
        //      // https://www.twilio.com/docs/api/client/regions
        // Twilio.Device.setup(theToken.trim(), { region: "ie1" }); // gll - Global Low Lantecy
        Twilio.Device.setup(theToken.trim(), {region: "gll", debug: true});
        $("div.msgClientid").html("Token id: " + clientId);
        $("div.callMessages").html("");
        tokenValid = true;
        // logger("Token refreshed.");
        tokenClientId = clientId;
    })
            // .done(function () {alert("second success");})
            .fail(function () {
                logger("- Error refreshing the token.");
                quit;
            });
    // .always(function () {alert("finished");});
}

// -----------------------------------------------------------------------------
// UI functions

function clearMessages() {
    $("div.msgClientid").html("Token id: <b>" + clientId + "</b>");
    $("div.msgCallTo").html("");
    $("div.msgTokenPassword").html("");
}
function setClientId() {
    clientId = $("#clientid").val();
    if (clientId === "") {
        // logger("Use default token client id.");
        clientId = tokenClientId;
    }
}
function refreshClientId() {
    // logger("++ Refresh the Client Id (to-caller).");
    clientId = $("#clientid").val();
    if (clientId === "") {
        // logger("Use default token client id.");
        clientId = tokenClientId;
    }
    ;
    refresh();
}
function logger(message) {
    var log = document.getElementById('log');
    log.value += "\n> " + message;
    log.scrollTop = log.scrollHeight;
}
function clearLog() {
    log.value = "+ Ready";
}
window.onload = function () {
    //
    $('#btn-call').prop('disabled', true);
    $('#btn-hangup').prop('disabled', true);
    $('#btn-endconf').prop('disabled', true);
    $('#btn-accept').prop('disabled', true);
    $('#btn-reject').prop('disabled', true);
    //
    $('#btn-online').prop('disabled', true);
    $('#btn-offline').prop('disabled', true);
    $('#btn-acceptTR').prop('disabled', true);
    $('#btn-rejectTR').prop('disabled', true);
    //
    var log = document.getElementById('log');
    log.value = "+++ Start.";
    theCallType = "";
    // setClientId();
};

// -----------------------------------------------------------------------------

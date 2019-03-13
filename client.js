// -----------------------------------------------------------------------------
// To do:
// Docs: https://www.twilio.com/docs/voice/client/javascript/connection
// Twilio.Device documentation: https://www.twilio.com/docs/voice/client/javascript/device
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
var theCallToCallSid = "";

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
        $('#btn-onholdCallers').prop('disabled', false);
        $('#btn-addtoconf').prop('disabled', false);
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
    setButtons("Device.disconnect");
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
        $("div.msgTokenPassword").html("Voice Token Expired");
        $("div.callMessages").html("Token Expired");
        $("div.msgClientid").html("");
        setButtons("Token Expired");
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
    $('#btn-accept').prop('disabled', false);
    $('#btn-reject').prop('disabled', false);
});
function accept() {
    logger("Accepted call.");
    theConnection.accept();
    $("div.callMessages").html("Accepted: incomming call from: " + theCaller);
    $("div.msgTokenPassword").html("");
    setButtons("accept()");
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
    callFromNumber = $('#accountNumbers :selected').text();
    if (callFromNumber === "") {
        $("div#msgMsgFrom").html("<b>Required</b>");
        logger("Required: Twilio number to use as a caller id.");
        return;
    }
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
    //
    // Parameters that are passed to the Twilio Function: Make a phone call.
    params = {"To": theCallTo, "From": "client:" + clientId, "FromNumber": callFromNumber};
    //
    $("div.callMessages").html("Calling: " + theCallTo);
    Twilio.Device.connect(params);
    if (theCallType === "conference") {
        theConference = callToValue;
        logger("+ theConference: " + theConference);
    }
}
function hangup() {
    logger("Hangup.");
    setButtons("hangup()");
    Twilio.Device.disconnectAll();
}
// -----------------------------------------------------------------------------
function endConference() {
    $("div.callMessages").html("Please wait, ending conference.");
    logger("End the conference: " + theConference);
    setButtons("endConference()");
    $.get("conferenceEndFn.php?conferenceName=" + theConference, function (theResponse) {
        logger("Response: " + theResponse);
        theConference = "";
    }).fail(function () {
        logger("- Error ending conference.");
        return;
    });
}
function onholdCallers() {
    $("div.callMessages").html("Putting other callers on hold.");
    logger("Put others onhold, conference: " + theConference + ", call SID: " + theCallSid);
    $.get("participantsHoldOn.php?conferenceId=" + theConference + "&callSid=" + theCallSid, function (theResponse) {
        logger("Response: " + theResponse);
        $('#btn-onholdCallers').prop('disabled', true);
        $('#btn-offholdCallers').prop('disabled', false);
    }).fail(function () {
        logger("- Error onholdCallers.");
        return;
    });
}
function offholdCallers() {
    $("div.callMessages").html("Take other callers off hold.");
    logger("Take others offhold, conference: " + theConference + ", call SID: " + theCallSid);
    $.get("participantsHoldOff.php?conferenceId=" + theConference + "&callSid=" + theCallSid, function (theResponse) {
        logger("Response: " + theResponse);
        $('#btn-onholdCallers').prop('disabled', false);
        $('#btn-offholdCallers').prop('disabled', true);
    }).fail(function () {
        logger("- Error offholdCallers.");
        return;
    });
}
function addToConference() {
    callFromNumber = $('#accountNumbers :selected').text();
    if (callFromNumber === "") {
        $("div#msgMsgFrom").html("<b>Required</b>");
        logger("Required: Twilio number to use as a caller id.");
        return;
    }
    $("div.msgCallTo").html("");
    callToValue = $("#callTo").val();
    if (callToValue === "") {
        $("div.msgCallTo").html("<b>Required</b>");
        logger("- Required: Call to.");
        return;
    }
    $("div.callMessages").html("Add call-to to the conference.");
    logger("Add call-to, " + callToValue + " conference: " + theConference);
    $.get("conferenceJoin.php?callFrom=" + callFromNumber + "&callTo=" + callToValue + "&conferenceName=" + theConference, function (theResponse) {
        theCallToCallSid = theResponse;
        logger("Response, theToCaller: " + theCallToCallSid);
        $('#btn-rmtoconf').prop('disabled', false);
    }).fail(function () {
        logger("- Error addToConference.");
        return;
    });
}
function rmFromConference() {
    $("div.callMessages").html("Remove to call-to from the conference.");
    logger("Remove call-to, conference: " + theConference + " Call SID: " + theCallToCallSid);
    $.get("participantRemove.php?conferenceId=" + theConference + "&callSid=" + theCallToCallSid, function (theResponse) {
        logger("Response: " + theResponse);
        $('#btn-rmtoconf').prop('disabled', true);
    }).fail(function () {
        logger("- Error rmFromConference.");
        return;
    });
}

// -----------------------------------------------------------------------------
// Play a song for amusement.
// Songs from: http://www.dumb.com/touchtones/
// var theSongName="London Bridge";
// var theSong=" 9#963692363699#963692931"; // London Bridge
var theSongName = "Twinkle, Twinkle, Little Star";
var theSong = " 1199##96633221996633299663321199##96633221"; // Twinkle, Twinkle, Little Star
var theDigit = 0;
function doPlaySong() {
    logger("Play: " + theSongName);
    playSong();
}
function playSong() {
    theDigit++;
    if (theDigit >= theSong.length) {
        theDigit = 0;
        return;
    }
    playDigit(theSong.substring(theDigit, theDigit + 1));
    setTimeout('playSong()', 500);
}
function playDigit(aDigit) {
    logger("playDigit: " + aDigit);
    theConnection.sendDigits(aDigit);
}
function sendDigits(aDigit) {
    // logger("sendDigits: " + aDigit);
    theConnection.sendDigits(aDigit);
}
// function donothing() {}

// -----------------------------------------------------------------------------
function setAccNumbers() {
    logger("+ setAccNumbers");
    // $('#accountNumbers option:selected').val("+16505551111");
    var options = $("#accountNumbers");
    // $.each(data, function() {
    //   options.append(new Option(this.text, this.value));
    // });
    $("div#callMessages").html("+ Please wait, loading phone numbers...");
    $.get("accountNumberList.php", function (response) {
        logger("+ response :" + response + ":");
        if (response.indexOf("Credentials are required") > 0) {
            $("div#msgMsgFrom").html("Check environment credentials");
            $("div#callMessages").html("<b>- Error: environment credentials are required.</b>");
            options.append($("<option />").val("").text("Eror loading"));
            return;
        }
        if (response === "0") {
            $("div#msgMsgFrom").html("<b>No account phone numbers.</b>");
            $("div#callMessages").html("<b>- You are required to have at least one account phone numbers.</b>");
        }
        arrayNumbers = response.split(":");
        // options.append($("<option />").val(aNumbers[0]).text(aNumbers[0]));
        arrayNumbers.forEach(function (aNumbers) {
            options.append($("<option />").val(aNumbers).text(aNumbers));
        });
        $('#accountNumbers option')[0].selected = true; // by default, select the first option.
        $("div#callMessages").html("+ Account phone numbers loaded.");
    }).fail(function () {
        logger("- Get account phone numbers failed.");
    });
}

function accNumbers() {
    clearMessages();
    logger("Get account phone numbers.");
    $("div#callMessages").html("<b>Wait, getting account phone numbers...</b>");
    $.get("accountPhoneNumbers.php", function (response) {
        logger(response);
        $("div#callMessages").html("+ Displayed account phone numbers.");
    }).fail(function () {
        logger("- Get account phone numbers failed.");
    });
}

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
        logger("Token refreshed :" + theToken.trim() + ":");
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
    setButtons("init");
    var log = document.getElementById('log');
    log.value = "+++ Start.";
    theCallType = "";
    setAccNumbers();
    // setClientId();
};

// -----------------------------------------------------------------
function setButtons(activity) {
    logger("setButtons, activity: " + activity);
    // $("div.callMessages").html("Activity: " + activity);
    switch (activity) {
        case "init":
            $('#btn-call').prop('disabled', true);
            $('#btn-hangup').prop('disabled', true);
            $('#btn-endconf').prop('disabled', true);
            $('#btn-accept').prop('disabled', true);
            $('#btn-reject').prop('disabled', true);
            //
            $('#btn-onholdCallers').prop('disabled', true);
            $('#btn-offholdCallers').prop('disabled', true);
            //
            $('#btn-online').prop('disabled', true);
            $('#btn-offline').prop('disabled', true);
            $('#btn-acceptTR').prop('disabled', true);
            $('#btn-rejectTR').prop('disabled', true);
            break;
        case "Device.disconnect":
            $('#btn-call').prop('disabled', false);
            $('#btn-hangup').prop('disabled', true);
            $('#btn-endconf').prop('disabled', true);
            $('#btn-accept').prop('disabled', true);
            $('#btn-reject').prop('disabled', true);
            $('#btn-onholdCallers').prop('disabled', true);
            $('#btn-offholdCallers').prop('disabled', true);
            $('#btn-addtoconf').prop('disabled', true);
            $('#btn-rmtoconf').prop('disabled', true);
            break;
        case "hangup()":
            $('#btn-call').prop('disabled', false);
            $('#btn-hangup').prop('disabled', true);
            $('#btn-endconf').prop('disabled', true);
            $('#btn-onholdCallers').prop('disabled', true);
            $('#btn-offholdCallers').prop('disabled', true);
            $('#btn-addtoconf').prop('disabled', true);
            $('#btn-rmtoconf').prop('disabled', true);
            break;
        case "endConference()":
            $('#btn-endconf').prop('disabled', true);
            break;
        case "accept()":
            $('#btn-call').prop('disabled', true);
            $('#btn-hangup').prop('disabled', false);
            $('#btn-endconf').prop('disabled', true);
            $('#btn-accept').prop('disabled', true);
            $('#btn-reject').prop('disabled', true);
            break;
        case "Token Expired":
            $('#btn-refresh').prop('disabled', false);
            $('#btn-call').prop('disabled', true);
            $('#btn-hangup').prop('disabled', true);
            $('#btn-endconf').prop('disabled', true);
            break;
    }
}

// -----------------------------------------------------------------------------

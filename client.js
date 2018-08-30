// -----------------------------------------------------------------------------
var tokenClientId = "";
var clientId = tokenClientId;
var theConnection = "";

Twilio.Device.ready(function (device) {
    logger("Token refreshed.");
    logger("Ready to make and receive calls.");
    $('#btn-call').prop('disabled', false);
});
Twilio.Device.connect(function (conn) {
    logger("Call connected.");
    // https://www.twilio.com/docs/api/client/connection#outgoing-parameters
    logger("+ CallSid: " + conn.parameters.CallSid);
    // add: "See log."
    // https://www.twilio.com/console/voice/calls/logs/CA60f7eb18499913a90e6c689ccd822953
    // https://www.twilio.com/console/voice/calls/logs/CA4e5ed40ee48dd922e35e79d43dd78db3
    theUrl = '<a target="console" href="https://www.twilio.com/console/voice/calls/logs/' + conn.parameters.CallSid + '" style="color:#954C08">See log.</a>';
    $("div.msgNumber").html("Call connected. " + theUrl);
    theConnection = conn;
    $('#btn-hangup').prop('disabled', false);
});
Twilio.Device.disconnect(function (conn) {
    logger("Call ended.");
    $("div.msgNumber").html("Call ended");
    $('#btn-hangup').prop('disabled', true);
});
Twilio.Device.error(function (error) {
    logger("Error: " + error.message + ".");
    if ( error.message.indexOf("token parsing failed") > 0) {
        //  "JWT token parsing failed"
        $("div.msgTokenPassword").html("<b>Invalid password</b>");
        return;
    }
});
Twilio.Device.incoming(function (conn) {
    // Accept the incoming connection and start two-way audio
    // https://www.twilio.com/docs/api/client/connection#incoming-parameters
    logger("+ Incoming call, CallSid: " + conn.parameters.CallSid);
    logger("+ To:     " + conn.parameters.To);
    logger("+ From:   " + conn.parameters.From);
    logger("+ Region: " + Twilio.Device.region());
    conn.accept();
    // Or conn.reject();
});
function call() {
    clearMessages();
    theNumber = $("#number").val();
    if (theNumber === "") {
        $("div.msgNumber").html("<b>Required</b>");
        logger("- Required: Call to.");
        return;
    }
    if (tokenClientId === "") {
        $("div.msgTokenPassword").html("<b>Refresh the token</b>");
        logger("- Required: Refresh the token before making the call.");
        return;
    }
    logger("++ Make an outgoing call from: " + clientId + " To: " + theNumber);
    params = {"To": theNumber, "From": "client:" + clientId};
    Twilio.Device.connect(params);
}
function hangup() {
    logger("Hangup.");
    Twilio.Device.disconnectAll();
}

function refresh() {
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
        $("div.msgClientid").html("Current id: <b>" + clientId + "</b>");
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

function sendDigits(aDigit) {
    // logger("sendDigits: " + aDigit);
    theConnection.sendDigits(aDigit);
}
function playDigit(aDigit) {
    logger("playDigit: " + aDigit);
    theConnection.sendDigits(aDigit);
}
// from: http://www.dumb.com/touchtones/
// var theSong=" 9#963692363699#963692931"; // London Bridge
var theSong=" 1199##96633221996633299663321199##96633221"; // Twinkle, Twinkle, Little Star
var theDigit = 0;
function playSong() {
    theDigit++;
    if (theDigit >= theSong.length) {
        theDigit = 0;
        return;
    }
    playDigit(theSong.substring(theDigit,theDigit+1));
    setTimeout('playSong()', 500);
}
function donothing() {}

// -----------------------------------------------------------------------------
function clearMessages() {
    $("div.msgClientid").html("Current id: <b>" + clientId + "</b>");
    $("div.msgNumber").html("");
    $("div.msgTokenPassword").html("");
}
function setNumberc() {
    document.getElementById('number').value = "conference:support";
}
function setClient() {
    document.getElementById('number').value = "client:";
}
function setSip() {
    document.getElementById('number').value = "sip:";
}
function setNumbereq() {
    document.getElementById('number').value = "enqueue:support";
}
function setNumberq() {
    document.getElementById('number').value = "queue:support";
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
    setClientId();
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
    $('#btn-call').prop('disabled', true);
    $('#btn-hangup').prop('disabled', true);
    var log = document.getElementById('log');
    log.value = "+++ Start.";
    // log.style.height = '90px';
    setClientId();
};

// -----------------------------------------------------------------------------

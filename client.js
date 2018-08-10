// -----------------------------------------------------------------------------
$.fn.numpad.defaults.onKeypadCreate = function () {
    $(this).enhanceWithin();
};
$(document).on('pageshow', function () {
    $('#numpadButton-btn').numpad({
        positionX: 'center',
        positionY: 'top',
        textDone: 'Done'
    });
}
);
$.mobile.loading().hide();  // Removes the "Loading" message.

// -----------------------------------------------------------------------------
var tokenClientId = "owluser";
var clientId = tokenClientId;
var theConnection;

Twilio.Device.ready(function (device) {
    logger("Ready.");
});
Twilio.Device.connect(function (conn) {
    logger("Call connected.");
    // https://www.twilio.com/docs/api/client/connection#outgoing-parameters
    logger("+ CallSid: " + conn.parameters.CallSid);
    theConnection = conn;
});
Twilio.Device.disconnect(function (conn) {
    logger("Call ended.");
});
Twilio.Device.error(function (error) {
    logger("Error: " + error.message);
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
    logger("++ Make an outgoing call.");
    setClientId();
    if (clientId !== tokenClientId) {
        refresh();
    }
    logger("+ From: " + clientId);
    logger("+ To:   " + $("#number").val());
    params = {"To": $("#number").val(), "From": "client:" + clientId};
    Twilio.Device.connect(params);
}
function hangup() {
    logger("Hangup.");
    Twilio.Device.disconnectAll();
}

function refresh() {
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
    var jqxhr = $.get("clientTokenGet.php?clientid=" + clientId + "&tokenPassword=" + tokenPassword, function (theToken) {
        // alert("theToken :" + theToken.trim() + ":");
        // Twilio.Device documentation: https://www.twilio.com/docs/api/client/device-13
        // Optional, control sounds:
        //   Twilio.Device.setup(theToken.trim(), { sounds: {
        //      incoming: 'http://tigerfarmpress.com/tech/docs/sound/HAL.mp3',
        //      outgoing: 'http://tigerfarmpress.com/tech/docs/sound/st-affirmative.mp3'}});
        //      // https://www.twilio.com/docs/api/client/regions
        // Twilio.Device.setup(theToken.trim(), { region: "ie1" });
        Twilio.Device.setup(theToken.trim(), {debug: true});
        $("div.msgClientid").html("Current client id: <b>" + clientId + "</b>");
        logger("Token refreshed.");
        tokenClientId = clientId;
    })
            // .done(function () {alert("second success");})
            .fail(function () {
                logger("- Error refreshing the token.");
                quit;
            });
    // .always(function () {alert("finished");});
}

function setNumberc() {
    // alert("set");
    document.getElementById('number').value = "conference:support";
}
function setClient() {
    // alert("set");
    document.getElementById('number').value = "client:";
}
function setSip() {
    // alert("set");
    document.getElementById('number').value = "sip:";
}
function setNumbereq() {
    // alert("set");
    document.getElementById('number').value = "enqueue:support";
}
function setNumberq() {
    // alert("set");
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
    log.value = "+++ Start.";
    setClientId();
    refresh();
};

function sendDigits(theDigit) {
    // logger("sendDigits.");
    theConnection.sendDigits(theDigit);
}

// -----------------------------------------------------------------------------

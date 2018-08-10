exports.handler = function(context, event, callback) {
    let clientid = event.clientid || null;
    if (clientid === null) {
        clientid = context.CLIENT_ID || null;
        if (clientid === null) {
           console.log("-- In Functions Configure, add: CLIENT_ID.");
           return;
      }
    }
    console.log("+ Client ID: " + clientid);
    //
    const ClientCapability = require('twilio').jwt.ClientCapability;
    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const capability = new ClientCapability({
        accountSid: context.ACCOUNT_SID,
        authToken: context.AUTH_TOKEN
    });
    capability.addScope(new ClientCapability.IncomingClientScope(clientid));
    capability.addScope(new ClientCapability.OutgoingClientScope({
        applicationSid: context.VOICE_TWIML_APP_SID_CALL_CLIENT,
        clientName: clientid
    }));
    let token = capability.toJwt();
    console.log(":" + token + ":");
    callback(null, token);
};

exports.handler = function (context, event, callback) {
    console.log("---------------------------------------------------------");
    let twiml = new Twilio.twiml.VoiceResponse();
    //
    let callerId = event.From || null;
    if (callerId === null) {
	callerId = context.CLIENT_ID || null;
    	if (callerId !== null) {
  		callerId = "client:" + callerId;
    	} else {
    	    	twiml.say({voice: 'alice', language: 'en-CA'}, 'Error placing the call. The From-caller is required.');
        	callback(null, twiml);
        	return;
	}
    }
    let callTo = event.To || null;
    if (callTo === null) {
        twiml.say({voice: 'alice', language: 'en-CA'}, 'Error placing the call. The To-caller is required.');
        callback(null, twiml);
        return;
    }
    console.log("+ Call From: " + callerId);
    console.log("+ Call To: " + callTo);
    //
    let clientPhoneNumber = context.CLIENT_PHONE_NUMBER || null;
    if (callTo.startsWith("client:")) {
      	// Leave as is because this is a Client to Client call.
    } else if (clientPhoneNumber !== null) {
	// If not making a Client to Client call, callerid is a phone number.
      	callerId = clientPhoneNumber;
    } else {
  	console.log("-- In Functions Configure, add: CLIENT_PHONE_NUMBER");
        twiml.say({voice: 'alice', language: 'en-CA', }, 'Error placing the call.');
        twiml.say({voice: 'alice', language: 'en-CA', }, 'Client phone number not configured.');
        callback(null, twiml);
        return;
    }
    console.log("+ Caller id: " + callerId);
    //
    let dialParams = {};
    dialParams.callerId = callerId
    dialParams.record = "do-not-record"
    if (callTo.startsWith("sip:")) {
        console.log("+ Make a SIP call.");
        twiml.dial(dialParams).sip(callTo);
    } else if (callTo.startsWith("client:")) {
        console.log("+ Make a Client call.");
        twiml.dial(dialParams).client(callTo.substr(7));
    } else if (callTo.startsWith("conference:")) {
        console.log("+ Make a Conference call.");
        twiml.dial(dialParams).conference(callTo.substr(11));
    } else if (callTo.startsWith("queue:")) {
      	//                        123456
        console.log("+ Make a queue call.");
        twiml.dial(dialParams).queue(callTo.substr(6));
    } else if (callTo.startsWith("enqueue:")) {
      	//                        12345678
        console.log("+ Enqueue the caller.");
        twiml.enqueue(callTo.substr(8));
    } else {
        console.log("+ Make a PSTN call.");
        twiml.dial(dialParams, callTo);
    }
    callback(null, twiml);
};

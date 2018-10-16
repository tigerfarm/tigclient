<?php

if ($argc > 1) {
    $conferenceSid = $argv[1];
} else {
    $conferenceSid = $_REQUEST['conferenceSid'];
}
if ($conferenceSid === null) {
    echo "0";
    return;
}
if ($argc > 2) {
    $CallSid = $argv[2];
} else {
    $CallSid = $_REQUEST['CallSid'];
}
if ($CallSid === null) {
    echo "0";
    return;
}
echo "+++ Take other conference participants off hold, conference SID: " . $conferenceSid . ", and CallSid: " . $CallSid . "\xA";
require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
use Twilio\Rest\Client;
$twilio = new Client(getenv('ACCOUNT_SID'), getenv('AUTH_TOKEN'));
$participants = $twilio->conferences($conferenceSid)->participants->read();
foreach ($participants as $record) {
    $participant = $twilio->conferences($conferenceSid)
            ->participants($record->callSid)
            ->fetch();
    $participantSid = $record->callSid;
    print('+ Participant SID: ' . $participantSid . "\xA");
    if ($participantSid !== $CallSid) {
        $participant->update(array(
                "hold" => False
            )
        );
        print('+ Take off hold, Participant SID: ' . $participant->callSid . "\xA");
    }
}

echo "+++ Exit.\xA";
?>

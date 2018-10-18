<?php
// https://www.twilio.com/docs/voice/api/conference-participant
if ($argc > 1) {
    $conferenceSid = $argv[1];
} else {
    $conferenceSid = $_REQUEST['conferenceId'];
}
if ($conferenceSid === null) {
    echo "0";
    return;
}
if ($argc > 2) {
    $CallSid = $argv[2];
} else {
    $CallSid = $_REQUEST['callSid'];
}
if ($CallSid === null) {
    echo "0";
    return;
}
echo "+++ Remove participant from the conference: " . $conferenceSid . ", and CallSid: " . $CallSid . "\xA";
require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
use Twilio\Rest\Client;
$twilio = new Client(getenv('ACCOUNT_SID'), getenv('AUTH_TOKEN'));
if (strncmp($conferenceSid, "CF", 2) !== 0) {
    // Given the Conference name, get the conference id.
    $conferences = $twilio->conferences->read(
        array(
            "Status" => "in-progress",
            "FriendlyName" => $FriendlyName
        ));
    print("+ Conference Name/SID: " . $conferences[0]->friendlyName . "/" . $conferences[0]->sid . "\n");
    $conferenceSid = $conferences[0]->sid;
}
$twilio->conferences($conferenceSid)
       ->participants($CallSid)
       ->delete();
print('+ Removed Participant SID: ' . $CallSid . "\xA");

echo "+++ Exit.\xA";
?>

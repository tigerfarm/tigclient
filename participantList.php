<?php
if ($argc > 1) {
    $conferenceSid = $argv[1];
} else {
    $conferenceSid = $_REQUEST['conferenceSid'];
}
echo "+++ List Conference participants on conference SID: " . $conferenceSid . "\xA";
require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
use Twilio\Rest\Client;
$twilio = new Client(getenv('ACCOUNT_SID'), getenv('AUTH_TOKEN'));
$participants = $twilio->conferences($conferenceSid)->participants->read();
foreach ($participants as $record) {
    $participant = $twilio->conferences($conferenceSid)
            ->participants($record->callSid)
            ->fetch();
    $participantOnHold = "Not";
    if ($participant->hold) {
        $participantOnHold = "OnHold";
    }
    $participantMuted = "Not";
    if ($participant->muted) {
        $participantMuted = "Muted";
    }
    print('+ Participant SID: ' . $record->callSid . " hold:" . $participantOnHold . " muted:" . $participantMuted . "\xA");
}
echo "+++ Exit.\xA";
?>

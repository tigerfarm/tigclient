<?php
if ($argc > 1) {
    $callFrom = $argv[1];
} else {
    $callFrom = $_REQUEST['callFrom'];
}
if ($callFrom === null) {
    echo "0";
    return;
}
if ($argc > 2) {
    $callTo = $argv[2];
} else {
    $callTo = $_REQUEST['callTo'];
}
if ($callTo === null) {
    echo "0";
    return;
}
if ($argc > 3) {
    $conferenceName = $argv[3];
} else {
    $conferenceName = $_REQUEST['conferenceName'];
}
if ($conferenceName === null) {
    echo "0";
    return;
}
require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
use Twilio\Rest\Client;
// print('++ Call a number to join the conference call: ' . $callTo);
$twilio = new Client(getenv("ACCOUNT_SID"), getenv('AUTH_TOKEN'));
$theConnection = $twilio->calls->create(
    $callTo, $callFrom, array(
        'Url' => "https://handler.twilio.com/twiml/EH45f92ef40a7ecb36dc2873106e6933fb?conferenceid=" . $conferenceName
    )
);
print($theConnection->sid);
?>                    

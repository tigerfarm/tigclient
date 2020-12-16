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
echo "+ callFrom: ". $callFrom . " callTo: ". $callTo;
$theConnection = $twilio->calls->create(
        $callTo, $callFrom, array(
    'Url' => "https://handler.twilio.com/twiml/EH86680f86f5009c205c906f535ee9945d?conferenceid=" . $conferenceName
    // 'Url' => "https://handler.twilio.com/twiml/EH54bd427eb666fff87527d4b373f8a5d1?conferenceid=" . $conferenceName
    // , "StatusCallback" => "https://tigerfarmpress.com/cgi/echo.php",
    // "StatusCallbackMethod" => "POST",
    // "StatusCallbackEvent" => array("initiated", "ringing", "answered", "completed")
        )
);
print($theConnection->sid);
?>                    

<?php
if ($argc === 1 ) {
    echo "0";
    return;
}
$theConferenceName = $argv[1];

require __DIR__ . '/twilio-php-master/Twilio/autoload.php';

use Twilio\Rest\Client;

$twilio = new Client(getenv("ACCOUNT_SID"), getenv('AUTH_TOKEN'));
echo "++ End Conference: " . $theConferenceName . "\xA";
$conferences = $twilio->conferences->read(
    array(
        "friendlyName" => $theConferenceName,
        "status" => "in-progress"
    ));
foreach ($conferences as $record) {
    echo "+ " . $record->sid . " Name: " . $record->friendlyName . "\xA";
    $theConference = $record->sid;
}
$conference = $twilio->conferences($theConference)->update(array("status" => "completed"));
echo "++ Ended.\xA";
?>

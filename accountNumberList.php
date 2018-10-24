<?php
require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
use Twilio\Rest\Client;
$client = new Client(getenv('ACCOUNT_SID'), getenv('AUTH_TOKEN'));
$result = $client->messages->read();
$i = 0;
// date_default_timezone_set("UTC");
$sNumbers = "";
$separator = ":";
foreach ($client->incomingPhoneNumbers->read() as $number) {
    // echo "\xA" . $number->dateCreated->format('Y-m-d H:i') . " : " . $number->phoneNumber;
    $sNumbers = $sNumbers . $number->phoneNumber . $separator;
}
if ($sNumbers == "") {
    echo "0";
    return;
}
echo substr($sNumbers,0,strlen($sNumbers)-1);
// echo "\xA";
?>
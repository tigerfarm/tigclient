<?php
require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
use Twilio\Rest\Client;
$client = new Client(getenv('ACCOUNT_SID'), getenv('AUTH_TOKEN'));
$result = $client->messages->read();
//
echo "+ List:" . "\xA";
foreach ($client->incomingPhoneNumbers->read() as $number) {
    echo "++ " . $number->phoneNumber . " " . $number->dateCreated->format('Y-m-d H:i') . "+ " . $number->friendlyName . "\xA";
}
?>
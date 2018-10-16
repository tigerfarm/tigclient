<?php

function sortArray($theArray) {
    // Note, sort($theArray) didn't work on Heroku. It's likely the PHP version.
    $arrlength = count($theArray);
    for ($h = 0; $h < $arrlength - 1; $h++) {
        $low = $h;
        $lowItem = $theArray[$low];
        for ($i = $h; $i < $arrlength - 1; $i++) {
            if ($lowItem > $theArray[$i + 1]) {
                $low = $i + 1;
                $lowItem = $theArray[$low];
            }
        }
        $theArray[$low] = $theArray[$h];
        $theArray[$h] = $lowItem;
    }
    return $theArray;
}

require __DIR__ . '/twilio-php-master/Twilio/autoload.php';

use Twilio\Rest\Client;

$client = new Client(getenv('ACCOUNT_SID'), getenv('AUTH_TOKEN'));
$result = $client->messages->read();
//
date_default_timezone_set("UTC");
$i = 0;
$phArray = "";
echo 'Account phone numbers with date created:';
foreach ($client->incomingPhoneNumbers->read() as $number) {
    // echo "\xA+ " . $number->dateCreated->format('Y-m-d H:i') . " : " . $number->phoneNumber;
    $phArray[$i++] = $number->phoneNumber . " " . $number->dateCreated->format('Y-m-d H:i');
}
$sortedArray = sortArray($phArray); // Note, sort($phArray) didn't work on Heroku.
$arraylength = count($sortedArray);
foreach ($sortedArray as $item) {
    echo "\xA+ " . $item;
}
echo "\xA+ End of List.";
?>

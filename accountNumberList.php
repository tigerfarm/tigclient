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
$i = 0;
$phArray = "";
foreach ($client->incomingPhoneNumbers->read() as $number) {
    $phArray[$i++] = $number->phoneNumber;
}
if ($i == 0) {
    echo "0";
    return;
}
//
$sNumbers = "";
$separator = ":";
// $sortedArray = sortArray($phArray); // Note, sort($phArray) didn't work on Heroku.
$sortedArray = $phArray;
$arraylength = count($sortedArray);
foreach ($sortedArray as $item) {
    $sNumbers = $sNumbers . $item . $separator;
}
echo substr($sNumbers,0,strlen($sNumbers)-1);
?>

<?php
require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
use Twilio\Rest\Client;
// -------------------------------------------------------
$account_sid = getenv("ACCOUNT_SID");
$auth_token = getenv('AUTH_TOKEN');
$client = new Client($account_sid, $auth_token);
// -------------------------------------------------------
$workspace_sid = getenv("WORKSPACE_SID");
$activities = $client->taskrouter->v1->workspaces($workspace_sid)->activities->read();
$sList = "";
$separator = ":";
foreach ($activities as $item) {
    // echo $item->sid . $separator . $item->friendlyName . $separator . "\xA";
    $sList = $sList . $item->sid . $separator . $item->friendlyName . $separator;
}
echo substr($sList,0,strlen($sList)-1);;
?>

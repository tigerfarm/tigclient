<?php
// -------------------------------------------------------
$token_password = getenv("TOKEN_PASSWORD");
if ($argc > 0 ) {
    $tokenPassword = $argv[2];
} else {
    $tokenPassword = $_REQUEST['tokenPassword'];
}
if ($token_password !== $tokenPassword) {
    // echo "0" . " :" . $token_password . ":" . $tokenPassword . ":";
    echo "0";
    return;
}
// -------------------------------------------------------
require __DIR__ . '/twilio-php-master/Twilio/autoload.php';
use Twilio\Jwt\TaskRouter\WorkerCapability;
// -------------------------------------------------------
$account_sid = getenv("ACCOUNT_SID");
$auth_token = getenv('AUTH_TOKEN');
$workspace_sid = getenv("WORKSPACE_SID");
// -------------------------------------------------------
$workerSid = 'WK1497b31f767af9d75d0955e6ed1420b3';   // For worker: david
$capability = new WorkerCapability($account_sid, $auth_token, $workspace_sid, $workerSid);
$capability->allowFetchSubresources();
$capability->allowActivityUpdates();
$capability->allowReservationUpdates();
$workerToken = $capability->generateToken(28800);  // Expire: 60 * 60 * 8
echo $workerToken;
?>

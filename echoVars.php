<?php
echo "---------------------------------------";
echo "\xA+++ Echo environment variables.";
//
$accountSid = getenv("ACCOUNT_SID");
$authToken = getenv('AUTH_TOKEN');
echo "\xA", "+ ACCOUNT_SID      : ", $accountSid;
echo "\xA", "+ AUTH_TOKEN       : ", $authToken;
//
$tokenHost = getenv("TOKEN_HOST");
$tokenClientId = getenv('CLIENT_ID');
$tokenPassword = getenv('TOKEN_PASSWORD');
echo "\xA", "+ TOKEN_HOST       : ", $tokenHost;
echo "\xA", "+ TOKEN_PASSWORD   : ", $tokenPassword;
echo "\xA", "+ CLIENT_ID        : ", $tokenClientId;
//
echo "\xA--------------------------------------- \xA";
?>

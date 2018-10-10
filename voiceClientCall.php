<?php

// This program is called based on the API Key.

// echo "+ argc = " . $argc . "\xA";
if ($argc > 1) {
    $From = $argv[1];
} else {
    $From = $_REQUEST['From'];
}
if ($argc > 2) {
    $To = $argv[2];
} else {
    $To = $_REQUEST['To'];
}
// echo "+ conferenceName = " . $conferenceName . "\xA";
if ($From === null || $To === null) {
    echo "0";
    return;
}
print('<?xml version="1.0" encoding="UTF-8"?>' . "\xA");
print('<Response>' . "\xA");
if (strncmp($To, "enqueue:", 8) === 0) {
    //        12345678
    print("<Enqueue>" . substr($To, 8) . "</Enqueue>" . "\xA");
} else {
    //  action="http://tigerfarmpress.com/cgi/echo.php"
    print('<Dial callerId="' . $From . '" record="do-not-record">');
    if (strncmp($To, "client:", 7) === 0) {
        //            1234567
        print("<Client>" . substr($To, 7) . "</Client>");
    } elseif (strncmp($To, "conference:", 11) === 0) {
        //                  12345678901
        print("<Conference>" . substr($To, 11) . "</Conference>");
    } elseif (strncmp($To, "sip:", 4) === 0) {
        //                  1234
        print("<Sip>" . $To . "</Sip>");
    } elseif (strncmp($To, "queue:", 6) === 0) {
        //                  123456
        print("<Queue>" . substr($To, 6) . "</Queue>");
    } else {
        // PSTN
        print($To);
    }
    print('</Dial>' . "\xA");
}
print('</Response>' . "\xA");
?>

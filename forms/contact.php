<?php

require_once __DIR__ . '/../api/_bootstrap.php';

// Default receiving email (can be overridden by data/contact.json)
$receiving_email_address = 'stephensouth1307@example.com';

// Load contact settings if available
$contactConfig = read_json(DATA_DIR . '/contact.json', []);
if (!empty($contactConfig['email']) && filter_var($contactConfig['email'], FILTER_VALIDATE_EMAIL)) {
    $receiving_email_address = $contactConfig['email'];
}
$webhookUrl = isset($contactConfig['googleSheetWebhook']) ? (string)$contactConfig['googleSheetWebhook'] : '';

// Check if the PHP Email Form library exists
if (file_exists($php_email_form = '../assets/vendor/php-email-form/php-email-form.php')) {
    include($php_email_form);
} else {
    die('Unable to load the "PHP Email Form" Library!');
}

$contact = new PHP_Email_Form;
$contact->ajax = true;

// Set the receiving email address
$contact->to = $receiving_email_address;

// Validate and set the sender's name and email
if (isset($_POST['name']) && isset($_POST['email'])) {
    $from_name = htmlspecialchars($_POST['name']);
    $from_email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $contact->from_name = $from_name;
    $contact->from_email = $from_email;
} else {
    die('Name and email are required.');
}

// Set the email subject
$subject = isset($_POST['subject']) ? htmlspecialchars($_POST['subject']) : 'No Subject';
$contact->subject = $subject;

// Uncomment below code if you want to use SMTP to send emails. You need to enter your correct SMTP credentials
/*
$contact->smtp = array(
    'host' => 'example.com',
    'username' => 'example',
    'password' => 'pass',
    'port' => '587'
);
*/

// Add messages to the email
$messageBody = isset($_POST['message']) ? htmlspecialchars($_POST['message']) : 'No message';
$contact->add_message($from_name, 'From');
$contact->add_message($from_email, 'Email');
$contact->add_message($messageBody, 'Message', 10);

// Persist message to data/messages.json
$messagesFile = DATA_DIR . '/messages.json';
$messages = read_json($messagesFile, []);
$entry = [
    'id' => bin2hex(random_bytes(8)),
    'name' => $from_name,
    'email' => $from_email,
    'subject' => $subject,
    'message' => $messageBody,
    'createdAt' => date('c'),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
];
$messages[] = $entry;
write_json($messagesFile, $messages);

// Forward to webhook if configured
if ($webhookUrl) {
    $payload = json_encode($entry, JSON_UNESCAPED_UNICODE);
    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'timeout' => 3
        ]
    ];
    @file_get_contents($webhookUrl, false, stream_context_create($opts));
}

// Send the email and echo the result
echo $contact->send();
?>

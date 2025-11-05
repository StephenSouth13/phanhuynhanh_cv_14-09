<?php

require_once __DIR__ . '/../api/_bootstrap.php';

$receiving_email_address = 'stephensouth1307@example.com';

// Load contact settings if available
$contactCollection = get_collection('contact');
$contactDoc = $contactCollection->findOne([]);
if ($contactDoc && !empty($contactDoc['email'])) {
    if (filter_var($contactDoc['email'], FILTER_VALIDATE_EMAIL)) {
        $receiving_email_address = $contactDoc['email'];
    }
}
$webhookUrl = isset($contactDoc['googleSheetWebhook']) ? (string)$contactDoc['googleSheetWebhook'] : '';

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

// Add messages to the email
$messageBody = isset($_POST['message']) ? htmlspecialchars($_POST['message']) : 'No message';
$contact->add_message($from_name, 'From');
$contact->add_message($from_email, 'Email');
$contact->add_message($messageBody, 'Message', 10);

// Persist message to MongoDB contacts collection
$entry = [
    'name' => $from_name,
    'email' => $from_email,
    'subject' => $subject,
    'message' => $messageBody,
    'createdAt' => new \MongoDB\BSON\UTCDateTime(),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
];

try {
    $contactsCollection = get_collection('contacts');
    $contactsCollection->insertOne($entry);
} catch (\Exception $e) {
    error_log('Failed to save contact form: ' . $e->getMessage());
}

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

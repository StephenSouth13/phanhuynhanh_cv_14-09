<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

require_auth();

$messagesFile = DATA_DIR . '/messages.json';
if (!file_exists($messagesFile)) {
    write_json($messagesFile, []);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $items = read_json($messagesFile, []);
    // Sort newest first by createdAt
    usort($items, function($a, $b) {return strcmp($b['createdAt'] ?? '', $a['createdAt'] ?? '');});
    ok(['items' => $items]);
}
elseif ($method === 'DELETE') {
    $id = (string)($_GET['id'] ?? '');
    if ($id === '') error_response(400, 'Missing id');
    $items = read_json($messagesFile, []);
    $filtered = array_values(array_filter($items, fn($m) => ($m['id'] ?? '') !== $id));
    if (!write_json($messagesFile, $filtered)) error_response(500, 'Failed to delete');
    ok(['deleted' => true]);
}
else {
    error_response(405, 'Method Not Allowed');
}

<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response(405, 'Method Not Allowed');
}

if (!isset($_FILES['file'])) {
    error_response(400, 'Missing file');
}

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) {
    error_response(400, 'Upload error');
}

$maxSize = 5 * 1024 * 1024; // 5MB
if ($file['size'] > $maxSize) {
    error_response(413, 'File too large');
}

$allowed = ['jpg','jpeg','png','gif','webp','svg'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowed, true)) {
    error_response(415, 'Unsupported file type');
}

$base = pathinfo($file['name'], PATHINFO_FILENAME);
$base = sanitize_filename($base);
$targetName = $base . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
$targetPath = UPLOADS_DIR . '/' . $targetName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    error_response(500, 'Failed to store file');
}

// Return URL relative to site root
$url = '/uploads/' . $targetName;
ok(['url' => $url, 'name' => $targetName]);

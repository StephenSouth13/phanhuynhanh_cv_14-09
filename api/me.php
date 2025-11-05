<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response(405, 'Method Not Allowed');
}

$user = current_user();
if (!$user) error_response(401, 'Unauthorized');
ok(['user' => $user]);

<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response(405, 'Method Not Allowed');
}

session_unset();
session_destroy();
ok(['message' => 'Logged out']);

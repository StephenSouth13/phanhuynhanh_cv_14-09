<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response(405, 'Method Not Allowed');
}

$body = json_input();
$email = strtolower(trim($body['email'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($email === '' || $password === '') {
    error_response(400, 'Missing email or password');
}

$users = read_json(DATA_DIR . '/users.json', []);
$match = null;
foreach ($users as $u) {
    if (strtolower($u['email'] ?? '') === $email) { $match = $u; break; }
}

if (!$match || !password_verify($password, $match['passwordHash'] ?? '')) {
    error_response(401, 'Invalid credentials');
}

$_SESSION['user'] = [
    'email' => $match['email'],
    'name' => $match['name'] ?? 'Admin',
    'avatar' => $match['avatar'] ?? ''
];

ok(['user' => $_SESSION['user']]);

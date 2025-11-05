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

$usersCollection = get_collection('users');
$user = $usersCollection->findOne(['email' => $email]);

if (!$user || !password_verify($password, $user['passwordHash'] ?? '')) {
    error_response(401, 'Invalid credentials');
}

$_SESSION['user'] = [
    'email' => $user['email'],
    'name' => $user['name'] ?? 'Admin',
    'avatar' => $user['avatar'] ?? ''
];

ok(['user' => $_SESSION['user']]);

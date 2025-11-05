<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

// Check if admin already exists
$usersCollection = get_collection('users');
$existingAdmin = $usersCollection->findOne(['email' => 'msc.edu.vn@gmail.com']);

if ($existingAdmin) {
    echo json_encode([
        'success' => false,
        'message' => 'Admin account already exists'
    ]);
    exit;
}

try {
    // Create admin account
    $adminData = [
        'email' => 'msc.edu.vn@gmail.com',
        'name' => 'MSC Admin',
        'passwordHash' => password_hash('msc.edu.vn', PASSWORD_BCRYPT),
        'avatar' => '',
        'role' => 'admin',
        'createdAt' => new \MongoDB\BSON\UTCDateTime(),
        'updatedAt' => new \MongoDB\BSON\UTCDateTime()
    ];

    $result = $usersCollection->insertOne($adminData);

    echo json_encode([
        'success' => true,
        'message' => 'Admin account created successfully',
        'credentials' => [
            'email' => 'msc.edu.vn@gmail.com',
            'password' => 'msc.edu.vn',
            'loginUrl' => '/admin'
        ]
    ]);
} catch (\Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

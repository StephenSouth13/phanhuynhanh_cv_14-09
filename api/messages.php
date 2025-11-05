<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

require_auth();

$messagesCollection = get_collection('messages');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $items = $messagesCollection->find(
        [],
        ['sort' => ['createdAt' => -1]]
    );

    $result = [];
    foreach ($items as $doc) {
        $arr = bson_to_array($doc);
        if (isset($arr['_id'])) {
            $arr['id'] = $arr['_id'];
            unset($arr['_id']);
        }
        $result[] = $arr;
    }

    ok(['items' => $result]);
}
elseif ($method === 'DELETE') {
    $id = (string)($_GET['id'] ?? '');
    if ($id === '') {
        error_response(400, 'Missing id');
    }
    
    try {
        $result = $messagesCollection->deleteOne([
            '_id' => new \MongoDB\BSON\ObjectId($id)
        ]);
        
        if ($result->getDeletedCount() === 0) {
            error_response(404, 'Message not found');
        }
        
        ok(['deleted' => true]);
    } catch (\Exception $e) {
        error_response(400, 'Invalid message id');
    }
}
else {
    error_response(405, 'Method Not Allowed');
}

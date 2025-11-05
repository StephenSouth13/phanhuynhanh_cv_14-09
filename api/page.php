<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

require_auth();

$method = $_SERVER['REQUEST_METHOD'];
$section = strtolower(trim($_GET['section'] ?? ''));

if ($section === '' || !allowed_section($section)) {
    error_response(400, 'Invalid section');
}

$collection = get_collection($section);

switch ($method) {
    case 'GET':
        $doc = $collection->findOne([]);
        if ($doc) {
            $data = bson_to_array($doc);
            if (isset($data['_id'])) {
                unset($data['_id']);
            }
            ok($data);
        } else {
            ok([]);
        }
        break;

    case 'POST':
    case 'PUT':
        $input = json_input();
        if (!is_array($input)) {
            error_response(400, 'Invalid JSON');
        }

        // Basic sanitation for strings to reduce XSS risk
        array_walk_recursive($input, function (&$v) {
            if (is_string($v)) {
                $v = preg_replace('/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/is', '', $v);
            }
        });

        $input['updatedAt'] = new \MongoDB\BSON\UTCDateTime();
        if (!isset($input['createdAt'])) {
            $input['createdAt'] = new \MongoDB\BSON\UTCDateTime();
        }

        try {
            $existing = $collection->findOne([]);
            if ($existing) {
                $collection->updateOne(
                    ['_id' => $existing['_id']],
                    ['$set' => $input]
                );
            } else {
                $collection->insertOne($input);
            }
            ok(['saved' => true]);
        } catch (\Exception $e) {
            error_response(500, 'Failed to save: ' . $e->getMessage());
        }
        break;

    case 'DELETE':
        try {
            $collection->deleteMany([]);
            ok(['deleted' => true]);
        } catch (\Exception $e) {
            error_response(500, 'Failed to delete');
        }
        break;

    default:
        error_response(405, 'Method Not Allowed');
}

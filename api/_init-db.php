<?php
/**
 * Database Initialization Script
 * 
 * Run this once after deployment to initialize MongoDB collections.
 * Access via: https://your-domain.com/api/_init-db.php
 * 
 * Returns status of all collections created
 */

declare(strict_types=1);

require_once __DIR__ . '/_database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    MongoDBHelper::initializeCollections();
    
    $db = MongoDBHelper::getDatabase();
    $collections = [];
    
    foreach ($db->listCollections() as $collectionInfo) {
        $collName = $collectionInfo->getName();
        $collection = $db->selectCollection($collName);
        $count = $collection->countDocuments();
        $collections[] = [
            'name' => $collName,
            'documents' => $count
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'message' => 'Database initialized successfully',
        'database' => getenv('MONGODB_DATABASE'),
        'collections' => $collections
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

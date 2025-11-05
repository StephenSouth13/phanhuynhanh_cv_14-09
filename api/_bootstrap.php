<?php
declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/_database.php';

define('UPLOADS_DIR', __DIR__ . '/../uploads');

if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

try {
    MongoDBHelper::initializeCollections();
} catch (\Exception $e) {
    error_log('MongoDB initialization error: ' . $e->getMessage());
}

function get_collection(string $name): \MongoDB\Collection {
    return MongoDBHelper::collection($name);
}

function json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function error_response(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

function ok($payload = null): void {
    echo json_encode(['ok' => true, 'data' => $payload]);
    exit;
}

function current_user(): ?array {
    return $_SESSION['user'] ?? null;
}

function require_auth(): void {
    if (!current_user()) {
        error_response(401, 'Unauthorized');
    }
}

function sanitize_filename(string $name): string {
    $name = preg_replace('/[^a-zA-Z0-9-_\.]/', '_', $name);
    return trim($name, '_');
}

function allowed_section(string $section): bool {
    $allowed = ['home','about','resume','portfolio','services','contact','settings'];
    return in_array($section, $allowed, true);
}

function bson_to_array(\MongoDB\Model\BSONDocument $doc): array {
    return json_decode(json_encode($doc), true);
}

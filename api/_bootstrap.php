<?php
// Common bootstrap for API endpoints
// Starts session, sets constants, and provides helper functions

declare(strict_types=1);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

// Base directories
define('DATA_DIR', __DIR__ . '/../data');
define('UPLOADS_DIR', __DIR__ . '/../uploads');

// Ensure directories exist
if (!is_dir(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

// Initialize users store if missing
$usersFile = DATA_DIR . '/users.json';
if (!file_exists($usersFile)) {
    $defaultUser = [
        [
            'email' => 'admin@example.com',
            // password: admin123 (please change immediately after first login)
            'passwordHash' => password_hash('admin123', PASSWORD_DEFAULT),
            'name' => 'Administrator',
            'avatar' => ''
        ]
    ];
    file_put_contents($usersFile, json_encode($defaultUser, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function read_json(string $path, $default = []): array {
    if (!file_exists($path)) return is_array($default) ? $default : [];
    $raw = file_get_contents($path);
    if ($raw === false || $raw === '') return is_array($default) ? $default : [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : (is_array($default) ? $default : []);
}

function write_json(string $path, array $data): bool {
    $tmp = $path . '.tmp';
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if ($json === false) return false;
    if (file_put_contents($tmp, $json) === false) return false;
    return rename($tmp, $path);
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

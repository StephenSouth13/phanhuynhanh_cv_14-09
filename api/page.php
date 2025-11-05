<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

require_auth();

$method = $_SERVER['REQUEST_METHOD'];
$section = strtolower(trim($_GET['section'] ?? ''));
if ($section === '' || !allowed_section($section)) {
    error_response(400, 'Invalid section');
}

$file = DATA_DIR . '/' . $section . '.json';

switch ($method) {
    case 'GET':
        $data = read_json($file, []);
        ok($data);
        break;

    case 'POST':
    case 'PUT':
        $input = json_input();
        if (!is_array($input)) {
            error_response(400, 'Invalid JSON');
        }
        // Basic sanitation for strings to reduce XSS risk; keep content flexible
        array_walk_recursive($input, function (&$v) {
            if (is_string($v)) {
                // Strip script tags only
                $v = preg_replace('/<\s*script[^>]*>.*?<\s*\/\s*script\s*>/is', '', $v);
            }
        });
        if (!write_json($file, $input)) {
            error_response(500, 'Failed to save');
        }
        ok(['saved' => true]);
        break;

    case 'DELETE':
        if (file_exists($file)) {
            unlink($file);
        }
        ok(['deleted' => true]);
        break;

    default:
        error_response(405, 'Method Not Allowed');
}

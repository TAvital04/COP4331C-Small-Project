<?php
/**
 * Database Connection & Request Parsing Helper for COP4331 LAMP API
 *
 * Provides reusable functions for environment configuration parsing,
 * database connectivity (mysqli), and JSON request payload extraction.
 */

/**
 * Loads environment variables from a .env file into $_ENV, $_SERVER, and getenv().
 * Runs without external dependencies and fails safely if the file is missing or unreadable.
 *
 * @param string $path Absolute or relative path to the .env file
 * @return bool True if loaded successfully, false otherwise
 */
function loadEnv(string $path): bool
{
    if (!file_exists($path) || !is_readable($path)) {
        return false;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return false;
    }

    foreach ($lines as $line) {
        $line = trim($line);

        // Skip blank lines and comment lines
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        // Handle optional 'export ' prefix syntax
        if (str_starts_with($line, 'export ')) {
            $line = trim(substr($line, 7));
        }

        // Skip lines without an equals separator
        if (!str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);

        $key   = trim($key);
        $value = trim($value);

        // Remove surrounding matching quotes if present
        if (
            (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))
        ) {
            $value = substr($value, 1, -1);
        }

        // Populate runtime environment stores
        if (!array_key_exists($key, $_ENV)) {
            $_ENV[$key] = $value;
        }
        if (!array_key_exists($key, $_SERVER)) {
            $_SERVER[$key] = $value;
        }
        putenv("{$key}={$value}");
    }

    return true;
}

/**
 * Establishes and returns a MySQL connection instance using mysqli.
 * Searches candidate .env file paths (e.g. ../.env or ../../.env) and falls back
 * to default credentials (localhost / TheBeast / WeLoveCOP4331 / COP4331).
 *
 * @return mysqli Active mysqli connection object
 * @throws Exception If connection to the database fails
 */
function getDbConnection(): mysqli
{
    // Candidate paths for .env file lookup
    $candidatePaths = [
        __DIR__ . '/.env',
        __DIR__ . '/../.env',
        __DIR__ . '/../../.env',
    ];

    foreach ($candidatePaths as $path) {
        if (file_exists($path)) {
            loadEnv($path);
            break;
        }
    }

    // Retrieve configuration with fallbacks
    $host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? 'localhost');
    $user = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'TheBeast');
    $pass = getenv('DB_PASSWORD') ?: (getenv('DB_PASS') ?: ($_ENV['DB_PASSWORD'] ?? ($_ENV['DB_PASS'] ?? 'WeLoveCOP4331')));
    $db   = getenv('DB_NAME') ?: (getenv('DB_DATABASE') ?: ($_ENV['DB_NAME'] ?? ($_ENV['DB_DATABASE'] ?? 'COP4331')));
    $port = (int)(getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? 3306));

    $conn = new mysqli($host, $user, $pass, $db, $port);

    if ($conn->connect_error) {
        throw new Exception("Database Connection Error (" . $conn->connect_errno . "): " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");

    return $conn;
}

/**
 * Reads and decodes JSON payload from the HTTP request body (php://input).
 *
 * @return array Decoded JSON payload as an associative array, or empty array if missing/invalid
 */
function getRequestInfo(): array
{
    $rawInput = file_get_contents('php://input');
    if (!$rawInput) {
        return [];
    }

    $decoded = json_decode($rawInput, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Helper utility to send a JSON response with proper HTTP status headers.
 *
 * @param mixed $data Response payload to serialize
 * @param int $statusCode HTTP status code (defaults to 200)
 * @return void
 */
function sendResultInfoAsJson(mixed $data, int $statusCode = 200): void
{
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

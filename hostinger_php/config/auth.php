<?php

function getJwtSecret(): string {
    static $secret = null;
    if ($secret !== null) return $secret;

    $env = getenv('JWT_SECRET') ?: ($_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? '');
    if ($env !== '') {
        $secret = $env;
        return $secret;
    }

    // Fail closed in production: never fall back to a hardcoded, publicly known secret.
    $appEnv = strtolower((string)(getenv('APP_ENV') ?: ($_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? 'production')));
    if ($appEnv === 'production' || $appEnv === 'prod') {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Server configuration error: JWT_SECRET is not set']);
        exit;
    }

    // Non-production only: ephemeral random secret (tokens do not survive restarts).
    $secret = bin2hex(random_bytes(32));
    return $secret;
}

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

// Sign a JWT (HS256) — payload must include 'id' and 'username'
function jwtSign(array $payload, int $ttlSeconds = 604800): string {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload['iat'] = time();
    $payload['exp'] = time() + $ttlSeconds;

    $headerEnc = base64UrlEncode(json_encode($header));
    $payloadEnc = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', "$headerEnc.$payloadEnc", getJwtSecret(), true);
    $sigEnc = base64UrlEncode($signature);

    return "$headerEnc.$payloadEnc.$sigEnc";
}

// Verify a JWT and return payload array, or null if invalid/expired
function jwtVerify(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$headerEnc, $payloadEnc, $sigEnc] = $parts;
    $expectedSig = base64UrlEncode(hash_hmac('sha256', "$headerEnc.$payloadEnc", getJwtSecret(), true));
    if (!hash_equals($expectedSig, $sigEnc)) return null;

    $payload = json_decode(base64UrlDecode($payloadEnc), true);
    if (!is_array($payload)) return null;
    if (isset($payload['exp']) && time() >= (int)$payload['exp']) return null;

    return $payload;
}

// Extract Bearer or X-Admin-Token header defensively
function getBearerToken(): ?string {
    if (!empty($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        return trim($_SERVER['HTTP_X_ADMIN_TOKEN']);
    }
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (empty($auth) && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = $headers['Authorization'] ?? ($headers['authorization'] ?? ($headers['X-Admin-Token'] ?? ($headers['x-admin-token'] ?? '')));
    }
    if (preg_match('/Bearer\s+(\S+)/i', $auth, $m)) {
        return $m[1];
    }
    if ($auth !== '') return $auth;
    return null;
}

// Require admin auth; exits with 401 if missing/invalid, returns payload otherwise
function requireAdmin(): array {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Admin login required']);
        exit;
    }

    $payload = jwtVerify($token);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Invalid or expired token']);
        exit;
    }

    return $payload;
}

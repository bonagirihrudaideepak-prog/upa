<?php

function getJwtSecret(): string {
    return getenv('JWT_SECRET') ?: ($_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? 'upanishad_secret_key_2026');
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

// Extract Bearer token from Authorization header
function getBearerToken(): ?string {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (empty($auth)) {
        if (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
    }
    if (preg_match('/Bearer\s+(\S+)/i', $auth, $m)) {
        return $m[1];
    }
    return $auth !== '' ? $auth : null;
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

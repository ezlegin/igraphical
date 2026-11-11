<?php
/**
 * iGraphical protected media gateway for dl.igraphical.ir (cPanel).
 *
 * The app hands out links like
 *   https://dl.igraphical.ir/v.php?p=/Courses/x/S1-E1.mp4&u=42&e=1731400000&s=<hex>
 * where s = HMAC-SHA256(secret, "p|u|e"). This script checks the signature
 * and expiry, then streams the file (with Range support, so seeking works).
 * Direct access to /Courses is denied by Courses/.htaccess.
 *
 * The secret lives OUTSIDE public_html, in ../igraphical-dl-secret.php:
 *   <?php return 'same value as DL_SIGNING_SECRET in the app env';
 */

declare(strict_types=1);

const MEDIA_ROOT_DIR = 'Courses'; // folder inside public_html that is protected

function fail(int $code, string $msg): void
{
    http_response_code($code);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    echo $msg;
    exit;
}

$secretFile = dirname(__DIR__) . '/igraphical-dl-secret.php';
if (!is_file($secretFile)) fail(500, 'not configured');
$secret = (string) (require $secretFile);
if (strlen($secret) < 32) fail(500, 'not configured');

$p = isset($_GET['p']) ? (string) $_GET['p'] : '';
$u = isset($_GET['u']) ? (string) $_GET['u'] : '';
$e = isset($_GET['e']) ? (string) $_GET['e'] : '';
$s = isset($_GET['s']) ? strtolower((string) $_GET['s']) : '';

if ($p === '' || !ctype_digit($u) || !ctype_digit($e) || !preg_match('/^[0-9a-f]{64}$/', $s)) {
    fail(400, 'bad request');
}

$expected = hash_hmac('sha256', $p . '|' . $u . '|' . $e, $secret);
if (!hash_equals($expected, $s)) fail(403, 'invalid link');
if ((int) $e < time()) fail(410, 'link expired');

// Resolve the file and make sure it stays inside the media folder.
$rel = '/' . ltrim(preg_replace('#/+#', '/', $p), '/');
if (strpos($rel, '..') !== false || strpos($rel, "\0") !== false) fail(400, 'bad path');
$root = realpath(__DIR__ . '/' . MEDIA_ROOT_DIR);
$file = realpath(__DIR__ . $rel);
if ($root === false || $file === false || strpos($file, $root . DIRECTORY_SEPARATOR) !== 0 || !is_file($file)) {
    fail(404, 'not found');
}

$size = filesize($file);
$ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
$types = [
    'mp4' => 'video/mp4', 'm4v' => 'video/mp4', 'webm' => 'video/webm', 'mov' => 'video/quicktime',
    'mp3' => 'audio/mpeg', 'pdf' => 'application/pdf', 'zip' => 'application/zip', 'rar' => 'application/vnd.rar',
    'psd' => 'image/vnd.adobe.photoshop', 'ai' => 'application/postscript', 'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg', 'png' => 'image/png',
];
$type = $types[$ext] ?? 'application/octet-stream';
$inline = strpos($type, 'video/') === 0 || strpos($type, 'audio/') === 0;

// Range request (seeking in the player).
$start = 0;
$end = $size - 1;
if (isset($_SERVER['HTTP_RANGE']) && preg_match('/^bytes=(\d*)-(\d*)$/', $_SERVER['HTTP_RANGE'], $m)) {
    if ($m[1] === '' && $m[2] !== '') {          // last N bytes
        $start = max(0, $size - (int) $m[2]);
    } else {
        $start = (int) $m[1];
        if ($m[2] !== '') $end = min((int) $m[2], $size - 1);
    }
    if ($start > $end || $start >= $size) {
        header('Content-Range: bytes */' . $size);
        fail(416, 'range not satisfiable');
    }
    http_response_code(206);
    header('Content-Range: bytes ' . $start . '-' . $end . '/' . $size);
}

$length = $end - $start + 1;
header('Content-Type: ' . $type);
header('Content-Length: ' . $length);
header('Accept-Ranges: bytes');
header('Cache-Control: private, no-store');
header('X-Content-Type-Options: nosniff');
header('Content-Disposition: ' . ($inline ? 'inline' : 'attachment') . '; filename="' . basename($file) . '"');

if ($_SERVER['REQUEST_METHOD'] === 'HEAD') exit;

@set_time_limit(0);
while (ob_get_level() > 0) ob_end_clean();

$fh = fopen($file, 'rb');
if ($fh === false) fail(500, 'cannot open');
fseek($fh, $start);
$remaining = $length;
$chunk = 1024 * 256;
while ($remaining > 0 && !feof($fh) && !connection_aborted()) {
    $buf = fread($fh, (int) min($chunk, $remaining));
    if ($buf === false) break;
    echo $buf;
    flush();
    $remaining -= strlen($buf);
}
fclose($fh);

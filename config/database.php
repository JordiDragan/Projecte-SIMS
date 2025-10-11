<?php
$host = getenv('POSTGRES_HOST') ?: 'localhost';
$db   = getenv('POSTGRES_DB') ?: 'blinkdb';
$user = getenv('POSTGRES_USER') ?: 'admin';
$pass = getenv('POSTGRES_PASSWORD') ?: '';
$charset = 'utf8';

$dsn = "pgsql:host=$host;dbname=$db;options='--client_encoding=$charset'";
$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
  $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
  die('Database connection failed: ' . $e->getMessage());
}

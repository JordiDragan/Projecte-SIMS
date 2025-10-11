<?php
session_start();
header('Content-Type: application/json');
require_once '../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode([
    'success' => false,
    'message' => 'Invalid email format.'
  ]);
  exit;
}

if (strlen($password) < 8) {
  echo json_encode([
    'success' => false,
    'message' => 'Password must be at least 8 characters.'
  ]);
  exit;
}

// Database lookup
try {
  $stmt = $pdo->prepare("SELECT id, password FROM users WHERE email = ?");
  $stmt->execute([$email]);
  $user = $stmt->fetch();

  if (!$user) {
    echo json_encode([
      'success' => false,
      'message' => 'Email not registered.'
    ]);
    exit;
  }

  if (!password_verify($password, $user['password'])) {
    echo json_encode([
      'success' => false,
      'message' => 'Incorrect password.'
    ]);
    exit;
  }

  // Session handling
  $_SESSION['user_id'] = $user['id'];
  echo json_encode([
    'success' => true,
    'message' => 'Login successful.'
  ]);
  exit;

} catch (PDOException $e) {
  echo json_encode([
    'success' => false,
    'message' => 'Database error.'
  ]);
  exit;
}

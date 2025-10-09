<?php
header('Content-type: application/json');

// Database Connexion
$host = getenv('POSTGRES_HOST') ?: 'postgres_db';
$port = getenv('POSTGRES_PORT') ?: '5432';
$db = getenv('POSTGRES_DB');
$user = getenv('POSTGRES_USER');
$pass = getenv('POSTGRES_PASSWORD');

if (!$db || !$user || !$pass) {
    echo json_encode(['success' => false, 'message' => 'Database configuration is missing.']);
    exit;
}

// PostgreSQL connection
$dsn = "pgsql:host=$host;port=$port;dbname=$db;";
try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'DB connection error']);
    exit;
}


// Get register data
$data = json_decode(file_get_contents('php://input'), true);
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

// Validations
$errors = [];
if (empty($name) || !preg_match('/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/', $name)) {
    $errors[] = 'Invalid name.';
}
if(!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format.';
}
if (strlen($password) < 8) {
    $errors[] = 'The password must be at least 8 characters long.';
}
if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}


// Check if the user already exist
$stmt = $pdo->prepare("SELECT 1 FROM users WHERE email = ?");
$stmt->execute([$email]);
if($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'This mail has already been registred.']);
    exit;
}

// Save user
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?");
    $stmt->execute([$name, $email, $hashedPassword]);
    echo json_encode(['success' => true, 'message' => 'User registred.']);
} catch (PDOException $e) {
    echo json_encode([ 'success' => false, 'message' => 'Error saving user.']);
}
?>
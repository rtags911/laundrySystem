<?php
include_once '../functions/connection.php';

session_start(); // Start the session

// Get the form data
$username = $_POST['username'];
$password = $_POST['password'];

// Check if the user exists
$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $db->prepare($sql);
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {
    // Save user ID to the session
    $_SESSION['id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['level'] = $user['level'];

    // Return user information
    http_response_code(200);
    echo json_encode(
        array(
            "success" => true,
            "username" => $user['username'],
            "level" => $user['level'],
            "id" => $user['id'],
            "message" => "Login successful"
        )
    );
} else {
    // Return error message
    http_response_code(401);
    echo json_encode(array("message" => "Wrong username or password"));
}
?>
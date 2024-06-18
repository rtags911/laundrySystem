<?php
session_start();

// Initialize response array
$response = array();

// Unset all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Check if session is completely destroyed
if (session_status() === PHP_SESSION_NONE) {
    $response['success'] = true;
    $response['message'] = "Logout successful";
} else {
    $response['success'] = false;
    $response['message'] = "Logout failed";
}

// Set response headers
header('Content-Type: application/json');
http_response_code(200);

// Return JSON response
echo json_encode($response);
?>
<?php
include_once '../api/function/conn.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
// Get the user ID from the query parameters

$user_id = isset($_GET['id']) ? $_GET['id'] : null;

if ($user_id) {
    $sql = 'SELECT * FROM logs WHERE user_id = :user_id  ORDER BY created_at DESC ';
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $response = array();
    foreach ($results as $row) {
        // Get username from users table
        $sql = 'SELECT username FROM users WHERE id = :id';
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':id', $row['user_id']);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // Add user information to the log entry
            $row['username'] = $user['username'];
        } else {
            $row['username'] = 'Unknown User';
        }

        $response[] = $row;
    }

    echo json_encode($response);
} else {
    echo json_encode(['error' => 'User ID is missing']);
}
?>
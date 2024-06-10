<?php
$host = 'localhost';
$dbname = 'u663034616_laundry';
$username = 'u663034616_laundry';
$password = 'D1h41pesgx911!';

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

function generate_logs($db, $type, $logs)
{
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    $sql = "INSERT INTO logs (user_id, logs, type) VALUES (:user_id, :logs, :type)";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':user_id', $_SESSION['id']);
    $stmt->bindParam(':logs', $logs);
    $stmt->bindParam(':type', $type);
    $stmt->execute();
}

?>
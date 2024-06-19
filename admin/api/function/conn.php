<?php
session_start();

$host = 'localhost';
$dbname = 'u663034616_laundry';
$username = 'u663034616_laundry';
$password = 'D1h41pesgx911!';

// $host = 'localhost';
// $dbname = 'lms_db';
// $username = 'root';
// $password = '';



try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

function generate_logs($db, $type, $logs)
{


    $sql = "INSERT INTO logs (user_id, logs, type) VALUES (:user_id, :logs, :type)";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':user_id', $_SESSION['id']);
    $stmt->bindParam(':logs', $logs);
    $stmt->bindParam(':type', $type);
    $stmt->execute();
}

?>
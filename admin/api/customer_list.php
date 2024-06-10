<?php
include_once 'function/conn.php';

$sql = 'SELECT * FROM customers ORDER BY fullname ASC';
$stmt = $db->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

$response = array();
foreach ($results as $row) {
    $response[] = $row;
}

echo json_encode($response);
?>
<?php
include_once 'functions/connection.php';

$sql = 'SELECT * FROM prices ORDER BY name ASC';
$stmt = $db->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

$response = array();
foreach ($results as $row) {
    $response[] = $row;
}

echo json_encode($response);
?>
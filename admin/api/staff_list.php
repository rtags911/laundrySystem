<?php
include_once 'function/conn.php';

// Adjust the SQL query to filter by level 0 or 1
$sql = 'SELECT * FROM users WHERE level IN (0, 1) ORDER BY id DESC';
$stmt = $db->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

$response = array();
foreach ($results as $row) {
    // Map the level to the corresponding role
    if ($row['level'] == 0) {
        $row['role'] = 'admin';
    } elseif ($row['level'] == 1) {
        $row['role'] = 'staff';
    }
    $response[] = $row;
}

echo json_encode($response);
?>
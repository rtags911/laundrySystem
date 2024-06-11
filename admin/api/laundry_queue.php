<?php
include_once '../api/function/conn.php';

// SQL query to fetch data from books table joined with customers table
$sql = 'SELECT * from books';

// Prepare and execute the SQL query
$stmt = $db->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Map status codes to status texts
$statusMappings = [
    0 => 'Pending',
    1 => 'Processing',
    2 => 'Folding',
    3 => 'Ready for Pickup',
    4 => 'Claimed',
    // Add more mappings as needed
];

// Iterate over the results and add status text based on status code
foreach ($results as &$row) {
    $statusCode = $row['status'];
    $row['status_text'] = isset($statusMappings[$statusCode]) ? $statusMappings[$statusCode] : 'Unknown';
}

// Set response header to indicate JSON content
header('Content-Type: application/json');

// Output JSON-encoded results
echo json_encode($results);
?>
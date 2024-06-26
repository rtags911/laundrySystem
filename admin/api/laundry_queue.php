<?php
include_once '../api/function/conn.php';

// SQL query to fetch data from books table joined with customers table
$sql = 'SELECT b.*, c.photo AS customer_photo
FROM books b
LEFT JOIN customers c ON b.customer_id = c.id
ORDER BY FIELD(b.status, 0, 1, 2, 3, 4, 5), b.created_at DESC
';

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
    5 => 'cancelled',
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
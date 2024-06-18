<?php
include_once '../../admin/api/function/conn.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Get the raw POST data
$postData = file_get_contents("php://input");
$request = json_decode($postData, true);

// Check if the id parameter is provided via POST
if (!isset($request['id'])) {
    echo json_encode(['error' => 'ID parameter missing']);
    exit;
}

$id = $request['id'];

// SQL query to fetch data from books table joined with customers table
$sql = 'SELECT * FROM books WHERE customer_id = :id';

// Prepare and execute the SQL query
$stmt = $db->prepare($sql);
$stmt->bindParam(':id', $id, PDO::PARAM_INT); // Bind id as integer parameter
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Map status codes to status texts
$statusMappings = [
    0 => 'Pending',
    1 => 'Processing',
    2 => 'Folding',
    3 => 'Ready for Pickup',
    4 => 'Claimed',
    5 => 'Cancelled',

    // Add more mappings as needed
];

// Iterate over the results and add status text based on status code
foreach ($results as &$row) {
    $statusCode = $row['status'];
    $row['status_text'] = isset($statusMappings[$statusCode]) ? $statusMappings[$statusCode] : 'Unknown';
}

// Output JSON-encoded results
if (count($results) == 1) {
    echo json_encode($results[0]);
} else {
    echo json_encode($results);
}
?>
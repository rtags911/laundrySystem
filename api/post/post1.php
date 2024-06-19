<?php
include_once '../../admin/api/function/conn.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
// header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

// Check if the id parameter is provided via POST or getCookie("id")
if (isset($_POST['id'])) {
    $id = $_POST['id'];
} else {
    // Attempt to get id from cookie if not provided in POST
    $id = filter_input(INPUT_COOKIE, 'id', FILTER_SANITIZE_NUMBER_INT);
}

if (!$id) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'ID parameter missing']);
    exit;
}

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
function customStatusSort($a, $b)
{
    $statusOrder = [0, 1, 2, 3, 4, 5]; // Define the order of statuses
    $statusOrderMap = array_flip($statusOrder); // Create a mapping of status to its order

    $aOrder = isset($statusOrderMap[$a['status']]) ? $statusOrderMap[$a['status']] : PHP_INT_MAX;
    $bOrder = isset($statusOrderMap[$b['status']]) ? $statusOrderMap[$b['status']] : PHP_INT_MAX;

    return $aOrder - $bOrder;
}

// Sort results by custom status order
usort($results, 'customStatusSort');

// Iterate over the results and add status text based on status code
foreach ($results as &$row) {
    $statusCode = $row['status'];
    $row['status_text'] = isset($statusMappings[$statusCode]) ? $statusMappings[$statusCode] : 'Unknown';
}

// Output JSON-encoded results as an array, even if there is only one result
echo json_encode($results);

?>
<?php
// Include the database connection file
include_once '../api/function/conn.php';

try {
    // SQL query to fetch data from type_laundry table
    $sql = 'SELECT * FROM type_laundry';

    // Prepare the SQL query
    $stmt = $db->prepare($sql);

    // Execute the SQL query
    $stmt->execute();

    // Fetch all the results as an associative array
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Map status codes to status texts
    $statusMap = [
        0 => 'Not Available',
        1 => 'Available'
    ];

    // Iterate over the results and add status text based on status code
    foreach ($results as &$result) {
        if (isset($result['status_code'])) {
            $result['status_text'] = $statusMap[$result['status_code']] ?? 'Unknown';
        }
    }

    // Set response header to indicate JSON content
    header('Content-Type: application/json');

    // Output JSON-encoded results
    echo json_encode($results);

} catch (PDOException $e) {
    // Handle any PDO exceptions
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Exception $e) {
    // Handle any general exceptions
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
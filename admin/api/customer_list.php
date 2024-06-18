<?php
include_once 'function/conn.php';

$sql = 'SELECT * FROM customers ORDER BY fullname ASC';
$stmt = $db->prepare($sql);
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Ensure each row is correctly formatted
$response = array();
foreach ($results as $row) {
    // Customize the response structure as needed
    $formattedRow = array(
        'id' => $row['id'],
        'fullname' => $row['fullname'],
        'username' => $row['username'],
        'address' => $row['address'],
        'contact' => $row['contact'],
        'created_at' => $row['created_at'], // Assuming created_at exists in your database table
        'photo' => $row['photo'], // Assuming created_at exists in your database table
        // Add more fields if necessary for your DataTables configuration
    );

    $response[] = $formattedRow;
}

// Output the JSON response
echo json_encode(array('data' => $response)); // Wrap the response in 'data' key
?>
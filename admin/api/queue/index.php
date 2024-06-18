<?php
include_once '../function/conn.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read the input data from JSON
    $data = json_decode(file_get_contents('php://input'), true);

    // Check if action is set in the input data
    if (isset($data['action'])) {
        $action = $data['action'];

        if ($action == "statusUp") {
            statusUp($db, $data);
        }
    }
    if (isset($data['action'])) {
        $action = $data['action'];

        if ($action == "type") {
            typeUp($db, $data);
        }
    } else {
        echo json_encode(array("success" => false, "message" => "Action not set"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    removeQueue($db);
}

function statusUp($db, $data)
{
    if (isset($data['id']) && isset($data['status'])) {
        $id = $data['id'];
        $status = $data['status'];

        // Prepare the SQL statement
        $sql = "UPDATE books SET status = ? WHERE id = ?";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([$status, $id]);

        // Check if the update was successful
        if ($result) {
            echo json_encode(array("success" => true, "message" => "Status updated successfully"));
        } else {
            echo json_encode(array("success" => false, "message" => "Failed to update status"));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "Invalid input"));
    }
}
function typeUp($db, $data)
{
    if (isset($data['id']) && isset($data['type'])) {
        $id = $data['id'];
        $type = $data['type'];

        // Prepare the SQL statement
        $sql = "UPDATE books SET type = ? WHERE id = ?";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([$type, $id]);

        // Check if the update was successful
        if ($result) {
            echo json_encode(array("success" => true, "message" => "Type updated successfully"));
        } else {
            echo json_encode(array("success" => false, "message" => "Failed to update Type"));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "Invalid input"));
    }
}

function removeQueue($db)
{
    $input_data = json_decode(file_get_contents("php://input"), true);

    // Check if JSON decoding was successful and if 'data_id' exists
    if ($input_data && isset($input_data['data_id'])) {
        $id = $input_data['data_id'];

        $sql = "UPDATE books SET status = 5  WHERE id = :id";
        $statement = $db->prepare($sql);
        $statement->bindParam(':id', $id);

        if ($statement->execute()) {
            generate_logs($db, 'Cancelling Queue', "$id | Queue was Cancelled");
            echo json_encode(['message' => ' Queue was Cancelled successfully!']);
        } else {
            generate_logs($db, 'Removing Queue', 'Error occurred while cancelling queue');
            http_response_code(500);
            echo json_encode(['message' => 'Something went wrong!']);
        }
    } else {
        // Handle case where 'data_id' is missing or JSON decoding failed
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data format']);
    }
}
?>
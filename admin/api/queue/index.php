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
    }
    if (isset($data['action'])) {
        $action = $data['action'];

        if ($action == "typeStatus") {
            TypeStatus($db, $data);
        }
    }
    if (isset($data['action'])) {
        $action = $data['action'];

        if ($action == "add") {
            addStatus($db, $data);
        }
    } else {


        echo json_encode(array("success" => false, "message" => "Action not set"));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    if (isset($data['action'])) {
        $action = $data['action'];

        if ($action == "laundry") {
            delete($db);
        }
    } else {
        removeQueue($db);
    }




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

function TypeStatus($db, $data)
{
    if (isset($data['id']) && isset($data['stat'])) {
        $id = $data['id'];
        $type = $data['stat'];

        // Prepare the SQL statement
        $sql = "UPDATE type_laundry SET status_type = '$type' WHERE id = '$id'";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([$type, $id]);

        // Check if the update was successful
        if ($result) {
            echo json_encode(array("success" => true, "message" => "Status updated successfully"));
        } else {
            echo json_encode(array("success" => false, "message" => "Failed to update Status"));
        }
    } else {
        echo json_encode(array("success" => false, "message" => "Invalid input"));
    }
}
function addStatus($db, $data)
{
    if (isset($data['laundry']) && !empty($data['laundry'])) {
        $name = $data['laundry'];

        try {
            // Prepare the SQL statement with placeholders
            $sql = "INSERT INTO `type_laundry` (type_name, `status_type`) VALUES (:name, 1)";
            $stmt = $db->prepare($sql);

            // Execute the statement with bound parameters
            $result = $stmt->execute([':name' => $name]);

            // Check if the insert was successful
            if ($result) {
                echo json_encode(array("success" => true, "message" => "Status updated successfully"));
            } else {
                echo json_encode(array("success" => false, "message" => "Failed to update Status"));
            }
        } catch (PDOException $e) {
            // Handle PDO exceptions
            echo json_encode(array("success" => false, "message" => "Database error: " . $e->getMessage()));
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
function delete($db, $data)
{
    $input_data = json_decode(file_get_contents("php://input"), true);

    // Check if JSON decoding was successful and if 'data_id' exists
    if ($input_data && isset($input_data['data_id'])) {
        $id = $input_data['data_id'];

        try {
            // Correct SQL statement
            $sql = "DELETE FROM type_laundry WHERE id = :id";
            $statement = $db->prepare($sql);
            $statement->bindParam(':id', $id, PDO::PARAM_INT);

            if ($statement->execute()) {
                // Ensure generate_logs function exists
                generate_logs($db, 'Laundry Type', "$id | Type was removed");
                echo json_encode(['message' => 'Laundry Type was removed successfully!']);
            } else {
                generate_logs($db, 'Removing Queue', 'Error occurred while removing Laundry Type');
                http_response_code(500);
                echo json_encode(['message' => 'Something went wrong!']);
            }
        } catch (PDOException $e) {
            // Handle PDO exceptions
            generate_logs($db, 'Removing Queue', 'Database error: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        // Handle case where 'data_id' is missing or JSON decoding failed
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data format']);
    }
}


?>
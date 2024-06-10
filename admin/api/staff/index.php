<?php
include_once '../function/conn.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    addAccount($db);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Handle remove customer
    removeAccount($db);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Handle update customer
    updateAccount($db);
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}

function addAccount($db)
{
    $type = $_POST['type'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $repassword = $_POST['re-password'];


    if ($password != $repassword) {
        http_response_code(400);
        echo json_encode(['message' => "The two passwords do not match"]);
        exit;
    }

    $sql = "SELECT * FROM users WHERE username = :username";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->execute();


    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['message' => "$username already exists is already exist"]);
        exit;
    }

    $password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (username, password, level) VALUES (:username, :password, :type)";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $password);
    $stmt->bindParam(':type', $type);
    $stmt->execute();


    generate_logs($db, 'Adding User', "$username | New Account was added");
    echo json_encode(['message' => 'New Account was added successfully']);
}

function removeAccount($db)
{
    $input_data = json_decode(file_get_contents("php://input"), true);

    // Check if JSON decoding was successful and if 'data_id' exists
    if ($input_data) {
        $id = $input_data['data_id'];

        $sql = "DELETE FROM users WHERE id = :id";
        $statement = $db->prepare($sql);
        $statement->bindParam(':id', $id);

        if ($statement->execute()) {
            generate_logs($db, 'Removing Customer', "$id | Staff was removed");
            echo json_encode(['message' => 'Customer removed successfully!']);
        } else {
            generate_logs($db, 'Removing Customer', 'Error occurred while removing customer');
            http_response_code(500);
            echo json_encode(['message' => 'Something went wrong!']);
        }
    } else {
        // Handle case where 'data_id' is missing or JSON decoding failed
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data format']);
    }
}


function updateAccount($db)
{
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data) {

        $id = $data['data_id'];
        $username = $data['username'];
        $password = $data['password'];
        $retypePass = $data['retypePass'];

        if ($password != $retypePass) {
            http_response_code(400);
            echo json_encode(['message' => "Password does not match!"]);
            exit;
        }

        $sql = "UPDATE users SET username = :username, password = :password WHERE id = :id";
        $statement = $db->prepare($sql);
        $statement->bindParam(':username', $username);
        $statement->bindParam(':password', password_hash($password, PASSWORD_DEFAULT));
        $statement->bindParam(':id', $id);
        $statement->execute();


        generate_logs('Update Account', $username . '| Account was updated');
        echo json_encode(['message' => 'Customer was updated successfully']);


    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data format']);
    }


}


?>
<?php
include_once '../function/conn.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    addCustomer($db);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Handle remove customer
    removeCustomer($db);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Handle update customer
    updateCustomer($db);
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}

function addCustomer($db)
{
    $fullname = strtoupper($_POST['firstname'] . ' ' . $_POST['lastname']);
    $address = $_POST['address'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $repassword = $_POST['re-password'];
    $contact = $_POST['contact'];

    if ($password != $repassword) {
        http_response_code(400);
        echo json_encode(['message' => "The two passwords do not match"]);
        exit;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Check if username or contact already exists
    $sql = "SELECT * FROM customers WHERE username = :username OR contact = :contact";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':contact', $contact);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['message' => "$username already exists or contact number is already exist"]);
        exit;
    }

    // Insert new customer
    $sql = "INSERT INTO customers (fullname, username, password, address, contact) VALUES (:fullname, :username, :password, :address, :contact)";
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':fullname', $fullname);
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $passwordHash);
    $stmt->bindParam(':address', $address);
    $stmt->bindParam(':contact', $contact);
    $stmt->execute();

    generate_logs($db, 'Adding Customer', "$fullname | New Customer was added");
    echo json_encode(['message' => 'New customer was added successfully']);
}

function removeCustomer($db)
{
    $input_data = json_decode(file_get_contents("php://input"), true);

    // Check if JSON decoding was successful and if 'data_id' exists
    if ($input_data) {
        $id = $input_data['data_id'];

        $sql = "DELETE FROM customers WHERE id = :id";
        $statement = $db->prepare($sql);
        $statement->bindParam(':id', $id);

        if ($statement->execute()) {
            generate_logs($db, 'Removing Customer', "$id | Customer was removed");
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


function updateCustomer($db)
{
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data) {

        $id = $data['data_id'];
        $fullname = strtoupper($data['firstname'] . ' ' . $data['lastname']);
        $address = $data['address'];
        $contact = $data['contact'];
        $username = $data['username'];

        $sql = "SELECT * FROM customers WHERE username = :username AND id != :id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['message' => "$username already exists"]);
            exit;
        }

        $sql = "UPDATE customers SET fullname = :fullname, username = :username ,address = :address, contact = :contact WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':fullname', $fullname);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':contact', $contact);
        $stmt->bindParam(':id', $id);
        $stmt->execute();

        generate_logs($db, 'Updating Customer', "$fullname | Customer was updated");
        echo json_encode(['message' => 'Customer was updated successfully']);


    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data format']);
    }


}


?>
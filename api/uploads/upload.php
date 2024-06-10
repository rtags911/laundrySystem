<?php
include "../../admin/api/function/conn.php";

header('Content-Type: application/json');

$response = array();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    parse_str(file_get_contents("php://input"), $formData);
    $id = $formData['id'];
    $type = $formData['type'];

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
        $filename = basename($_FILES['photo']['name']);

        if ($type == 'admin') {
            $uploadFileDir = '../../img/admin/';
        } elseif ($type == 'staff') {
            $uploadFileDir = '../../img/staff/';
        } else if ($type == 'customer') {
            $uploadFileDir = '../../img/customer/';
        }

        if (!is_dir($uploadFileDir)) {
            mkdir($uploadFileDir, 0777, true);
        }

        $uploadFile = $uploadFileDir . $filename;

        if (move_uploaded_file($_FILES['photo']['tmp_name'], $uploadFile)) {
            $sql = "UPDATE customers SET photo = '$filename' WHERE id = '$id'";
            if ($conn->query($sql) === TRUE) {
                $response['success'] = true;
                $response['photoUrl'] = $uploadFile;
            } else {
                $response['success'] = false;
                $response['error'] = 'Database error: ' . $conn->error;
            }
        } else {
            $response['success'] = false;
            $response['error'] = 'Failed to move uploaded file.';
        }
    } else {
        $response['success'] = false;
        $response['error'] = 'No photo uploaded or upload error.';
    }
} else {
    $response['success'] = false;
    $response['error'] = 'Invalid request method.';
}

echo json_encode($response);
?>
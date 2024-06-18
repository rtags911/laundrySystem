<?php
include "../../admin/api/function/conn2.php";

header('Content-Type: application/json');

$response = array();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Check if $_POST['id'] and $_POST['level'] are set and not empty
    if (isset($_POST['id']) && isset($_POST['level'])) {
        $id = $_POST['id'];
        $type = $_POST['level'];

        if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
            $filename = basename($_FILES['photo']['name']);
            $file_ext = pathinfo($filename, PATHINFO_EXTENSION);
            $allowed_ext = array('jpg', 'jpeg', 'png', 'gif');

            if (in_array($file_ext, $allowed_ext)) {
                if ($type == '0') {
                    $uploadFileDir = '../../img/admin/';
                } elseif ($type == '1') {
                    $uploadFileDir = '../../img/staff/';
                } elseif ($type == '2') {
                    $uploadFileDir = '../../img/customer/';
                } else {
                    $response['success'] = false;
                    $response['error'] = 'Invalid user type.';
                    echo json_encode($response);
                    exit;
                }

                if (!is_dir($uploadFileDir)) {
                    mkdir($uploadFileDir, 0777, true);
                }

                $uploadFile = $uploadFileDir . $filename;

                if (move_uploaded_file($_FILES['photo']['tmp_name'], $uploadFile)) {
                    if ($type != 2) {
                        $sql = "UPDATE users SET photo = ? WHERE id = ?";
                    } else {
                        $sql = "UPDATE customers SET photo = ? WHERE id = ?";
                    }


                    $stmt = $db->prepare($sql);
                    $stmt->bind_param('si', $filename, $id);

                    if ($stmt->execute()) {
                        $response['success'] = true;
                        $response['photoUrl'] = $uploadFile;
                    } else {
                        $response['success'] = false;
                        $response['error'] = 'Database error: ' . $stmt->error;
                    }

                    $stmt->close();
                } else {
                    $response['success'] = false;
                    $response['error'] = 'Failed to move uploaded file.';
                }
            } else {
                $response['success'] = false;
                $response['error'] = 'Invalid file type. Only JPG, JPEG, PNG, and GIF files are allowed.';
            }
        } else {
            $response['success'] = false;
            $response['error'] = 'No photo uploaded or upload error.';
        }
    } else {
        $response['success'] = false;
        $response['error'] = 'Invalid ID or user type.';
    }
} else {
    $response['success'] = false;
    $response['error'] = 'Invalid request method.';
}

echo json_encode($response);
?>
<?php
include_once '../../admin/api/function/conn.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods:GET, POST,DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'];

    if ($action === 'login') {
        login($db);
    } elseif ($action === 'register') {
        register($db);
    } elseif ($action === 'book') {
        book($db);
    } elseif ($action === 'profile') {
        profile($db);
    } elseif ($action === 'admin') {
        profileAD($db);
    }



} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    user($db);
} elseif ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    updateProf($db);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    remove($db);
}


function profileAD($db)
{
    $id = $_POST['id'];
    $sql = 'SELECT * FROM users WHERE id = :id ORDER BY username ASC';
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results); // Return the profile data as JSON
}


function remove($db)
{
    $input_data = json_decode(file_get_contents("php://input"), true);

    // Check if JSON decoding was successful and if 'data_id' exists
    if ($input_data) {
        $id = $input_data['data_id'];

        $sql = "UPDATE books SET status = 5 WHERE id = :id";
        $statement = $db->prepare($sql);
        $statement->bindParam(':id', $id);

        if ($statement->execute()) {

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



function updateProf($db)
{

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if ($data) {

        $id = $data['id'];
        $fullname = strtoupper($data['firstname'] . ' ' . $data['lastname']);
        $address = $data['address'];
        $contact = $data['contact'];

        $sql = "UPDATE customers SET fullname = :fullname,address = :address, contact = :contact WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':fullname', $fullname);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':contact', $contact);
        $stmt->bindParam(':id', $id);
        $stmt->execute();


        echo json_encode(['success' => true, 'message' => 'Customer was updated successfully']);


    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid data format']);
    }

}


function profile($db)
{
    $id = $_POST['id'];
    $sql = 'SELECT * FROM customers WHERE id = :id ORDER BY fullname ASC';
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results); // Return the profile data as JSON
}


function user($db)
{
    $id = $_GET['userID'];
    if (!$id) {
        http_response_code(401);
        echo json_encode(array("message" => "No ID being transferred"));
        exit;
    }

    $sql = 'SELECT * FROM customers WHERE id = :id';
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $results = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($results) {
        echo json_encode($results);
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "User not found"));
    }
}


function book($db)
{
    // Check if userID is set
    if (!isset($_POST['userID'])) {
        http_response_code(401);
        echo json_encode(array("message" => "Not authenticated"));
        exit;
    }

    // Retrieve data from POST request
    $customer_id = $_POST['userID'];

    $kilo = $_POST['kilo'];
    $pickup_or_delivery = $_POST['pickup_or_delivery'];
    $contact = $_POST['contact'];
    $typeOfWash = $_POST['typeOfWash'];
    $address = $_POST['address'];
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $date = $_POST['booked'];

    // Concatenate first name and last name
    $name = $firstname . ' ' . $lastname;

    // Calculate total cost
    $basePrice = 150;
    $additionalKiloRate = 25;
    $cost = $kilo <= 5 ? $basePrice : $basePrice + ($kilo - 5) * $additionalKiloRate;

    // Generate a unique transaction ID
    $laundry_id = 'laundry_' . substr(md5(uniqid(mt_rand(), true)), 0, 3);

    // Set initial status to '0' (pending)
    $status = '0';

    // Prepare and execute the SQL query
    $sql = "INSERT INTO books (customer_id, transaction_id, kilo, total, pickup_or_delivery, type, contact, address, name, status, created_at, date_booked) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW() ? )";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([$customer_id, $laundry_id, $kilo, $cost, $pickup_or_delivery, $typeOfWash, $contact, $address, $name, $status, $date]);

    // Check if the query was successful
    if ($result) {
        http_response_code(201); // Created
        echo json_encode(array("success" => true, "message" => "Booking created successfully", "laundry_id" => $laundry_id));
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(array("message" => "Booking failed"));
    }
}


function login($db)
{
    // Get the form data
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Check if the customer exists
    $sql = "SELECT * FROM customers WHERE username = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$username]);
    $customer = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($customer && password_verify($password, $customer['password'])) {
        // Return customer information with default level
        http_response_code(200);
        echo json_encode(
            array(
                "success" => true,
                "username" => $customer['username'],
                "id" => $customer['id'],
                "level" => 2, // Default level
                "message" => "Login successful"
            )
        );
    } else {
        // Check if the user exists in the 'users' table
        $sql = "SELECT * FROM users WHERE username = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            // Save user information to the session
            $_SESSION['id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['level'] = $user['level'];

            // Return user information as JSON response
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "username" => $user['username'],
                "id" => $user['id'],
                "level" => $user['level'],
                "message" => "Login successful"
            ]);
            generate_logs($db, 'Logging Admin', "{$_SESSION['username']} | Admin was logged in successfully");
        } else {
            // Return error message for invalid credentials
            http_response_code(401);
            echo json_encode(["message" => "Wrong username or password"]);
        }
    }
}


function register($db)
{
    // Get the form data
    $firstname = $_POST['first_name'];
    $lastname = $_POST['last_name'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    $address = $_POST['address'];
    $contact = $_POST['contact'];

    // Combine first name and last name to form full name
    $fullname = strtoupper($firstname . ' ' . $lastname);

    // Check if the username already exists
    $sql = "SELECT * FROM customers WHERE username = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$username]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingUser) {
        // Return error message
        http_response_code(409); // Conflict
        echo json_encode(array("message" => "Username already taken"));
        return;
    }

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert the new customer
    $sql = "INSERT INTO customers (fullname, address, contact, username, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([$fullname, $address, $contact, $username, $hashedPassword]);

    if ($result) {
        // Return success message
        http_response_code(201);
        echo json_encode(array('success' => true, "message" => "Registration successful"));
    } else {
        // Return error message
        http_response_code(500); // Internal Server Error
        echo json_encode(array('success' => false, "message" => "Registration failed"));
    }
}
?>
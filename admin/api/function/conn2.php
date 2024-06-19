<?php
// $host = 'localhost';
// $dbname = 'u663034616_laundry';
// $username = 'u663034616_laundry';
// $password = 'D1h41pesgx911!';

$host = 'localhost';
$dbname = 'lms_db';
$username = 'root';
$password = '';



$db = new mysqli($host, $dbname, $password, $dbname);
if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

?>
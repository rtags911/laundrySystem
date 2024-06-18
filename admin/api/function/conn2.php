<?php
$host = 'localhost';
$dbname = 'lms_db';
$username = 'root';
$password = '';



$db = new mysqli('localhost', 'root', '', 'lms_db');
if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

?>
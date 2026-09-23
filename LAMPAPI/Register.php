<?php

// Load shared database 
require_once __DIR__ . '/db.php';

// Read JSON request body
$inData = getRequestInfo();

// Get registration information
$firstName = trim($inData["firstName"] ?? "");
$lastName  = trim($inData["lastName"] ?? "");
$login     = trim($inData["login"] ?? "");
$password  = $inData["password"] ?? "";

// Validate required login and password fields
if ($login === "" || $password === "") {
    sendResultInfoAsJson([
        "id" => -1,
        "error" => "Login and password are required"
    ]);
}

try {
    // Connect to the database
    $conn = getDbConnection();

    // Check whether the username already exists
    $stmt = $conn->prepare(
        "SELECT ID FROM Users WHERE Login = ? LIMIT 1"
    );

    $stmt->bind_param("s", $login);
    $stmt->execute();

    $result = $stmt->get_result();

    // Return an error if the username is already taken
    if ($result->num_rows > 0) {
        $stmt->close();
        $conn->close();

        sendResultInfoAsJson([
            "id" => -1,
            "error" => "Username already taken"
        ]);
    }

    $stmt->close();

    // Insert the new user using a prepared statement
    $stmt = $conn->prepare(
        "INSERT INTO Users (FirstName, LastName, Login, Password)
         VALUES (?, ?, ?, ?)"
    );

    $stmt->bind_param(
        "ssss",
        $firstName,
        $lastName,
        $login,
        $password
    );

    $stmt->execute();

    // Get the ID of the newly created user
    $userId = $conn->insert_id;

    // Close database resources
    $stmt->close();
    $conn->close();

    // Return the new user ID
    sendResultInfoAsJson([
        "id" => $userId,
        "error" => ""
    ]);

} catch (Throwable $e) {
    // Return a generic database error
    sendResultInfoAsJson([
        "id" => -1,
        "error" => "Database error"
    ], 500);
}
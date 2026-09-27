<?php

// Load shared database
require_once __DIR__ . '/db.php';

// Read JSON request body
$inData = getRequestInfo();

// Get contact information
$firstName = trim($inData["firstName"] ?? "");
$lastName  = trim($inData["lastName"] ?? "");
$phone     = trim($inData["phone"] ?? "");
$email     = trim($inData["email"] ?? "");
$userId    = (int)($inData["userId"] ?? 0);

// Validate user ID
if ($userId <= 0) {
    sendResultInfoAsJson([
        "error" => "Invalid user ID"
    ]);
}

// Validate that at least first or last name is provided
if ($firstName === "" && $lastName === "") {
    sendResultInfoAsJson([
        "error" => "First name or last name is required"
    ]);
}

try {
    // Connect to the database
    $conn = getDbConnection();

    // Insert the new contact 
    $stmt = $conn->prepare(
        "INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID)
         VALUES (?, ?, ?, ?, ?)"
    );

    // Bind contact information 
    $stmt->bind_param(
        "ssssi",
        $firstName,
        $lastName,
        $phone,
        $email,
        $userId
    );

    // Execute the insert
    $stmt->execute();

    // Close database resources
    $stmt->close();
    $conn->close();

    // Return success
    sendResultInfoAsJson([
        "error" => ""
    ]);

} catch (Throwable $e) {
    // Return a generic database error
    sendResultInfoAsJson([
        "error" => "Database error"
    ], 500);
}
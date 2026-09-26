<?php

// Load shared database
require_once __DIR__ . '/db.php';

// Read JSON request body
$inData = getRequestInfo();

// Get contact information
$contactId = (int)($inData["contactId"] ?? 0);
$firstName = trim($inData["firstName"] ?? "");
$lastName  = trim($inData["lastName"] ?? "");
$phone     = trim($inData["phone"] ?? "");
$email     = trim($inData["email"] ?? "");
$userId    = (int)($inData["userId"] ?? 0);

// Validate contact ID and user ID
if ($contactId <= 0 || $userId <= 0) {
    sendResultInfoAsJson([
        "error" => "Invalid contact ID or user ID"
    ]);
}

try {
    // Connect to the database
    $conn = getDbConnection();

    // Update the contact 
    $stmt = $conn->prepare(
        "UPDATE Contacts SET FirstName=?, LastName=?, Phone=?, Email=? WHERE ID=? AND UserID=?"
    );

    // Bind contact information
    $stmt->bind_param(
        "ssssii",
        $firstName,
        $lastName,
        $phone,
        $email,
        $contactId,
        $userId
    );

    // Execute the update
    $stmt->execute();

    // Close database resources
    $stmt->close();
    $conn->close();

    // Return success
    sendResultInfoAsJson([
        "error" => ""
    ]);

} catch (Throwable $e) {
    sendResultInfoAsJson([
        "error" => "Database error"
    ], 500);
}
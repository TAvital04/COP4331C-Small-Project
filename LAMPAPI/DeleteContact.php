<?php

// Load shared database
require_once __DIR__ . '/db.php';

// Read JSON request body
$inData = getRequestInfo();

// Get contact information
$contactId = (int)($inData["contactId"] ?? 0);
$userId    = (int)($inData["userId"] ?? 0);

try {
    // Connect to the database
    $conn = getDbConnection();

    // Delete the contact 
    $stmt = $conn->prepare(
        "DELETE FROM Contacts WHERE ID=? AND UserID=?"
    );

    // Bind contact ID and user ID
    $stmt->bind_param(
        "ii",
        $contactId,
        $userId
    );

    // Execute the delete
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
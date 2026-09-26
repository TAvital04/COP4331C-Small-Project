<?php
header("Content-Type: application/json");

require_once __DIR__ . "/db.php";

$inData = getRequestInfo();

$searchQuery = $inData["search"] ?? "";
$userId = intval($inData["userId"] ?? 0);

if ($userId <= 0) {
    echo json_encode([
        "results" => [],
        "error" => "Invalid user ID"
    ]);
    exit();
}

$conn = getDbConnection();
if ($conn->connect_error) {
    echo json_encode([
        "results" => [],
        "error" => $conn->connect_error
    ]);
    exit();
}

$search = "%" . $searchQuery . "%";

$stmt = $conn->prepare(
    "SELECT ID, FirstName, LastName, Phone, Email
     FROM Contacts
     WHERE (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR Email LIKE ?)
       AND UserID=?
     ORDER BY FirstName ASC, LastName ASC"
);
$stmt->bind_param("ssssi", $search, $search, $search, $search, $userId);
$stmt->execute();
$result = $stmt->get_result();

$results = [];
while ($row = $result->fetch_assoc()) {
    $results[] = [
        "ID" => $row["ID"],
        "FirstName" => $row["FirstName"],
        "LastName" => $row["LastName"],
        "Phone" => $row["Phone"],
        "Email" => $row["Email"]
    ];
}

echo json_encode([
    "results" => $results,
    "error" => ""
]);

$stmt->close();
$conn->close();
?>

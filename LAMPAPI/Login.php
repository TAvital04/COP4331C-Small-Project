<?php
header("Content-Type: application/json");

require_once __DIR__ . "/db.php";

$inData = getRequestInfo();

$login = $inData["login"] ?? "";
$password = $inData["password"] ?? "";

$conn = getDbConnection();
if ($conn->connect_error) {
    echo json_encode([
        "id" => 0,
        "firstName" => "",
        "lastName" => "",
        "error" => $conn->connect_error
    ]);
    exit();
}

$stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Login=? AND Password=?");
$stmt->bind_param("ss", $login, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "id" => $row["ID"],
        "firstName" => $row["FirstName"],
        "lastName" => $row["LastName"],
        "error" => ""
    ]);
} else {
    echo json_encode([
        "id" => 0,
        "firstName" => "",
        "lastName" => "",
        "error" => "No Records Found"
    ]);
}

$stmt->close();
$conn->close();
?>

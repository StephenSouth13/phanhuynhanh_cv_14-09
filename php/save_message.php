<?php
// Lưu tin nhắn vào DB
if (isset($_POST['name']) && isset($_POST['email']) && isset($_POST['message'])) {
  $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, NOW())");
  $stmt->bind_param("sss", $_POST['name'], $_POST['email'], $_POST['message']);
  $stmt->execute();
  $stmt->close();
}
?>

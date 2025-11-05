<?php
include '../includes/config.php';
include 'save_message.php'; // gọi lưu DB

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $name = htmlspecialchars($_POST["name"]);
  $email = htmlspecialchars($_POST["email"]);
  $message = htmlspecialchars($_POST["message"]);

  $subject = "Tin nhắn mới từ $name";
  $body = "Tên: $name\nEmail: $email\n\nNội dung:\n$message";

  if (mail($admin_email, $subject, $body)) {
    echo "<script>alert('✅ Cảm ơn $name! Tin nhắn đã gửi thành công.'); window.location.href='../index.php';</script>";
  } else {
    echo "<script>alert('❌ Gửi thất bại! Vui lòng thử lại sau.'); window.history.back();</script>";
  }
}
?>

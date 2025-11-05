<?php include '../includes/config.php'; ?>
<?php include '../includes/header.php'; ?>

<h2>📨 Danh sách tin nhắn liên hệ</h2>
<table border="1" cellpadding="10" cellspacing="0">
  <tr>
    <th>ID</th>
    <th>Tên</th>
    <th>Email</th>
    <th>Nội dung</th>
    <th>Ngày gửi</th>
  </tr>

  <?php
  $result = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
  if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
      echo "<tr>
              <td>{$row['id']}</td>
              <td>{$row['name']}</td>
              <td>{$row['email']}</td>
              <td>{$row['message']}</td>
              <td>{$row['created_at']}</td>
            </tr>";
    }
  } else {
    echo "<tr><td colspan='5'>Chưa có tin nhắn nào</td></tr>";
  }
  ?>
</table>

<?php include '../includes/footer.php'; ?>

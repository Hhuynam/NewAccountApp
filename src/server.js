const express = require('express');
const path = require('path');
const { SePayPgClient } = require('sepay-pg-node');
const db = require('./db'); // import db từ file riêng

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Khởi tạo client SePay với sandbox
const client = new SePayPgClient({
  env: 'sandbox',
  merchant_id: 'SP-TEST-HH266BA9',
  secret_key: 'spsk_test_hbvMbAvpA1z7g6he5h2ooX6Rjfgppkbb'
});

// Route thanh toán sản phẩm đơn lẻ
app.get('/api/pay', (req, res) => {
  const amount = req.query.amount || 10000;
  const orderId = 'DH' + Date.now();

  const checkoutURL = client.checkout.initCheckoutUrl();
  const checkoutFormfields = client.checkout.initOneTimePaymentFields({
    payment_method: 'BANK_TRANSFER',
    order_invoice_number: orderId,
    order_amount: amount,
    currency: 'VND',
    order_description: 'Thanh toan don hang ' + orderId,
    success_url: 'http://localhost:3000/success.html',
    error_url: 'http://localhost:3000/error.html',
    cancel_url: 'http://localhost:3000/cancel.html',
  });

  res.json({ checkoutURL, checkoutFormfields });
});

// Route đăng ký gói cước
app.post('/api/subscribe', (req, res) => {
  const { username, plan, amount } = req.body;
  const orderId = 'SUB' + Date.now();

  db.run(
    `INSERT INTO accounts (username, plan, amount, status, order_id) VALUES (?, ?, ?, ?, ?)`,
    [username, plan, amount, 'pending', orderId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const checkoutURL = client.checkout.initCheckoutUrl();
      const checkoutFormfields = client.checkout.initOneTimePaymentFields({
        payment_method: 'BANK_TRANSFER',
        order_invoice_number: orderId,
        order_amount: amount,
        currency: 'VND',
        order_description: `Đăng ký gói ${plan} cho ${username}`,
        success_url: 'http://localhost:3000/success.html',
        error_url: 'http://localhost:3000/error.html',
        cancel_url: 'http://localhost:3000/cancel.html',
      });

      res.json({ checkoutURL, checkoutFormfields });
    }
  );
});

// Route lấy danh sách tài khoản
app.get('/api/accounts', (req, res) => {
  db.all(`SELECT * FROM accounts ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Route cập nhật trạng thái thanh toán
app.post('/api/updateStatus', (req, res) => {
  const { orderId, status } = req.body;
  db.run(
    `UPDATE accounts SET status = ? WHERE order_id = ?`,
    [status, orderId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: `Order ${orderId} updated to ${status}` });
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy ở http://localhost:${PORT}`);
});
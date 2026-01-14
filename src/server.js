const express = require('express');
const path = require('path');
const { SePayPgClient } = require('sepay-pg-node');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Khởi tạo client SePay với sandbox
const client = new SePayPgClient({
  env: 'sandbox',
  merchant_id: 'SP-TEST-HH266BA9',
  secret_key: 'spsk_test_hbvMbAvpA1z7g6he5h2ooX6Rjfgppkbb'
});

// Bộ nhớ tạm để lưu accounts
let accounts = [];

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

  // Lưu vào mảng thay vì DB
  accounts.push({
    id: accounts.length + 1,
    username,
    plan,
    amount,
    status: 'pending',
    order_id: orderId,
    created_at: new Date()
  });

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
});

// Route lấy danh sách tài khoản
app.get('/api/accounts', (req, res) => {
  res.json(accounts);
});

// Route cập nhật trạng thái thanh toán
app.post('/api/updateStatus', (req, res) => {
  const { orderId, status } = req.body;
  accounts = accounts.map(acc =>
    acc.order_id === orderId ? { ...acc, status } : acc
  );
  res.json({ message: `Order ${orderId} updated to ${status}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy ở http://localhost:${PORT}`);
});
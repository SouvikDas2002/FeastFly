const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const statusLabels = {
  order_placed: 'Order Placed',
  order_confirmed: 'Order Confirmed',
  order_prepared: 'Preparation Started',
  out_for_delivery: 'Out for Delivery',
  completed: 'Delivered',
};

async function sendOtp(to, otp) {
  await transporter.sendMail({
    from: `"FeastFly" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your FeastFly verification code',
    html: `
            <div style="font-family:sans-serif;max-width:400px;margin:auto">
                <h2 style="color:#FE5F1E">FeastFly</h2>
                <p>Your one-time verification code is:</p>
                <h1 style="letter-spacing:8px;color:#2d3748">${otp}</h1>
                <p style="color:#718096;font-size:13px">This code expires in 10 minutes. Do not share it with anyone.</p>
            </div>
        `,
  });
}

async function sendOrderConfirmation(to, order) {
  const itemLines = Object.values(order.items)
    .map(
      ({ item, qty }) => `<li>${item.name} &times; ${qty} &mdash; &#8377;${item.price * qty}</li>`
    )
    .join('');
  await transporter.sendMail({
    from: `"FeastFly" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your FeastFly order is confirmed! 🎉',
    html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;color:#232323">
                <h2 style="color:#FE5F1E">FeastFly</h2>
                <h3>Order Confirmed!</h3>
                <p>Your order <strong>#${order._id}</strong> has been placed successfully.</p>
                <ul style="line-height:2">${itemLines}</ul>
                <p><strong>Total:</strong> &#8377;${order.totalAmount || ''}</p>
                <p><strong>Delivery to:</strong> ${order.address}</p>
                <p style="color:#718096;font-size:13px">We'll notify you as your order progresses.</p>
            </div>
        `,
  });
}

async function sendOrderStatusUpdate(to, order, newStatus) {
  const label = statusLabels[newStatus] || newStatus;
  await transporter.sendMail({
    from: `"FeastFly" <${process.env.MAIL_USER}>`,
    to,
    subject: `FeastFly Order Update: ${label}`,
    html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;color:#232323">
                <h2 style="color:#FE5F1E">FeastFly</h2>
                <h3>Your order status has been updated</h3>
                <p>Order <strong>#${order._id}</strong> is now:
                   <strong style="color:#FE5F1E">${label}</strong></p>
                <p><strong>Delivery to:</strong> ${order.address}</p>
                <p style="color:#718096;font-size:13px">Thank you for ordering with FeastFly!</p>
            </div>
        `,
  });
}

module.exports = { sendOtp, sendOrderConfirmation, sendOrderStatusUpdate };

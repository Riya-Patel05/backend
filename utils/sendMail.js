const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"EventHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Password Reset",
    html: `<p>Your OTP is: <b>${otp}</b>. It will expire in 10 minutes.</p>`
  });
};

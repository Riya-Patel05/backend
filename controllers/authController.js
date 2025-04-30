const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../utils/jwt');
const { sendOTP } = require('../utils/sendMail');

const prisma = new PrismaClient();

// Sign Up
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role }
  });
  const token = generateToken(user);
  res.status(201).json({ token, user });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Wrong password' });
  const token = generateToken(user);
  res.json({ token, user });
};

// Forgot Password - Generate OTP
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { email },
    data: { otp, otpExpiry: expiry }
  });

  await sendOTP(email, otp);
  res.json({ message: 'OTP sent to email' });
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.otp !== otp || new Date() > user.otpExpiry) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  res.json({ message: 'OTP verified' });
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, newPassword, otp } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.otp !== otp || new Date() > user.otpExpiry) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashed, otp: null, otpExpiry: null }
  });

  res.json({ message: 'Password reset successful' });
};

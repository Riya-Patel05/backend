const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.post('/api/signup', async (req, res) => {
  const { username, email, password, contactNumber } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, contactNumber },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

  res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
});


function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "Email not registered" });

  const otp = generateOTP();

  await prisma.passwordReset.create({ data: { email, otp } });

  console.log("OTP:", otp);

  res.json({ message: "OTP generated", otp }); 
});

app.post('/api/verify-otp', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const record = await prisma.passwordReset.findFirst({
    where: { email, otp },
    orderBy: { createdAt: 'desc' }
  });

  if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

  await prisma.passwordReset.deleteMany({ where: { email } });

  res.json({ message: "Password updated successfully" });
});

app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.use('/api', eventRoutes);

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

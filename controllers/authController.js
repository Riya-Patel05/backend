
const conn = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.signup = (req, res) => {
  const { name, password, confirmPassword, email, contact } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (name, password, email, contact) VALUES (?, ?, ?, ?)';

  conn.query(sql, [name, hashed, email, contact], (err) => {
    if (err) {
      return res.status(400).json({ error: 'Email already exists or input error' });
    }
    res.json({ message: 'Signup successful' });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  conn.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = results[0];
    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        contact: user.contact
      }
    });
  });
};

exports.getUserData = (req, res) => {
  const userId = req.params.id;

  conn.query('SELECT id, name, email, contact FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Respond with user data
    res.json({
      id: results[0].id,
      name: results[0].name,
      email: results[0].email,
      contact: results[0].contact
    });
  });
};
 
// POST /api/auth/forgot-password
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  // 1. Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Set expiry (e.g., 1 hour from now)
  const expiry = new Date(Date.now() + 60*60*1000); // 60 minutes

  // 3. Store OTP & expiry in DB
  const sql = 'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?';
  conn.query(sql, [otp, expiry, email], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Email not found' });

    // 4. (In production) send OTP via email or SMS here.
    console.log(`OTP for ${email}: ${otp}`);  // for testing in console

    res.json({ message: 'OTP sent (check console in dev)' });
  });
};

// POST /api/auth/verify-otp
exports.verifyOtp = (req, res) => {
  const { email, otp, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // 1. Fetch stored OTP & expiry
  conn.query(
    'SELECT otp, otp_expiry FROM users WHERE email = ?',
    [email],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (results.length === 0) return res.status(404).json({ error: 'Email not found' });

      const { otp: storedOtp, otp_expiry } = results[0];
      const now = new Date();

      if (!storedOtp || now > otp_expiry) {
        return res.status(400).json({ error: 'OTP expired or not requested' });
      }
      if (storedOtp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      // 2. Hash new password
      const hashed = bcrypt.hashSync(newPassword, 10);

      // 3. Update password & clear OTP fields
      const sql = `
        UPDATE users
        SET password = ?, otp = NULL, otp_expiry = NULL
        WHERE email = ?
      `;
      conn.query(sql, [hashed, email], (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ message: 'Password reset successful' });
      });
    }
  );
};



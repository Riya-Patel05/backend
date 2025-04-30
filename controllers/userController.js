const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser } = require('../models/user');

const signup = (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    createUser(name, email, hashedPassword, role, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error creating user' });
        }
        const token = jwt.sign({ id: result.insertId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    });
};

module.exports = { signup };

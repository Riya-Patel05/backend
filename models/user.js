const db = require('../config/db');

const createUser = (name, email, password, role, callback) => {
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(query, [name, email, password, role], callback);
};

module.exports = { createUser };

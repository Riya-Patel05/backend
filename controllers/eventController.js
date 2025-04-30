const db = require('../db');

exports.createEvent = (req, res) => {
    console.log('[eventController] – createEvent called with body:', req.body);
  };
  exports.createEvent = (req, res) => {
    const { user_id, name, date, location, budget, description } = req.body;
  
    const query = `
      INSERT INTO events
        (user_id, name, date, location, budget, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [user_id, name, date, location, budget, description];
  
    db.query(query, values, (err, result) => {
      if (err) {
        // Log full error object
        console.error('CREATE EVENT MySQL Error:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Event created', event_id: result.insertId });
    });
  };
  
exports.getAllEvents = (req, res) => {
    const sql = 'SELECT * FROM events';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching events:', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ events: results });
    });
  };
  
  exports.getEventById = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM events WHERE id = ?';
  
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error('MySQL Error:', err);  // Log the full error object
        return res.status(500).json({ error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      res.json({ event: results[0] });
    });
  };
  
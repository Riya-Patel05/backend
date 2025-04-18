const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  category: String
});

module.exports = mongoose.model('Event', eventSchema);

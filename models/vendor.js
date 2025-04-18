const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: String,
  type: String,
  image: String,
  details: String
});

module.exports = mongoose.model('Vendor', vendorSchema);

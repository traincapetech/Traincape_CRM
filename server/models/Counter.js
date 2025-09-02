const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  seq: {
    type: Number,
    required: true,
    default: 0
  },
}, { timestamps: true });

module.exports = mongoose.model('Counter', CounterSchema);



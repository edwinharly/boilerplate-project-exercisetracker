const mongoose = require('mongoose')
const Schema = mongoose.Schema

const exerciseSchema = new Schema({
    user: { type: String, ref: 'User' },
    description: String,
    duration: Number,
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exercise', exerciseSchema);
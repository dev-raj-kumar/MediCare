const mongoose = require('mongoose');
const appointmentA = require('./appointment');

const appointmentSchema = appointmentA.appointmentSchema;

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    appointments: [appointmentSchema],
    noBookTill: {type: Date, default: Date.now},
    role: {type: String, default: 'user'},
}, {timestamps: true});

module.exports = {
    User : mongoose.model('User', userSchema),
    userSchema : userSchema
}
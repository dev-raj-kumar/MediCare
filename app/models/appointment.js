const mongoose = require('mongoose');
const userA = require('./user');
const User = userA.User;
const userSchema = userA.userSchema;

const appointmentSchema = new mongoose.Schema({
    patientName: String,
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    hospital: String,
    department: String,
    doctor: String,
    note: String,
    price: Number,
    choiceDate: {type: Date},
    timeL: {
        type: Date
    },
    timeR: {
        type: Date
    },
    status:{
        type: Number,
        default: 0
    }
});
module.exports = {
    Appointment : mongoose.model('Appointment', appointmentSchema),
    appointmentSchema : appointmentSchema
}
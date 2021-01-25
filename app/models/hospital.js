const mongoose = require('mongoose');
const departmentA = require('./department');
const appointmentA = require('./appointment');

const departmentSchema = departmentA.departmentSchema;
const appointmentSchema = appointmentA.appointmentSchema;

const hospitalSchema = new mongoose.Schema({
    name: {type: String, required: true},
    phone: String,
    email: String,
    about: String,
    pastAppointment: [appointmentSchema],
    requestedAppointment: [appointmentSchema],
    confirmedAppointment: [appointmentSchema],
    departments: [departmentSchema]
});

module.exports = {
    Hospital : mongoose.model('Hospital', hospitalSchema),
    hospitalSchema : hospitalSchema
}
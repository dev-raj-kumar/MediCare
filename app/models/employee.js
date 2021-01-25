const mongoose = require('mongoose');
const hospitalA = require('../models/hospital');

const Hospital = hospitalA.Hospital;

const employeeSchema = new mongoose.Schema({
    name: String,
    email: {type: String, required: true, unique: true},
    password: {type: String},
    hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: 'Hospital'},
    role: {type: String},
    type: {type: Number}
})

module.exports = {
    employeeSchema: employeeSchema,
    Employee : mongoose.model('Employee', employeeSchema)
}
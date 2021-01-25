const mongoose = require('mongoose');
const doctorA = require('./doctor');
const hospitalA = require('./hospital');

const Hospital = hospitalA.Hospital;

const doctorSchema = doctorA.doctorSchema;

const departmentSchema = new mongoose.Schema({
    name: String,
    note: String,
    hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: 'Hospital'},
    price: Number,
    img: [],
    doctors: [doctorSchema]
})

module.exports = {
    Department : mongoose.model('Department', departmentSchema),
    departmentSchema : departmentSchema
}
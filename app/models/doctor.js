const mongoose = require('mongoose');
const departmentA = require('./department');

const departmentSchema = departmentA.departmentSchema;

const doctorSchema = new mongoose.Schema({
    name: String,
    department: String,
    degree: String,
    note: String,
    img: [],
    experience: String
})

module.exports = {
    Doctor : mongoose.model('Doctor', doctorSchema),
    doctorSchema: doctorSchema
}
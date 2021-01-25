const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//Storage config

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
 
module.exports = multer({ storage: storage, limits : {fileSize : 2000000} });

// var upload =
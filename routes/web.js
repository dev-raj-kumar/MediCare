const fs = require('fs');
const path = require('path');

const authController = require('../app/http/controllers/authController');
const appointController = require('../app/http/controllers/user/appointController');
const hospitalA = require('../app/models/hospital');
const appointmentA = require('../app/models/appointment');
const departmentA = require('../app/models/department');
const userA = require('../app/models/user');
const employeeA = require('../app/models/employee');
const doctorA = require('../app/models/doctor');
// import Noty from 'noty';

const Hospital = hospitalA.Hospital;
const Doctor = doctorA.Doctor;
const Appointment = appointmentA.Appointment;
const User = userA.User;
const Department = departmentA.Department;
const Employee = employeeA.Employee;
const upload = require('../app/config/multerStorage');

//Middlewares
const guest = require('../app/http/middlewares/guest');
const auth = require('../app/http/middlewares/auth');
const passport = require('passport');
// const { User } = require('../app/models/user');

function initRoute(app) {
    app.get('/', (req, res) => {
        res.render('home1');
    });

    app.get('/login', guest, authController().login)

    app.post('/login', authController().postLogin)

    app.get('/about', (req,res)=>{
      res.render('about');
    })

    app.get('/employeeLogin', guest, authController().employeeLogin);

    app.post('/employeeLogin', authController().postemployeeLogin);

    app.get('/register', guest, authController().register)

    app.post('/register', authController().postRegister)

    app.post('/logout', authController().logout);

    app.post('/employeeLogout', authController().employeeLogout);

    app.get('/allHospitals', async (req, res) => {
        const hospitals = await Hospital.find({});
        console.log(hospitals);
        res.json({ hospitals: JSON.stringify(Object.assign({}, hospitals)) });
    });

    app.post('/hos', async (req, res) => {
        const hospitalName = req.body.hospitalName;
        const hospital = await Hospital.find({ name: hospitalName });
        res.render('hospital', { hospital: hospital });
        // console.log(hospital ,hospital[0].departments);
    });

    app.post('/department', (req, res) => {
        const department = req.body.department;
        console.log(department);
        res.render('department', { department: department });
    })

    app.post('/bookAppointment', auth, (req, res) => {
        const department = req.body.department;
        res.render('user/patientDetails', { department: department });
    })

    app.post('/patientDetails', async (req, res) => {
    
        let { name, email, age, date, problems, address, department } = req.body;

        department = JSON.parse(department);
        const hospital = await Hospital.findById(department.hospitalId);
        const newAppointment = new Appointment({
            patientName: name,
            userId: req.user._id,
            hospital: hospital.name,
            department: department.name,
            price: department.price,
            choiceDate: date
        });
        newAppointment.save();
        Hospital.updateOne({ _id: hospital._id }, { '$push': { 'requestedAppointment': newAppointment } }, (err) => {
            if (err) {
                console.log('Error updating newAppointemnt to hospital');
            }
        });

        User.updateOne({ _id: req.user._id }, { '$push': { 'appointments': newAppointment } }, (err) => {
            if (err) {
                console.log('Error updating newAppointment to User');
            }
            res.redirect('/userAppointments');
        });

    })

    app.get('/userAppointments', auth, appointController().index);

    // Appointment cancelation request from the PATIENT

    app.post("/cancelPAppDone", function (req, res) {
        const hosName = req.body.hos;
        const id = req.body.id;

        User.updateOne({_id: req.user._id}, {'$pull': {'appointments': { '_id': id}}}, (err)=>{
            if(err){
                console.log(err);
            }
        });
        Hospital.updateOne({name: hosName}, {'$pull': {'confirmedAppointment': {'_id': id}}}, (err)=>{
             if(err){
                 console.log(err);
             }  
        });
        res.redirect('/userAppointments');
    });

    app.post("/cancelPAppRequest", function (req, res) {
        const hosName = req.body.hos;
        const id = req.body.id;

        User.updateOne({_id: req.user._id}, {'$pull': {'appointments': { '_id': id}}}, (err)=>{
            if(err){
                console.log(err);
            }
        });
        Hospital.updateOne({name: hosName}, {'$pull': {'requestedAppointment': {'_id': id}}}, (err)=>{
             if(err){
                 console.log(err);
             }  
        });
        console.log(req.user);
        res.redirect('/userAppointments');
    });

    app.get('/adminDashboard', async (req, res)=>{
        const hpId = req.user.hospitalId;
        const hospital = await Hospital.findById(hpId, {'_id' : 1, 'departments': 1, 'name': 1});
        // console.log(hospital);
        res.render("admin/adminDashboard", {hospital: hospital});
    })
    //Adding Doctor and Department ( Admin Side );

    app.get("/addDepartment", (req,res)=>{
        if(req.user.type==0){
          res.redirect('/adminDashboard');
        }else{
        res.render("admin/addDepartment.ejs");
        }
    });

    app.get('/addEmployee', (req, res)=>{
        res.render('admin/addEmployee');
    })

    //ADD EMPLOYEE

    app.post('/addEmployee', (req, res)=>{
        const {name, email, password, role} = req.body;
        let type = (role=="employee")? 0:1 ;
        const employee = new Employee({
            name: name,
            email: email,
            password: password,
            role: 'employee',
            hospitalId: req.user.hospitalId,
            type: type
        });
        console.log(employee);
        employee.save();
        res.redirect('/adminDashboard');
    })

    //ADD DEPARTMENT

    app.post('/addDepartment', upload.array('image', 4) , async (req, res, next)=>{
        let dep = req.body.dept;
        let fee = (req.body.fee);
        let note = req.body.note;
        let arr = [];

        (req.files).forEach(file =>{
            var obj = {
                data: file.path,
                contentType: file.mimetype
            };
            arr.push(obj);
        })
        const newDept = new Department({
          name : dep,
          note : note,
          hospitalId: req.user.hospitalId,
          price : fee,
          img: arr,
          doctors : []
        });
        newDept.save();
        let hpId = req.user.hospitalId;
        Hospital.updateOne({_id : hpId},
        {'$push' : {'departments' : newDept}}, function(err){
            if(err){
                console.log(err);
            }
            res.redirect('/adminDashboard');
        });

    });

    // Adding doctor into department

    app.post("/addDoctor0", function(req,res){
       if(req.user.type==0){
         res.redirect('/adminDashboard');
       }
       else{
        const dept = req.body.department;
        console.log(dept);
        res.render("admin/addDoctor.ejs",{
           dept : dept
         });
       }
    });

    app.post('/addDoctor', upload.array('image', 2), function(req,res,next){
        let dept = req.body.dept;
        console.log(req.body);
        let name = req.body.name;
        let deg = req.body.deg;
        let exp = req.body.exp;
        let note = req.body.note;

        let arr=[];
        (req.files).forEach(file =>{
            var obj = {
                data: file.path,
                contentType: file.mimetype
            };
            arr.push(obj);
        });

        const newDoc = new Doctor({
          name : name,
          department : dept,
          degree : deg,
          experience : exp,
          note : note,
          img: arr
        });
        newDoc.save();

        let hp = req.user.hospitalId;
        Hospital.updateOne({_id : hp, 'departments.name' : dept},
        {'$push' : {'departments.$.doctors' : newDoc}}, function(err){
            if(err){
                console.log(err);
            }
            res.redirect("/adminDashboard");
        });
    });

    app.post('/viewDoctor', async (req, res)=>{
        const dept = req.body.department;
        const hId = req.user.hospitalId;
        const department = await Hospital.findOne({_id: hId}).select({departments : {$elemMatch: {name: dept}}});
        console.log(department);
        // res.render('admin/viewDoctor', {doctors:doctors});
    });

    app.get('/requestedAppointment',function(req,res){
        Hospital.findOne({_id : req.user.hospitalId},{requestedAppointment : 1},function(err,doc){
          if(err){
            console.log(err);
            res.sen('some error occured, press left arrow to go to dashboard');
          }
           res.render('admin/showRequestedAppointment.ejs',{
             ap : doc.requestedAppointment
           });
        });
      });

      app.post('/statusRequestedApp',function(req,res){
        let val = req.body.button;
        if(val == "yes"){
          let doct =  req.body.doctor;
          let from = new Date(req.body.ltime);
          let to = new Date(req.body.rtime);
          let note = req.body.note;
          let id = req.body.id;
          let dept = req.body.dept;
          let hosp = req.body.hospital;
          let pt = req.body.patient;
          let userId = req.body.userId;
          const price = req.body.price;
          let choiceDate = req.body.date;

                const updAppt = new Appointment({
                  patientName : pt,
                  hospital : hosp,
                  department : dept,
                  doctor : doct,
                  timeL : from,
                  timeR : to,
                  choiceDate: choiceDate,
                  note : note,
                  status : 1,
                  price: price,
                  userId : userId
                });
                //console.log(updAppt);
                Hospital.updateOne({'_id': req.user.hospitalId},
                {'$pull' : {'requestedAppointment': {'_id':id}}},function(err){
                    if(err){
                        console.log(err);
                    }
                });
                Hospital.updateOne({'_id': req.user.hospitalId},
              {'$push' : {'confirmedAppointment' : updAppt}},function(err){
                if(err){
                    console.log(err);
                }
              });
               User.updateOne({'_id' : userId},
              {'$pull' : {'appointments' : {'_id' : id}}},function(err){
                if(err){
                    console.log(err);
                }
                });
                User.updateOne({'_id': userId},
                  {'$push' : {'appointments' : updAppt}},function(err){
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/requestedAppointment');
                    });
        }
        else if(val == 'no'){
          let id = req.body.id;
          let note = req.body.note;
          let hosp = req.body.hospital;
          let userId = req.body.userId;
          User.findOne({'_id' : userId},{'appointments' : 1},function(err,doc){
            if(err){
              console.log(err);
            }
          //  console.log(doc);
          //  let arr = doc.appointments.slice();
            for(let i=0;i<doc.appointments.length;i++){
              if(doc.appointments[i]._id == id){
                doc.appointments[i].status = -1;
                doc.appointments[i].note = note;
                doc.save();
                break;
              }
            }
          });
         Hospital.updateOne({'_id': req.user.hospitalId},
          {'$pull' : {'requestedAppointment': {'_id':id}}},function(err1){
              if(err1){
                console.log(err1);}
              res.redirect('/requestedAppointment');
           
          });
        }
      });

      // To view Confirmed appointments of hospital
      app.get('/confirmedAppointment',function(req,res){
        Hospital.findOne({_id : req.user.hospitalId},{confirmedAppointment : 1},function(err,doc){
          if(err){
            console.log(err);
            res.send("Some error occured");
          }
          console.log(doc);
           res.render('admin/showConfirmedAppointment.ejs',{
             ap : doc.confirmedAppointment
           });
        });
      });
      app.post('/updateAppointment', (req, res)=>{
        let doct =  req.body.doctor;
        let from = new Date(req.body.ltime);
        let to = new Date(req.body.rtime);
        let note = req.body.note;
        let id = req.body.id;
        let dept = req.body.dept;
        let hosp = req.body.hospital;
        let pt = req.body.patient;
        let userId = req.body.userId;
        const price = req.body.price;
        let choiceDate = req.body.date;
        let status = (req.body.status == 'confirmed' ? 1 :-1);

        Hospital.updateOne({'_id': req.user.hospitalId},{'$set' : {'confirmedAppointment.$[appoint].doct' : doct, 'confirmedAppointment.$[appoint].timeL' : from, 'confirmedAppointment.$[appoint].timeR' : to, 'confirmedAppointment.$[appoint].note' : note,
        'confirmedAppointment.$[appoint].status' : status}},
        {arrayFilters :[{'appoint._id' : id}]},function(err){
            console.log(err);
       });

      });

      // To view Past appointments of hospital
      app.get('/pastAppointment',function(req,res){
        Hospital.findOne({_id : req.user.hospitalId},{pastAppointment : 1},function(err,doc){
          if(err){
            console.log(err);
            res.send("Some error occured");
          }
          console.log(doc);
           res.render('admin/showPastAppointment.ejs',{
             ap : doc.pastAppointment
           });
        });
      });
}

module.exports = initRoute;
const bcrypt = require('bcrypt');
const userA = require('../../models/user');
const passport = require('passport');
const hospitalA = require('../../models/hospital');

const Hospital = hospitalA.Hospital;
const User = userA.User;
const userSchema = userA.userSchema;

function authController(){
    return {
        login(req, res) {
            res.render('auth/login');
        },

        postLogin(req, res, next){
            // here err, user, info is coming from passport.js where in done() function we have provided null, false/user , message
            passport.authenticate('local-user', (err, user, info)=>{       
                if(err){
                    req.flash('error', info.message);
                    return next(err);
                }
                if(!user){
                    req.flash('error', info.message);
                    return res.redirect('/login');
                }

                // when user exists and password matches then login the user using login method;
                req.logIn(user, (err)=>{
                    if(err){
                        req.flash('error', info.message);
                        return next(err);
                    }
                    if(req.user.role=='admin')
                        return res.redirect('/');
                    else{
                        return res.redirect('/');
                    }
                })
            })(req, res, next)
        },

        employeeLogin(req, res){
            res.render('auth/employeeLogin');
        },
        postemployeeLogin(req, res, next){
            passport.authenticate('local-employee', (err, employee, info)=>{       
                if(err){
                    req.flash('error', info.message);
                    return next(err);
                }
                if(!employee){
                    // req.flash('error', info.message);
                    console.log(info);
                    return res.redirect('/employeeLogin');
                }

                // when employee exists and password matches then login the user using login method;
                req.logIn(employee, (err)=>{
                    if(err){
                        req.flash('error', info.message);
                        return next(err);
                    }
                    Hospital.findById(req.user.hospitalId, (err, hosp)=>{
                        if(!err){
                            const hospital = hosp;
                            return res.render('admin/adminDashboard', {hospital: hospital});
                        }
                    })
                })
            })(req, res, next)
        },

        register(req, res){
            res.render('auth/register');
        },

        async postRegister(req, res){
            const {name, email, password} = req.body;
            
            //Check if any field is empty
            if(!name || !email || !password){
                req.flash('error', 'All fields are required');
                req.flash('name', name);
                req.flash('email', email);
               res.redirect('/register');
            }

            //Check if user email already exists
            User.exists({email: email}, (err, result)=>{
                if(result){
                    req.flash('error', 'Email already exists, Try another!')
                    req.flash('name', name);
                    req.flash('email', email);
                  res.redirect('/register');
                }
            })

            //Hash Password
            const hashedPass = await bcrypt.hash(password, 10)

            //Create a user
            const user = new User({
                name: name,
                email: email,
                password: hashedPass,
                appointments: []
            })
            user.save().then(()=>{
                //Login

                res.redirect('/login');

            }).catch((err)=>{
                req.flash('error', 'Something went wrong');
                res.redirect('/register');
            })
        },

        logout(req, res){
            req.logout();
            return res.redirect('/');
        },

        employeeLogout(req, res){
            req.logout();
            return res.redirect('/employeeLogin');
        }
    }
}
module.exports = authController;
const LocalStrategy = require('passport-local').Strategy
const userA = require('../models/user');
const employeeA = require('../models/employee');

const bcrypt = require('bcrypt');

const User = userA.User;
const userSchema = userA.userSchema;
const Employee = employeeA.Employee;

function passportInit(passport){
     
    //For User Login

     passport.use('local-user', new LocalStrategy({usernameField: 'email'}, async(email, password, done)=>{
         //Login
         //Check if user exists or not
         const user = await User.findOne({email: email});
         if(!user){
             return done(null, false, {message: 'No user with this email'});
         }
         bcrypt.compare(password, user.password).then((match)=>{     // here match returns true or false
             if(match)
                return done(null, user, {message: 'Logged in successfully'});

             return done(null, false, {message: 'Username or password is incorrect'});
         }).catch((err)=>{
             return done(null, false, {message: 'Something went wrong'});
         })
     }));

     //For Employee Login

     passport.use('local-employee', new LocalStrategy({usernameField: 'email'}, async(email, password, done)=>{
          const employee = await Employee.findOne({email: email});
          if(!employee){
              return done(null, false, {message: 'No employee with this email'});
          }
        //   bcrypt.compare(password, employee.password).then((match)=>{
        //       if(match)
        //           return done(null, employee, {message: 'Logged in Successfulyy'});

        //       return done(null, false, {message: 'Username or password is incorrect'});
        //   }).catch((err)=>{
        //       return done(null, false, {message: 'Something went wrong'});
        //   })
        if(password==employee.password){
            return done(null, employee, {message: 'Logged in Successfulyy'});
        }
        return done(null, false, {message: 'Username or password is incorrect'});
     }));
     
    passport.serializeUser((userObject, done)=>{
        done(null, {id: userObject._id, role: userObject.role});   // second parameter to store in session to know whether user is logged in or not
    })
    
    passport.deserializeUser((obj, done)=>{
        switch(obj.role) {
            case 'user':
                User.findById(obj.id, (err, user)=>{
                    done(err, user)
                });
                break;
            case 'employee':
                Employee.findById(obj.id, (err, employee)=>{
                    done(err, employee);
                });
                break;
            default: 
                done(new Error('np entity role ', obj.role), null);
                break;
        }
    })
     //to know whether user is logged in or not
    //  passport.serializeUser((userObject, done)=>{
    //      done(null, user._id)   // second parameter to store in session to know whether user is logged in or not
    //  })

     //to receive whatever we have stored in session using passport.serializeUser, here we have stored user._id so we will receive that
     // we deserialize so that we can use req.user to know who is current user in our backend;
    //  passport.deserializeUser((id, done)=>{
    //      User.findById(id, (err, user)=>{
    //          done(err, user);
    //      })
    //  })
    
}

module.exports = passportInit
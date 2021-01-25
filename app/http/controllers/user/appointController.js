const userA = require('../../../models/user');

const User = userA.User;

function appointController(){
    return {
        async index(req, res){
            User.findOne({_id: req.user._id}, {appointments : 1}, (err, doc)=>{
                if(err){
                  console.log(err);
                  return ;
                }
                let ap = doc.appointments.slice();
                // console.log(ap);
                res.render('user/appointment', {appoints : ap});
            });
        }
    }
}

module.exports = appointController;
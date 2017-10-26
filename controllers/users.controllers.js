var mongoose = require('mongoose');
var user     = mongoose.model('user');
var bcrypt   = require('bcrypt-nodejs');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
// const SendOtp = require('sendotp');
// const sendOtp = new SendOtp('AuthKey');
// sendOtp.setOtpExpiry('15'); //in minutes
// var jwt      = require('jsonwebtoken');

passport.use(new localStrategy({
    usernameField: 'email',
    session: true

},
function(username, password, callback) {
    user.findOne({
            email: username
            // provider: 'Local'
        },
        function(err, docs) {
            if (err) {
                return callback(err);
            }
            console.log("in local stretegy");
            if (!docs) {
                return callback(null, false);
            }

            // Make sure the password is correct
            docs.verifyPassword(password, function(err, isMatch) {
                if (err) {
                    return callback(err);
                }

                // Password did not match
                if (!isMatch) {
                    return callback(null, false);
                }
                
                // Success
                return callback(null, docs);
            });
        });
}
));



passport.serializeUser(function(User, done) {
    console.log('Serialize', User);
    done(null, User._id);
});
// used to deserialize the user
passport.deserializeUser(function(User, done) {
    console.log('deserialize', User);
    user.findOne({
        _id: User
    }, function(err, User) {
        done(err, User);
    });
});



module.exports.register = function(req, res) {
//   console.log('registering user');

  var username = req.body.username;
  var name = req.body.name || null;
  var password = req.body.password;
  var email = req.body.email;
  var phone_number= req.body.contacts.phone_number;
  var countrycode = req.body.contacts.countrycode;

  user
  .findOne({
      email:email
  })
  .exec(function(err,doc){
      if(err) throw err
      
      if(doc){
        res
        .status(409)
        .json({
            'status':false,
            'message':'email id already exists'
        })
      }
      else{

        // console.log("in register else part");

        var new_user=new user();

        new_user.username=username;
        new_user.email=email;
        new_user.contacts.phone_number=phone_number;
        new_user.contacts.countrycode=countrycode;
        new_user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        new_user.name = name;

        new_user.save(function(err,saveduser){
            if (err) {
                // console.log(err);
                res.status(400).json(err);
              } else {

                
                  req.logIn(saveduser,function(err){
                      if (err) {
                          throw err
                      }

                      var ip;
                      if (req.headers['x-forwarded-for']) {
                          ip = req.headers['x-forwarded-for'].split(",")[0];
                      } else if (req.connection && req.connection.remoteAddress) {
                          ip = req.connection.remoteAddress;
                      } else {
                          ip = req.ip;
                      }
                    //   console.log("client IP is *********************" + ip);
                      
                      var seconds = new Date().getTime();
          
                      var session_doc = {
                          ipaddress : ip,
                          session_start: seconds
                      }
                      req.user.session.push(session_doc);
          
          
                      req.user.save(function(err,doc){
                          if(err) throw err
          
                            // console.log('user created', saveduser);
                            res.status(200).json({
                              'status':true,  
                              'user':saveduser,
                              'message':'successfully saved user and logged in'
                            });  
                          
                      })
          
                  });
                
            }
        })

    
      }  
  })


};
exports.login = function(req, res, next) {
    // console.log(req.body);
      passport.authenticate('local', function(err, user1, info) {
          if (err) {
              return next(err);
          }
          // console.log(user);
          if (!user1) {
              return res.status(404).json({
                  err: info
              });
          }
        //   console.log("logging in user ",user1);
        //   sendOtp.send(user1.phone_number, user1._id, function(err,data){
        //       if(err) throw err
              
        //       console.log(data);
        //   });
          req.logIn(user1, function(err) {
              if (err) {
                //   console.log(err);
                  
                  return res.status(404).json({
                      'error': err,
                      success: false
                  });
              }
  
              // jwt token generation 
  
              // var jwttoken = jwt.sign(req.user._id,jwtsecretkey,{
              //     expiresIn:60*60*24 //token vality expiresIn in seconds
              // });
  
              // var jwttoken = jwt.sign(result._id,jwtsecretkey,{
            //     var jwttoken = jwt.sign({},jwtsecretkey,{
            //       subject:req.user._id.toString(),
            //       expiresIn:60*60*24 //token vality expiresIn in seconds
            //   });
            var ip;
            if (req.headers['x-forwarded-for']) {
                ip = req.headers['x-forwarded-for'].split(",")[0];
            } else if (req.connection && req.connection.remoteAddress) {
                ip = req.connection.remoteAddress;
            } else {
                ip = req.ip;
            }
            // console.log("client IP is *********************" + ip);
            
            var seconds = new Date().getTime();

            var session_doc = {
                ipaddress : ip,
                session_start: seconds
            }
            req.user.session.push(session_doc);


            req.user.save(function(err,doc){
                if(err) throw err

                res.status(200).json({
                    status: 'Login successful!',
                    success: true,
                    user: req.user
                    //   token:jwttoken
                });  
            })

              
          });
      })(req, res, next);
  };
  

module.exports.logout = function(req,res){
    // console.log('logging you out',req.user);
    if (req.isAuthenticated()) {
        var seconds = new Date().getTime()
        req.user.session[req.user.session.length-1].session_end=seconds;
        req.user.save(function(err,doc){
            if(err) throw err

            req.logout();
            res.send({
                'status': 'logged Out',
            })
        })
        
    } else {
        res.send({
            'status': 'login again'
        })
    }   
};


module.exports.verifyotp = function(req,res){
    // var otpToVerify = req.body.otp;
    // var contactNumber = req.body.phone_number;

    // sendOtp.verify(contactNumber, otpToVerify, function(err,result){
    //     if(err) throw err
        
    //     if(result){
    //         res.status(200).json({
    //             'success':true,
    //             'message': 'OTP successfully verified, logging you in'
    //         })
    //     }
    //     else{
    //         res.status(400).json({
    //             'success':false,
    //             'message': 'OTP verification Failed'
    //         })
    //     }
    // });
};

// exports.isAuthenticated = passport.authenticate('local');

//logout code using express-session only without passport

// app.get('/logout',function(req,res){
	
// 	req.session.destroy(function(err){
// 		if(err){
// 			console.log(err);
// 		}
// 		else
// 		{
// 			res.redirect('/');
// 		}
// 	});

// });


//jwt verification code

// module.exports.authenticate = function(req, res, next) {
//   var headerExists = req.headers.authorization;
//   if (headerExists) {
//     var token = req.headers.authorization.split(' ')[1]; //--> Authorization Bearer xxx
//     jwt.verify(token, 's3cr3t', function(error, decoded) {
//       if (error) {
//         console.log(error);
//         res.status(401).json('Unauthorized');
//       } else {
//         req.user = decoded.username;
//         next();
//       }
//     });
//   } else {
//     res.status(403).json('No token provided');
//   }
// };
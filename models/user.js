var mongoose = require('mongoose');
var localStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  email:{
      type:String,
      unique:true,
      required:true
  },
  contacts:{
      countrycode:{
          type:String
      },
      phone_number:{
          type:String,
          required:true,
          unique:true
      }
  },
  session:[{
      ipaddress:{
          type:String
      },
      session_start:{
          type:String
      },
      session_end:{
          type:String
      }
  }]

  
});

//method to compare password
userSchema.methods.verifyPassword = function(password, cb) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('user', userSchema);
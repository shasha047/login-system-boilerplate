var mongoose = require('mongoose');
var user     = mongoose.model('user');
var bcrypt   = require('bcrypt-nodejs');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

module.exports.verifysession = function(req,res){
    if(!req.isAuthenticated()){
        res.send("hey man do login first to start ur session on <h1>PayCrypt</h1>");
    }
    else{
        res.send("yo !!! your session starts on <h1>PayCrypt</h1>");
    }
};
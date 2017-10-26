require('./database/db.js');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

// var mongo = require('mongodb');
var mongoose = require('mongoose');
var routes = require('./routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname,'public')));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

// routes.init(app);
app.use('/', require('./routes'));

app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
    console.log('Server started on port '+app.get('port'));
    // res.send("<h1>Paycrypt</h1>");
});



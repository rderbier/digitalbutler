// config/passport.js

// load all the things we need
var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var BasicStrategy   = require('passport-http').BasicStrategy;

var datacontroller = require('./datacontroller')
// load up the user model
//var User            = require('../app/models/user');

// expose this function to our app using module.exports
// need passport and db which is the graph database
exports.init = function() {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(
    	function(id, done) {
            datacontroller.getUser(id,done);
 
    	}
    );

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        console.log('Signup method for ' + email);
        
        datacontroller.createUser(email,password,done);
          

        

    }));
    // =========================================================================
    // Bais Auth LOGIN =============================================================
   passport.use('basic', new BasicStrategy(
   function(username, password, callback) {
       datacontroller.verifyUser(username,password,callback);



        }
    ));

// =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        datacontroller.verifyUser(email,password,done);

    }));

};

exports.isAuthenticated = passport.authenticate('basic', { session : true });
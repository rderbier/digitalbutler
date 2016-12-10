// config/passport.js

// load all the things we need
var passport = require('passport');
var LocalStrategy   = require('passport-local').Strategy;
var BasicStrategy   = require('passport-http').BasicStrategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var datacontroller = require('./datacontroller')
// load up the user model
//var User            = require('../app/models/user');

// expose this function to our app using module.exports
// need passport and db which is the graph database

var configAuth = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'your-consumer-key-here',
        'consumerSecret'    : 'your-client-secret-here',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        //682843972558-4uv1hers8ga26n21hgj0ccv1sovmf06g.apps.googleusercontent.com
//hg-v-In1N9CR4gV4Ih1BE9GZ
        'clientID'      : '682843972558-4uv1hers8ga26n21hgj0ccv1sovmf06g.apps.googleusercontent.com',
        'clientSecret'  : 'hg-v-In1N9CR4gV4Ih1BE9GZ',
        'callbackURL'   : 'http://www.digitalbutlerservice.com/auth/google/callback'
    }

};
exports.init = function() {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log("Serializing user "+user.email)
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
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            datacontroller.userByGoogleId(profile.id,profile.emails[0].value,token, done);
            
        });

    }));

};

exports.isAuthenticated = passport.authenticate('basic', { session : true });


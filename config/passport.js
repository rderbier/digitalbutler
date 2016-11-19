// config/passport.js
var bcrypt   = require('bcrypt-nodejs');
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
//var User            = require('../app/models/user');

// expose this function to our app using module.exports
// need passport and db which is the graph database
module.exports = function(passport,db) {

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
    		db.read(id, function(err, user) {
            	console.log("deserialize "+user.email) 
            	done(err, user);
       			});
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
        
        

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        db.find({'email': email}, 'USER', function(err, users) {
            // if there are any errors, return the error
            if (err) {
                console.log('Search user in graph - error ' + err);
                return done(err);
            }

            // check to see if theres already a user with that email
            if (users.length>0) {
                var user=users[0];
                if (user.password != undefined) {
            	   console.log('!signup user : found user with password');
                   return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                }  else {
                    console.log('!signup user : found user without password ' + email);
                // if there is no user with that email
                // create the user
                

                // set the user's local credentials
                var hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

                db.save(user,'password', hashPassword , function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
                }
            } else {
                console.log('Search user in graph - not found' + email);
                // if there is no user with that email
                // create the user
                

                // set the user's local credentials
                var hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

                db.save({
            		'email' : email,
            		'password': hashPassword
        		},'USER', function(err,newuser) {
                    if (err)
                        throw err;
                    return done(null, newuser);
                });
            }

        });    

        

    }));
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

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        db.find({'email': email}, 'USER', function(err, users) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (users.length==0)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            // TODO : change to crypted version
            var user=users[0];
            console.log("Testing user password "+password+" vs "+user.password)
            if (bcrypt.compareSync(password, user.password)==false) 
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};
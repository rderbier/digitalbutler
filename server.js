// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express

    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var passport = require('passport');
    var cookieParser = require('cookie-parser');
    var flash    = require('connect-flash');
    var session      = require('express-session');
    

    app.use(morgan('dev'));  
    app.use(cookieParser()); // read cookies (needed for auth)                                       // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.set('view engine', 'ejs'); // set up ejs for templating



    // security config
    var authController=require('./controllers/auth');
    authController.init(); // pass passport for configuration
   // required for passport
   app.use(session({
      secret: 'my secret secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
  }));
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session
    

    // routes ======================================================================
    app.use("/",express.static(__dirname + '/public'));    
    app.use("/static",express.static(__dirname + '/static'));               
    // set the static files location /public/img will be /img for users

    require('./app/routes.js')(app,passport); // load our routes and pass in our app and fully configured passport

    //
    // listen (start app with node server.js) ======================================
    var port = process.env.PORT || 8082;
    app.listen(port, function() {
        console.log('Our app is running on http://localhost:' + port);
    });

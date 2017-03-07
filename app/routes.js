// app/routes.js

var interpreter=require("./interpreter.js");
var authController=require('../controllers/auth');
var apiController=require('../controllers/apicontroller');
module.exports = function(app,  passport) {
    // api ---------------------------------------------------------------------
     // get user infor
    app.all('/api/*',isApiAuthenticated); 
    app.route('/api/userinfo')
        .get(apiController.getUserInfo)
// command
    app.get('/command', isApiAuthenticated,function(req, res) {
        var user = req.user;
        var command=req.query.command;
        console.log("command line  "+command);

        interpreter(user,command,req,res);

    });
    // get all todos
    app.route('/api/todos')
      .get( apiController.getTasks)
      .post(apiController.createTodo);
    

    app.route('/api/subjects/group/:group_id')
      .post( apiController.addSubject)
      .get( apiController.getSubjects);

     app.route('/api/todo/:todo_id') 
       .get( apiController.getTaskDetails)
      .delete( apiController.deleteTodo)
      .put(apiController.updateTodo);
    app.route('/api/todo/comment/:todo_id')
      .post(apiController.addSubject)
     app.route('/api/taskdone/:todo_id') 
      .put(apiController.setTaskDone);
    app.route('/api/taskpurge') 
      .put(apiController.purgePersonalTasksCtrl);
    app.route('/api/allocatetome/:todo_id') 
      .put(apiController.allocateTaskToUser);
    // goal and flow
    app.route('/api/flow')
      .post(apiController.createFlow);
    app.route('/api/startflow')
      .post(apiController.startFlow);
    app.route('/api/flows')
      .get(apiController.getStartableActions);
    app.route('/api/flow/:goal_id') 
      .get( apiController.getGoal)
    app.route('/api/goal/:goal_id/document') 
      .post( apiController.addDocumentToGoal)

    app.route('/api/actions/topic/:topic')
      .get(apiController.getActionsForTopic);
     // API assets
     //
    app.get('/api/assets',apiController.getAssets);

    // API groups
    app.route('/api/groups')
        .get( apiController.getGroups)
        .post(apiController.addGroup);
    app.route('/api/group/:group_id')
      .get(apiController.getGroup);
    app.route('/api/invite/')
      .post(apiController.addInvite);
    app.route('/api/invite/accept')
      .post(apiController.acceptInvite);

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    //app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
      //  res.render('login.ejs', { message: req.flash('loginMessage') }); 
    //});

        // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/',
                    failureRedirect : '/'
            }));
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    //app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
    //    res.render('signup.ejs', { message: req.flash('signupMessage') });
    //});

    // process the signup form

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/#register', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    //app.get('/home', isLoggedIn, function(req, res) {
    //res.render('home.ejs', {
    //        user : req.user // get the user out of session and pass to template
    //    });
    //});

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
    	  req.logout();
          req.session.destroy(function (err) {
            if (err) { return next(err); }
            // The response should indicate that the user is no longer authenticated.
            return res.send({ authenticated: req.isAuthenticated() });
          
            //res.redirect('/'); //Inside a callback… bulletproof!
          });
    	
    });
}




// route middleware to make sure a user is logged in

function isApiAuthenticated(req, res, next) {
    //var basic=authController.isAuthenticated(req,res,next);

    //console.log("Testing basic "+basic);
    for (k in req.headers) {
       console.log("Testing Headers "+k+" = "+req.headers[k]);
    }
    if (req.headers["authorization"]) {
        return (authController.isAuthenticated(req,res,next));
    }
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
        next();
    } else {
        next("error");
    }
    
}
function isLoggedIn(req, res, next) {
	console.log("Testing isLoggedIn "+req.isAuthenticated());
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
    	return next();
    
    // if they aren't redirect them to the home page
    res.redirect('/');
}
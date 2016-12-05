// app/routes.js

var interpreter=require("./interpreter.js");
var authController=require('../controllers/auth');
var dataController=require('../controllers/datacontroller');
module.exports = function(app,  passport) {
    // api ---------------------------------------------------------------------
     // get user infor
    app.get('/api/userinfo', function(req, res) {
        var userinfo={login: false};
        if (req.isAuthenticated()) {
         dataController.getUserInfo(req,res);
        } else {
        res.json(userinfo);
    }
    });    
// command
    app.get('/command', isApiAuthenticated,function(req, res) {
        var user = req.user;
        var command=req.query.command;
        console.log("command line  "+command);

        interpreter(user,command,req,res);

    });
    // get all todos
    app.route('/api/todos')
      .get(isApiAuthenticated, dataController.getTasks)
      .post(isApiAuthenticated,dataController.createTodo);

     app.route('/api/todo/:todo_id') 
      .delete(isApiAuthenticated, dataController.deleteTodo)
      .put(isApiAuthenticated,dataController.updateTodo);
     app.route('/api/taskdone/:todo_id') 
      .put(isApiAuthenticated,dataController.setTaskDone);
    app.route('/api/allocatetome/:todo_id') 
      .put(isApiAuthenticated,dataController.allocateTaskToUser);
     
    app.route('/api/action')
      .post(isApiAuthenticated,dataController.startTask);
     // API assets
     //
    app.get('/api/assets', isApiAuthenticated,dataController.getAssets);

    // API groups
    app.get('/api/groups', isApiAuthenticated,dataController.getGroups);
    app.route('/api/group/:group_id')
      .get(isApiAuthenticated,dataController.getGroup);

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
    	res.redirect('/');
    });
};



// route middleware to make sure a user is logged in

function isApiAuthenticated(req, res, next) {
    console.log("Testing isLoggedIn "+req.isAuthenticated());
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();
    return (authController.isAuthenticated(req,res,next));
  
}
function isLoggedIn(req, res, next) {
	console.log("Testing isLoggedIn "+req.isAuthenticated());
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
    	return next();
    
    // if they aren't redirect them to the home page
    res.redirect('/');
}
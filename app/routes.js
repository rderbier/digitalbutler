// app/routes.js
module.exports = function(app, db, passport) {
    // api ---------------------------------------------------------------------
     // get user infor
    app.get('/api/userinfo', function(req, res) {
        var userinfo={login: false};
        if (req.isAuthenticated()) {
         var user = req.user;
         userinfo.login=true;
         userinfo.email=user.email;
         userinfo.name=user.name;
        } 
        res.json(userinfo);
    });
    // get all todos
    app.get('/api/todos', function(req, res) {
         var user = req.user;
        // use seraphto get all todos in the database
        sendTodos(db,user,res);
    });



    // create todo and send back all todos after creation
    app.post('/api/todos', function(req, res) {
         var user = req.user;
         var query = [
         'MATCH (u:USER) WHERE id(u)={userid}',
		 'MERGE (u)-[r:MAYDO]-(t:TODO {description:{description}, done: false})',
         'RETURN t'
         ].join('\n');

        db.query(query, {userid: user.id, description : req.body.text} , function(err, todo) {
	        	if (err) {
	        		res.send(err);
	        	} else {
                    sendTodos(db,user,res);
                }

	        });
      

    });
        // delete a todo
    app.get('/command', function(req, res) {
        var user = req.user;
        var command=req.query.command;
        console.log("command line  "+command);
        var response ={};
        response.getit=false;
             response.page="";
             response.message="can't do that";
        if (command.includes("todo")) {
             response.page="todos";
             response.message="";
             response.getit=true;
             
        } 
        if (command.startsWith("have to")) {
            var description = command.substr(8);
                     var query = [
         'MATCH (u:USER) WHERE id(u)={userid}',
         'MERGE (u)-[r:MAYDO]-(t:TODO {description:{description}, done: false})',
         'RETURN t'
         ].join('\n');

          db.query(query, {userid: user.id, description : description} , function(err, todo) {
                

            });

             response.page="todos";
             response.message="";
             response.getit=true;
             
        } 
        res.json(response);

    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function(req, res) {
    	var user = req.user;
    	console.log("deleting node "+req.params.todo_id);
    	var force=true; // delete relations if not orphan
    	db.delete(req.params.todo_id, force,
    		function(err) {

    			if (err) {
    				console.log("node NOT deleted "+err);
    				res.send(err);

    			} else {
    			   console.log("node deleted ");
                   sendTodos(db,user,res);
                }
        });

    });
    // application -------------------------------------------------------------
    //app.get('*', function(req, res) {
    //    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    //});

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    //app.get('/', function(req, res) {
    //    res.render('index.ejs'); // load the index.ejs file
    //});

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

        // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
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


function sendTodos(db, user, res) {
		            // get and return all the todos after you create another
		       var query = 'MATCH (u:USER)-[]-(t:TODO) WHERE id(u)={userid} RETURN t';

	            db.query(query, {userid: user.id},function(err, todos) {
	            	if (err)
	            		res.send(err)
	            	res.json(todos);
	            });
}
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	console.log("Testing isLoggedIn "+req.isAuthenticated());
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
    	return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
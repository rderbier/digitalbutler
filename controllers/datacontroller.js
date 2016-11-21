        


var bcrypt   = require('bcrypt-nodejs');
    //
    // configuration =================
    // for local testing set GRAPHENEDB_URL=http://neo4j:<passsword>@localhost:7474
	url = require('url').parse(process.env.GRAPHENEDB_URL);
	console.log("Using Graph DB at "+url);
	var db = require("seraph")({
	  server: url.protocol + '//' + url.host,
	  user: url.auth.split(':')[0],
	  pass: url.auth.split(':')[1]
	});

	exports.getUser = function (id,done) { 
	   		db.read(id, function(err, user) {
            	console.log("deserialize "+user.email) 
            	done(err, user);
       			});
	   	}

	 exports.createUser = function (email,password,done) {
	  // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        db.find({'email': email}, 'USER', function(err, users) {
            // if there are any errors, return the error
            if (err) {
                console.log('Search user in graph - error ' + err);
                return done(err);
            }
            // set the user's local credentials
            var hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

            // check to see if theres already a user with that email
            if (users.length>0) {
                var user=users[0];
                if (user.password != undefined) {
            	   console.log('!signup user : found user with password');
                   return (done(null, false));
                }  else {
                    console.log('!signup user : found user without password ' + email);
                // 
                // update password

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
    };

    exports.verifyUser = function (username,password,callback) {
    	 db.find({'email': username}, 'USER', function(err, users) {
            // if there are any errors, return the error before anything else
            if (err)
                return callback(err);

            // if no user is found, return the message
            if (users.length==0)
                return callback(null, false); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            // TODO : change to crypted version
            var user=users[0];
            console.log("Testing user password "+password+" vs "+user.password)
            if (bcrypt.compareSync(password, user.password)==false) 
                return callback(null, false); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return callback(null, user);
        });
    }

    exports.getTodos = function (req,res) {
    	var user = req.user;
		            // get and return all the todos after you create another
		       var query = 'MATCH (u:USER)-[]-(t:TODO) WHERE id(u)={userid} RETURN t';

	            db.query(query, {userid: user.id},function(err, todos) {
	            	if (err)
	            		res.send(err)
	            	res.json(todos);
	            });
}
exports.createTodo = function(req, res) {

         var user = req.user;
         var query = [
         'MATCH (u:USER) WHERE id(u)={userid}',
		 'MERGE (u)-[r:MAYDO]-(t:TODO {createdby:{createdby}, description:{description}, done: false})',
         'RETURN t'
         ].join('\n');
         console.log("receive task : "+req.body.title);

        db.query(query, {createdby: user.email, userid: user.id, description : req.body.title} , function(err, todo) {
	        	if (err) {
	        		res.send(err);
	        	} else {
                    sendTodos(db,user,res);
                }

	        });
      

    }

exports.deleteTodo = function(req, res) {
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

    }    

 exports.getAssets = function(req, res) {
         var user = req.user;
               var query = 'MATCH (o:OBJECT)-[r:ISIN]-(l:LOCATION) return o.name AS object, l.name as location';

                db.query(query, {userid: user.id},function(err, result) {
                    if (err)
                        res.send(err)
                    res.json(result);
                });
      

    }
  exports.getGroups = function(req, res) {
         var user = req.user;
               var query = 'MATCH (u:USER)-[m:MEMBER]-(g:GROUP) WHERE id(u)={userid} return m.role as role,id(g) as id, g.name as name,g.createdby as createdby';

                db.query(query, {userid: user.id},function(err, result) {
                    if (err)
                        res.send(err)
                    res.json(result);
                });
      

    }
    exports.getGroup = function(req, res) {
        
        var user = req.user;
        var groupid=parseInt(req.params.group_id);
        console.log("get group details for user "+user.id+" group "+groupid)
        var query = 'MATCH (u:USER)-[:MEMBER]-(g:GROUP) WHERE id(u)={userid} AND id(g)={groupid} WITH g MATCH (u2:USER)-[m:MEMBER]-(g) RETURN m.role as role, u2.email as email';

                db.query(query, {userid: user.id, groupid: groupid},function(err, result) {
                    if (err)
                        res.send(err)
                    res.json(result);
                });
    }

        


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



getTodos = function (user,res) {
	
	// get and return all the todos after you create another
	var tasklist={};
	var query = 'MATCH (u:USER)-[:HASTO]-(t:TODO) WHERE id(u)={userid} RETURN t  ORDER BY t.duedate ASC LIMIT 100 ';
    var query2= 'MATCH (u)-[:MEMBER]-(g)-[:HASTO]-(t:TODO)  WHERE id(u)={userid} return t ORDER BY t.duedate ASC LIMIT 100'; 
    var queryActions='MATCH (u:USER) WHERE id(u)={userid} WITH u MATCH (u)-[a:ACTION]-(t:TODO)  return t UNION MATCH (u)-[:MEMBER*0..]-(g:GROUP)-[a:ACTION]-(t:TODO)  return t';
	db.query(query, {userid: user.id},function(err, todos) {
		if (err)
			res.send(err)
		tasklist.me=todos;
		db.query(query2, {userid: user.id},function(err, todos) {
			if (err)
				res.send(err)
			tasklist.group=todos;
			db.query(queryActions, {userid: user.id},function(err, actions) {
				if (err)
					res.send(err)
				tasklist.actions=actions;
				res.json(tasklist);
			    });
		
	    });
	});
}
exports.getTasks = function(req, res) {
    getTodos(req.user,res);
}

exports.createTodo = function(req, res) {
	createTask(user,req.body, function(err, todo) {
			if (err) {
				console.log("Error : "+err.message);
				res.send(err);
			} else {
				getTodos(user,res);
			} })
}

exports.createTask = function(user, task, done) {
	
	
	if (task.distribution=="PERSO") {
          task.execUser=user.email;
        }
    if (task.trigOption=="PERSO") {
          task.trigUser=user.email;
      }
    if (task.execGroupChoice=="ANY") {
    	task.execGroupRole="ANY";
    }
	var set=[];
      set.push('t.createdon=timestamp()');
	if (task.description)
		set.push(' t.description="'+task.description+'"');
	if (task.distribution)
		set.push(' t.distribution="'+task.distribution+'"');
	if (task.execGroupId)
		set.push(' t.execGroupId="'+parseInt(task.execGroupId)+'"');
	if (task.execGroupChoice)
		set.push(' t.execGroupChoice="'+task.execGroupChoice+'"');
	if (task.execUser)
		set.push(' t.execUser="'+task.execUser+'"');
	if (task.execGroupName)
		set.push(' t.execGroupName="'+task.execGroupName+'"');
	if (task.execGroupRole)
		set.push(' t.execGroupRole="'+task.execGroupRole+'"');
	if (task.occurrence)
		set.push(' t.occurrence="'+task.occurrence+'"');
	if (task.trigOption)
		set.push(' t.trigOption="'+task.trigOption+'"');
	if (task.duedate)
		set.push(' t.duedate='+task.duedate);
	if (task.occurence == 'CHAINED') {
		console.log("Chained task not implemented yet");
		getTodos(user,res);
	} else {
		var relation="HASTO";
		var groupid = task.execGroupId; // using notion of doing a task
		var useremail = task.execUser;
		var target = task.distribution;
		var grouprole = task.execGroupRole
        if ( task.occurrence == 'ATWILL') {
              relation="ACTION";
              groupid = task.trigGroupId; // using notion of starting a task
              useremail = task.trigUser;
              target = task.trigOption;
              grouprole = task.trigGroupRole
        } 
        
		if ((target=="GROUP") && (groupid!=undefined)) {
			var role="ANY";
	        if ( grouprole!=undefined) {
	        	role=grouprole;
	        }
	      var query = 'MATCH (g:GROUP) WHERE id(g)='+groupid+' ';
		  query+='MERGE (g)-[r:'+relation+' {role:"'+role+'"}]-(t:TODO {createdby:"'+user.email+'", title:"'+task.title+'", done: false}) ';
		  query+='WITH  t SET '+set+ ' RETURN t';
		
		} else {
	      var query = 'MATCH (u:USER) WHERE u.email="'+useremail+'" ';
		  query+='MERGE (u)-[r:'+relation+']-(t:TODO {createdby:"'+user.email+'", title:"'+task.title+'", done: false}) ';
		  query+='WITH  t SET '+set+ ' RETURN t';
		
		}
		
		console.log("receive task : "+task.title);
        console.log("query: "+query);
		db.query(query, done);
    }

}
exports.allocateTaskToUser = function(req, res) {

	var user = req.user;
	var task=req.body;
    var query ='MATCH (u:USER)-[:MEMBER]-(g:GROUP)-[r:HASTO]-(t:TODO) WHERE id(t)={taskid} and id(u)={userid} MERGE (u)-[l:HASTO]->(t) SET l=r WITH r DELETE r ';

     console.log("allocateTaskToUser query  : "+query);


	db.query(query , {userid: user.id, taskid: parseInt(req.body.id)}, function(err, todo) {
		if (err) {
			console.log("error  : "+err.message);
			res.send(err);
			console.log("query  : "+query);
		} else {
			// MATCH (g:GROUP) , (t:TODO)<-[r]-(u) WHERE id(t)=93 AND id(g)=77 DELETE r WITH t,u,g MERGE (t)<-[r:HASTO]-(g)
			getTodos(user,res);
		}

	});


}
exports.updateTodo = function(req, res) {

	var user = req.user;
	var task=req.body;

	var query = 'MATCH (t:TODO) WHERE id(t)='+parseInt(req.params.todo_id)+' AND t.createdby="'+user.email+'" SET ';
	var set=[];
	if (task.title)
		set.push(' t.title="'+task.title+'"');
	if (task.description)
		set.push(' t.description="'+task.description+'"');
	if (task.comment)
		set.push(' t.comment="'+task.comment+'"');
	if (task.target)
		set.push(' t.target="'+task.target+'"');
	if (task.done)
		set.push(' t.done='+task.done);
	if (task.doneby)
		set.push(' t.target="'+task.doneby+'"');
	
	query+=set.join(" , ");
	query+=' RETURN t';
	
	console.log("update task : "+req.params.todo_id," - "+ req.body.title);
	console.log("query  : "+query);


	db.query(query , function(err, todo) {
		if (err) {
			res.send(err);
		} else {
			// MATCH (g:GROUP) , (t:TODO)<-[r]-(u) WHERE id(t)=93 AND id(g)=77 DELETE r WITH t,u,g MERGE (t)<-[r:HASTO]-(g)
			getTodos(user,res);
		}

	});


}

exports.deleteTodo = function(req, res) {
	var user = req.user;
	console.log("deleting node "+req.params.todo_id);
    
    var query = 'MATCH ()-[r]-(t:TODO) WHERE id(t)='+req.params.todo_id+' delete r,t';
    db.query(query, 
    	function(err) {

    		if (err) {
    			console.log("node NOT deleted "+err);
    			res.send(err);

    		} else {
    			console.log("node deleted ");
    			getTodos(user,res);
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
exports.getUserInfo = function(req, res) {
	var user = req.user;
	var userinfo={};

         userinfo.login=true;
         userinfo.email=user.email;
         userinfo.name=user.name;
        
      
	var query = 'MATCH (u:USER)-[m:MEMBER]-(g:GROUP) WHERE id(u)={userid} return m.role as role,id(g) as id, g.name as name,g.createdby as createdby';

	db.query(query, {userid: user.id},function(err, result) {
		if (err)
			res.send(err)
		userinfo.groups=result;
		res.json(userinfo);
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

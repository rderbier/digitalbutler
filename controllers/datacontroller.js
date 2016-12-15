        


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

var  convertDates = function(todos) {
	for (t in todos) {
			if (todos[t].dateCreated) {
				var d=new Date(todos[t].dateCreated);
				todos[t].dateCreatedStr = d.toUTCString().substr(0,11);
			}
		    if (todos[t].dateDue) {
				var d=new Date(todos[t].dateDue);
				todos[t].dateDueStr = d.toUTCString().substr(0,11);
			}
		    if (todos[t].dateRemind) {
				var d=new Date(todos[t].dateRemind);
				todos[t].dateRemindStr = d.toUTCString().substr(0,11);
			}
		}
}
function replyDbCallback(res) {
 var f= function(err, data) {
		if (err) {
			console.log("error  : "+err.message);
			res.send(err);
			
		} else {
			// MATCH (g:GROUP) , (t:TODO)<-[r]-(u) WHERE id(t)=93 AND id(g)=77 DELETE r WITH t,u,g MERGE (t)<-[r:HASTO]-(g)
			res.send(data);
		}

	};
	return f;
}

var self = {
getUser: function (id,done) { 
	db.read(id, function(err, user) {
		console.log("deserialize "+user.email) 
		done(err, user);
	});
},

createUser:function (email,password,done) {
	// find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    db.find({'email': email}, 'USER', function(err, users) {
            // if there are any errors, return the error
            if (err) {
            	console.log('Search user in graph - error ' + err);
            	 done(err);
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
                	 done(null, user);
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
                		done(err);
                	 done(null, newuser);
                });
            }

        });  
},

verifyUser: function (username,password,callback) {
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
},
userByGoogleId: function (googleid,email,token,callback) {
	db.find({'googleid': googleid}, 'USER', function(err, users) {
            // if there are any errors, return the error before anything else
            if (err)
            	 return callback(err);

            // if no user is found, return the message
            if (users.length==0) {
            	// store the user information

                db.save({
                	'email' : email,
                	'token': token,
                	'googleid': googleid
                },'USER', function(err,newuser) {
                	if (err)
                		callback(err);
                	return callback(null,newuser);
                });
                 return callback(null, false); // req.flash is the way to set flashdata using connect-flash
            }

            // if the user is found but the password is wrong
            // TODO : change to crypted version
            var user=users[0];
            
            // all is well, return successful user
            return callback(null, user);
        });
},



getTodos : function (user, timestamp,done) {
	
	// 
	
	var tasklist={};
	var query = 'MATCH (u:USER)-[:HASTO]-(t:TODO) WHERE (id(u)={userid} AND (NOT has(t.dateRemind) OR (t.dateRemind < {timestamp}))) RETURN t  ORDER BY t.dateDue ASC LIMIT 100 ';
    var query2= 'MATCH (u)-[:MEMBER]-(g)-[:HASTO]-(t:TODO)  WHERE id(u)={userid} return t ORDER BY t.dateDue ASC LIMIT 100'; 
    var queryActions='MATCH (u:USER) WHERE id(u)={userid} WITH u MATCH (u)-[a:ACTION]-(t:TODO)  return t UNION MATCH (u)-[:MEMBER*0..]-(g:GROUP)-[a:ACTION]-(t:TODO)  return t';
	db.query(query, {userid: user.id, timestamp: timestamp},function(err, todos) {
		if (err) {
			done(err);
		} else {
			convertDates(todos);
			tasklist.me=todos;
			db.query(query2, {userid: user.id},function(err, todos) {
				if (err) {
					done(err)
				} else {
					convertDates(todos);
					tasklist.group=todos;
					db.query(queryActions, {userid: user.id},function(err, actions) {
						if (err) {
							done(err)
						} else {
							tasklist.actions=actions;
							done(null,tasklist);
						}
					});
				}
			
	    });
		}
	});
},
getActions : function (user,done) {
	// find taks related to user by ACTION and by NEXT relations
   

	var query = 'MATCH (u:USER)-[a:ACTION]-()-[:NEXT*0..]-(t:TODO) WHERE id(u)={userid} return t';
	db.query(query, {userid: user.id},done);
},


createTask : function(user, task, done) {
	if (task.distribution==undefined) {
		task.distribution="PERSO";
	} 
	
	if (task.distribution=="PERSO") {
          task.execUser=user.email;
        }
    if (task.trigOption=="PERSO") {
          task.trigUser=user.email;
      }
    if (task.execGroupChoice=="ANY") {
    	task.execGroupRole="ANY";
    }

    // handling repetitive task EVERYDAY 
    // set dateRemind and dateDueSpec
    if (task.occurrence=="EVERYDAY") {
    	if (task.dateRemind==undefined) 
    		task.dateRemind=Date.now(); // start today
    	if (task.repeatIndex==undefined)
    		task.repeatIndex=100; // TODO change for month DAY WEEK.
    	task.dateDue=task.dateRemind;
    	task.dateDueSpec=0; // same day so +0 days)
    	var d = new Date(task.dateRemind);
    	task.instance = d.toUTCString().substr(0,11); // set the instance name to be the remind date string
    }
	var set=[];
      set.push('t.dateCreated=timestamp()');

    for (let att of ['description','distribution','createdFrom','execGroupChoice','execUser','execGroupName','execGroupRole',
    	'occurrence','trigOption','trigGroupRole','doneBy']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'="'+task[att]+'"');
    	}
    }
    for (let att of ['trigGroupId','execGroupId','dateDue','dateRemind','dateDueSpec','repeatIndex','dateDone']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'='+parseInt(task[att]));
    	}
    }


	if (task.occurrence == 'CHAINED') {
		console.log("Chained task ");
		
		var query = 'MATCH (u:USER)-[a:ACTION]-()-[:NEXT*0..]-(t1:TODO) WHERE id(u)={userid} AND id(t1)={taskid} WITH t1 ';
		// it is a CHAINED task so there is an instance.
		query+='MERGE (t1)-[r:NEXT]-(t:TODO {createdby:"'+user.email+'", title:"'+task.title+'", instance:"'+task.instance+'", topic:"'+task.topic+'", done: false}) ';
		query+='WITH  t SET '+set+ ' RETURN t';
		console.log("Chaining task : "+task.title);
        console.log("query: "+query);
		db.query(query, {userid: user.id, taskid: parseInt(task.chainedFrom)},done);
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
	      // properties in the MATCH to insure creation of task with same title but different instance
		  query+='MERGE (g)-[r:'+relation+' {role:"'+role+'"}]-(t:TODO {createdby:"'+user.email+'", title:"'+task.title+'"';
		  if (task.instance!=undefined)
		  	query +=', instance:"'+task.instance+'"';
		  if (task.topic!=undefined) 
		  	query+=', topic:"'+task.topic+'"';
		  query+=', done: false}) ';

		  query+='WITH  t SET '+set+ ' RETURN t';
		
		} else {
	      var query = 'MATCH (u:USER) WHERE u.email="'+useremail+'" ';
		  query+='MERGE (u)-[r:'+relation+']-(t:TODO {createdby:"'+user.email+'", title:"'+task.title+'"';
		  if (task.instance!=undefined)
		  	query +=', instance:"'+task.instance+'"';
		  if (task.topic!=undefined) 
		  	query+=', topic:"'+task.topic+'"';
		  query+=', done: false}) ';
		  query+='WITH  t SET '+set+ ' RETURN t';
		
		}
		
		console.log("Creating task : "+task.title);
        console.log("query: "+query);
		db.query(query, done);
    }

},

allocateTaskToUser : function(user, task, done) {


    var query ='MATCH (u:USER)-[:MEMBER]-(g:GROUP)-[r:HASTO]-(t:TODO) WHERE id(t)={taskid} and id(u)={userid} MERGE (u)-[l:HASTO]->(t) SET l=r WITH r DELETE r ';

     console.log("allocateTaskToUser query  : "+query);


	db.query(query , {userid: user.id, taskid: parseInt(task.id)}, done);


},
updateTask : function(user, taskid, task, done) {

	
// TODO : security update only element 'related' to current user 
// still to be difined 
	var query = 'MATCH (t:TODO) WHERE id(t)='+taskid+'  SET ';
	var set=[];
	for (let att of ['description','comment','doneBy']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'="'+task[att]+'"');
    	}
    }
    for (let att of ['done','dateDue','dateRemind','dateDueSpec','repeatIndex','dateDone']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'='+task[att]);
    	}
    }
	
	
	query+=set.join(" , ");
	query+=' RETURN t';
	
	console.log("update task : "+taskid," - "+ task.title);


	db.query(query, done);


},

setTaskDone : function(user, task,done) {
 
	task.done=true; // we may remove done by using dateDone !
	task.dateDone=Date.now();
	task.doneBy=user.email;
	if (task.createdFrom != undefined) {
		// update task and check if there are some next task from template
		self.updateTask(user,task.id, task, function(err, data) {
			if (err) {
				console.log("error  : "+err.message);
				done(err);
				
			} else {
				// MATCH (g:GROUP) , (t:TODO)<-[r]-(u) WHERE id(t)=93 AND id(g)=77 DELETE r WITH t,u,g MERGE (t)<-[r:HASTO]-(g)
				var querynext='MATCH (t1:TODO)-[:NEXT]->(t:TODO) WHERE id(t1)='+task.createdFrom+' return t';
	            db.query(querynext, function (err,ndata) {
	            	if (err) { done(err)}
	            	else {
	            		for ( var i in ndata) {
			            	var ntask=ndata[i];
			            	ntask.createdFrom=ntask.id; // trace the origin of this task
			            	ntask.instance=task.instance;
			            	ntask.occurrence="NOW";  // change ATWILL from the template to NOW for this instance
				            

							self.createTask(user,ntask, function (err,newtask) {
								if (err) {
                                    done(err);
								} else {
									// create a NEXT relation to follow the instance 
									var querycreatenext='MATCH (t1:TODO),(t2:TODO) WHERE id(t1)='+task.id+' AND id(t2)='+newtask.id+' CREATE (t1)-[n:NEXT]->(t2) return t2';
	                                db.query(querycreatenext, function (err,ndata) {});
								}
							});
			            }
	            	}	
	            });
	            // return the initial done task
                done(null,data);
			}

	    });

	} else {
		// update the task
		self.updateTask(user, task.id, task, function(err, data) {
			if (err) {
				console.log("error  : "+err.message);
				done(err);
				
			} else {
				if ( task.occurrence == "EVERYDAY") {
					// handle repetitive EVERYDAY
					// create new task for tomoorow by copying and cleaning the task
					task.done=false;
					task.doneBy=undefined;
					task.dateDone-undefined;
					if (task.repeatIndex>0)
						task.repeatIndex -=1;
					if (task.repeatIndex > 0) {
					  task.dateRemind=Date.now()+(24*3600*1000); // now + a day.
					  self.createTask(user,task, done);
					} else {
						done(null,task);
					}
				} else {
					done(null,data);
				}

				
				
			}
		});

			
	}
	
},
purgePersonalTasks : function(user, days, done) {
	// delete tasks older that X days
	
	console.log("purging  done tasks "+user.email);
    
    var query = 'MATCH (u:USER)-[r]-(t:TODO) WHERE id(u)='+user.id+' AND t.distribution="PERSO" AND t.done=true AND t.dateDone < timestamp()-'+days*24*3600*1000+' delete r,t';

    db.query(query, done);


}, 

deleteTodo : function(user, todo_id,done) {
	
	console.log("deleting task  "+todo_id);
    
    var query = 'MATCH ()-[r]-(t:TODO) WHERE id(t)='+todo_id+' delete r,t';
    db.query(query, done);

},   

getAssets : function(user, done) {
	
	var query = 'MATCH (o:OBJECT)-[r:ISIN]-(l:LOCATION) return o.name AS object, l.name as location';

	db.query(query, {userid: user.id},done);


},
getGroups : function(user, done) {
	
	var query = 'MATCH (u:USER)-[m:MEMBER]-(g:GROUP) WHERE id(u)={userid} return m.role as role,id(g) as id, g.name as name,g.createdby as createdby';

	db.query(query, {userid: user.id},done);


},
getUserInfo : function(user, done) {
	
	var userinfo={};

         userinfo.login=true;
         userinfo.email=user.email;
         userinfo.name=user.name;
        
      
	var query = 'MATCH (u:USER)-[m:MEMBER]-(g:GROUP) WHERE id(u)={userid} return m.role as role,id(g) as id, g.name as name,g.createdby as createdby';

	db.query(query, {userid: user.id},function(err, result) {
		if (err)
			done(err);
		userinfo.groups=result;
		done(null,userinfo);
	});


},
getGroup : function(user, groupid, done) {
    // return group information, list of roles and for each role list of members
    // login user has to be a member to be allowed to retrieve group information

	console.log("get group details for user "+user.id+" group "+groupid)
	var query = 'MATCH (u:USER)-[:MEMBER]-(g:GROUP) WHERE id(u)={userid} AND id(g)={groupid} WITH g MATCH (u2:USER)-[m:MEMBER]-(g) RETURN g.name as name, m.role as role, m.aka as alias, u2.email as email';

	db.query(query, {userid: user.id, groupid: groupid},function(err, result) {
		if (err)
			done(err);
		// build the group information 
		var g={ name: "", roles:{}};
		for (i in result) {
			var m=result[i];
			g.name = m.name;
			if (g.roles[m.role]==undefined) {
				g.roles[m.role]={ members: []}
			}
			g.roles[m.role].members.push({ alias: m.alias, email: m.email});
		}
		done(null,g);
	});
}
}

module.exports = self;

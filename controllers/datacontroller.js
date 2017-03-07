        


var bcrypt   = require('bcrypt-nodejs');
var Promise = require('promise');
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

cypherQuery = function(query,params) {
  console.log(" Query graph "+query);	
  return new Promise(function (fulfill, reject){
    db.query(query, params, function (err, res){
      if (err) reject(err);
      else {
      	console.log(" got response from graph ");
      	fulfill(res);
      }
    });
  });
}


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
                // TODO : improve security as someone can respond to an invite before the real user !
                // 

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
                
                var query = 'CREATE (u:USER {email:{email}, password:{hashPassword}})-[:MEMBER {role:"member"}]->(g:GROUP {name:"SELF"}) return u';
                db.query(query, {email: email, hashPassword: hashPassword}, function(err,newuser) {
                	if (err)
                		done(err);
                	else 
                	 done(null, newuser);
                });
            }

        });  
},

verifyUser: function (username,password,callback) {

    
	db.find({'email': username}, 'USER', function(err, users) {
		console.log("verify user; err:"+err+"  users : "+users);
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

            // if no user is found, store the user information
            if (users.length==0) {
            	
                var query = 'CREATE (u:USER {email:{email}, token:{token}, googleid:{googleid}})-[:MEMBER {role:"member"}]->(g:GROUP {name:"SELF"}) return u';
                db.query(query, {email: email,token: token, googleid: googleid}, function(err,newuser) {
                	if (err)
                		return callback(err);
                	else 
                	 return callback(null,newuser);
                });

               
                 
             }

            // if user found return it
            var user=users[0];
            
         
            return callback(null, user);
        });
},



getTodos : function (user, timestamp,done) {
	
	// 
	
	var tasklist={};
	var query = 'MATCH (u:USER)-[:HASTO]-(t:TODO)--(g:GOAL) WHERE (id(u)={userid} AND (NOT EXISTS(t.dateRemind) OR (t.dateRemind < {timestamp}))) RETURN id(t) as id, t.title as title, t.done as done, t.description as description, t.instance as instance, t.execGroupRole as execGroupRole, t.execGroupName as execGroupName, t.occurrence as occurrence, t.taskform as taskform  ORDER BY t.dateDue ASC LIMIT 100 ';
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
					done(null,tasklist);
					
				}
			
	    });
		}
	});

},

getStartableActions : function (user,done) {
	// find all GOALTEMPLATE the user can start
     var queryActions='MATCH (u)-[m:MEMBER]-(g1:GROUP)-[a:ACTION]-(g:GOALTEMPLATE) WHERE id(u)={userid}   return g';
     db.query(queryActions, {userid: user.id},done);
},
getGoal : function (user,goalid,done) {
	// return the path of an ACTION 
	// ensure that current user is linked to the action in a way
   
    var action={};
    var querygoal='MATCH (u)-[*1..]->(g:GOALTEMPLATE)-[:START]->(s) WHERE id(u)={userid} AND id(g)={goalid} return g.userdataschema as userdataschema,id(g) as id, id(s) as startid, g.title as title, s.taskform as taskform';
    var querytask='MATCH (u)-[*1..]->(g:GOALTEMPLATE)-[:NEXT]->(t:TODO) WHERE id(u)={userid} AND id(g)={goalid} return t';
	var query = 'MATCH (u)-[*1..]->(g:GOALTEMPLATE)-[:NEXT*2..]->(t:TODO) WHERE id(u)={userid} AND id(g)={goalid} WITH t MATCH ()-[r]->(t)  return ( {from: id(startNode(r)), cond: r.cond, to: id(endNode(r))}) ';
	var query2 = 'MATCH (u)-[*0..]->(g:GOALTEMPLATE)-[:NEXT*1..]->(t:TODO)  WHERE id(u)={userid} AND id(g)={goalid} return id(t) as id, t.title as title';
	db.query(querygoal, {userid: user.id,goalid: goalid},function(err,data) {
		if (err) {
				done(err);
			} else {
				action.start={
					id: data[0].startid,
					taskform: data[0].taskform
				};
				action.goal={
					id: data[0].id,
					title: data[0].title,
					userdataschema: data[0].userdataschema,
				}
				db.query(querytask, {userid: user.id,goalid: goalid},function(err, data) {
					if (err) {
						done(err);
					} else {
						action.task=data[0];
						db.query(query, {userid: user.id,goalid: goalid},function(err, data) {
							if (err) {
								done(err);
							} else {
								
								action.path=data;
								db.query(query2, {userid: user.id,goalid: goalid},function(err, data) {
									if (err) {
										done(err)
									} else {
										
										action.steps=data;
										done(null,action);
										
									}
								
						    });
							}
						});
					}
				});
			}
    	});
	
},


createTask : function(user, task, done) {
    /*
       todo - add the createdby of goal when created.
    */
	if (task.distribution==undefined) {
		task.distribution="PERSO";
	} 
	if (task.userdataschema==undefined) {
		task.userdataschema="{}";
	} 
	// default goal title to task title
	if (task.goaltitle==undefined) {
		task.goaltitle=task.title;
	}
	
	if (task.distribution=="PERSO") {
          task.execUser=user.email;
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
    	// assuming the due date is the same day as the remind date
    	task.dateDue=task.dateRemind;
    	task.dateDueSpec=0; // same day so +0 days)
    	var d = new Date(task.dateRemind);
    	task.instance = d.toUTCString().substr(0,11); // set the instance name to be the remind date string
    }
	var set=[];
	
    set.push('t.dateCreated=timestamp()');
    var setgoal=[];
   
    //set.push('g.title="'+task.goaltitle+'" ');
     // build the set for  string properties only for the properties we want to store on the node TODO
    for (let att of ['description','distribution','createdFrom','execUser','execGroupName','execGroupRole',
    	'occurrence','repetitionWeek', 'repetitionMonth','doneBy','taskform']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'=\''+task[att]+'\'');
    	}
    }
    // build the set for non string properties only for the properties we want to store on the node
    for (let att of ['execGroupId','dateDue','dateRemind','dateDueSpec','repeatIndex','dateDone']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'='+parseInt(task[att]));
    	}
    }
    // build the set for  string properties for the node GOAL for the properties we want to store on the node
    // if the task has userdata then transfer to the goal
    // if the task has userdataschema then transfer to the goal
    for (let att of ['userdataschema','userdata']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		setgoal.push(' g.'+att+'=\''+task[att]+'\'');
    	}
    }

    

	if (task.occurrence == 'CHAINED') {
		console.log("Chained task ");
		
		var query = 'MATCH (u:USER)-[a:ACTION]-()-[:NEXT*0..]-(t1:TODO) WHERE id(u)={userid} AND id(t1)={taskid} WITH t1 ';
		// it is a CHAINED task so there is an instance.
		query+='MERGE (t1)-[r:NEXT]->(t:TODO {createdby:"'+user.email+'", title:"'+task.title+'", instance:"'+task.instance+'", topic:"'+task.topic+'", done: false}) ';
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
        // normal task creation
        
			if ((target=="GROUP") && (groupid!=undefined)) {
				var role="ANY";
		        if ( grouprole!=undefined) {
		        	role=grouprole;
		        }
		        // TO DO : ensure the calling user can act on this group

		      var query = 'MATCH (g1:GROUP) WHERE id(g1)='+groupid+' ';
		      // properties in the MATCH to insure creation of task with same title but different instance
			  query+='MERGE (g1)-[r:'+relation+' {role:"'+role+'"}]-(t:TODO {createdby:"'+user.email+'", title:"'+task.title+'"';
			  if (task.instance!=undefined)
			  	query +=', instance:"'+task.instance+'"';
			  if (task.topic!=undefined) 
			  	query+=', topic:"'+task.topic+'"';
			  query+=', done: false})';
			  //-[c:CONTRIBUTE]-(g:GOAL {title:"'+task.goaltitle+'"}) ';
			  if (task.goalid!=undefined) {
			  	query+=' WITH t MATCH (g:GOAL) WHERE id(g)='+task.goalid+' MERGE (t)-[c:CONTRIBUTE]-(g) ';
			  } else {
			  	query+='-[c:CONTRIBUTE]-(g:GOAL {title:"'+task.goaltitle+'" , instance:"'+task.instance+'"}) ';
			  	if (task.rootgoalid!=undefined) {
                   query+=' WITH t,g MATCH (rg:GOALTEMPLATE) WHERE id(rg)='+task.rootgoalid+' MERGE (rg)-[:INSTANCE]-(g) '
			  	}
			  }
			  query+='WITH  t,g SET '+set+' , '+setgoal+ ' RETURN t';
			
			} else {
		      var query = 'MATCH (u:USER) WHERE u.email="'+useremail+'" ';
			  query+='MERGE (u)-[r:'+relation+']-(t:TODO {createdby:"'+user.email+'", title:"'+task.title+'"';
			  if (task.instance!=undefined)
			  	query +=', instance:"'+task.instance+'"';
			  if (task.topic!=undefined) 
			  	query+=', topic:"'+task.topic+'"';
			  query+=', done: false})-[c:CONTRIBUTE]-(g:GOAL {title:"'+task.goaltitle+'"}) ';
			  query+='WITH  t,g SET '+set+' , '+setgoal+ ' RETURN t';
			
			}
			
			console.log("Creating task : "+task.title);
	        console.log("query: "+query);
			db.query(query, done);
		 // end of normal task creation
    }

},
createFlow : function(user, task, done) {
	
	if (task.distribution==undefined) { task.distribution="PERSO"; } 
	if (task.userdataschema==undefined) { task.userdataschema="{}"; } 
	// default goal title to task title
	//if (task.goaltitle==undefined) { task.goaltitle=task.title; }
	
	if (task.distribution=="PERSO") { task.execUser=user.email; }
    
    if (task.execGroupChoice=="ANY") { task.execGroupRole="ANY"; }
    
    // create start object from task properties 
    var start={};
    start.taskform=task.trigform;
    start.trigUser=task.trigUser;
    start.trigGroupRole=task.trigGroupRole;
    start.trigOption=task.trigOption;
    if (start.trigOption=="PERSO") {
          start.trigUser=user.email;
    } else {
    	if (start.trigGroupRole==undefined) {
    		start.trigGroupRole="ANY";
    	}
    }
    
    start.trigGroupId=task.trigGroupId;
   
	if (start.taskform==undefined) { start.taskform="{}"; }

	var set=[];
	
    set.push('t.dateCreated=timestamp()');
    var setgoal=[];
    var setstart=[];
    //set.push('g.title="'+task.goaltitle+'" ');
     // build the set for  string properties only for the properties we want to store on the node TODO
    for (let att of ['description','distribution','createdFrom','execGroupChoice','execUser','execGroupName','execGroupRole',
    	'occurrence','repetitionWeek', 'repetitionMonth','doneBy','taskform']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'=\''+task[att]+'\'');
    	}
    }
    // build the set for non string properties only for the properties we want to store on the node
    for (let att of ['execGroupId','dateDue','dateRemind','dateDueSpec','repeatIndex','dateDone']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'='+parseInt(task[att]));
    	}
    }
    // build the set for  string properties for the node GOAL for the properties we want to store on the node
    // if the task has userdata then transfer to the goal
    // if the task has userdataschema then transfer to the goal
    for (let att of ['userdataschema','userdata']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		setgoal.push(' g.'+att+'=\''+task[att]+'\'');
    	}
    }
    setgoal.push(' g.createdby=\''+user.email+'\'');

    // build the set for  string properties for the node START for the properties we want to store on the node
    
    
     for (let att of ['taskform','trigOption','trigGroupRole','trigUser']) {
    	
    	if ( start[att]!=undefined) {
    		console.log ("Attribute "+att);
    		setstart.push(' s.'+att+'=\''+start[att]+'\'');
    	}
    }
    for (let att of ['trigGroupId']) {
    	
    	if ( start[att]!=undefined) {
    		console.log ("Attribute "+att);
    		setstart.push(' s.'+att+'='+parseInt(start[att]));
    	}
    }
  
    
              
              groupid = start.trigGroupId; // using notion of starting a task
              useremail = start.trigUser;
              target = start.trigOption;
              role = start.trigGroupRole
              if (target=="GROUP")  {
				
		        // TO DO : ensure the calling user can act on this group

		      var query = 'MATCH (g1:GROUP) WHERE id(g1)='+groupid+' ';
		      // properties in the MATCH to insure creation of task with same title but different instance
			  query+='MERGE (g1)-[a:ACTION]-(g:GOALTEMPLATE {title:"'+task.goaltitle+'"})-[:START]-(s:TODO) WITH a,g,s MERGE (g)-[n:NEXT]-(t:TODO { title:"'+task.title+'" , done:false }) ';
			  
			  query+='WITH  a, s,t,g SET '+set+' , '+setgoal+' , '+setstart+ ', a.role="'+role+'" RETURN g';
			  
			
			} 
			console.log("Creating Flow Action : "+task.goaltitle);
	        console.log("query: "+query);
			db.query(query, done);

},

allocateTaskToUser : function(user, task, done) {


    var query ='MATCH (u:USER)-[:MEMBER]-(g:GROUP)-[r:HASTO]-(t:TODO) WHERE id(t)={taskid} and id(u)={userid} MERGE (u)-[l:HASTO]->(t) SET l=r WITH r DELETE r ';

     console.log("allocateTaskToUser query  : "+query);


	db.query(query , {userid: user.id, taskid: parseInt(task.id)}, done);


},
updateTask : function(user, taskid, task, done) {

	
// TODO : security update only element 'related' to  user 
// still to be difined 
	var query = 'MATCH (t:TODO)--(g:GOAL) WHERE id(t)='+taskid+'  SET ';
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
	// update userdata  to the goal
	if (task.userdata != undefined) {
		query+= ', g.userdata =\''+task.userdata+'\' ';
	}
	query+=' RETURN t';
	
	console.log("update task : "+taskid," - "+ task.title);


	db.query(query, done);


},
startFlow : function(user, action, done ) {
	// action contains goal with id, instance and userdata
	// 
    var task = action.task;
    // copy goaltitle to task.
    
    task.occurrence="NOW";
    task.instance=action.goal.instance;
    task.userdata=action.goal.userdata;
    task.userdataschema=action.goal.userdataschema;
    // link the task to the model

    task.createdFrom=task.id;
    task.rootgoalid=action.goal.id;
    task.goaltitle=action.goal.title;
    self.createTask(user,task,done);

},

setTaskDone : function(user, task,done) {
 
	task.done=true; // we may remove done by using dateDone !
	task.dateDone=Date.now();
	task.doneBy=user.email;
	// if the task is created from a task model then we have to update the task
	// and check if the model has a next task.
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
getTaskDetails : function(user, todo_id,done) {
	    
    var query = 'MATCH (t:TODO)--(g:GOAL) WHERE id(t)='+todo_id+'  RETURN id(t) as id, t.title as title, t.done as done, t.description as description, t.instance as instance, t.execGroupRole as execGroupRole, t.execGroupName as execGroupName, t.occurrence as occurrence, t.taskform as taskform, g.userdataschema as userdataschema, g.userdata as userdata, id(g) as goalid  LIMIT 1';
    console.log("query "+query);
    db.query(query, done);

},   

getAssets : function(user, done) {
	
	var query = 'MATCH (o:OBJECT)-[r:ISIN]-(l:LOCATION) WHERE o.createdby={createdby} return o.name AS object, l.name as location';
	db.query(query, {userid: user.id, createdby: user.email},done);


},
getGroups : function(user) {
	
	var query = 'MATCH (u:USER)-[m:MEMBER]-(g:GROUP) WHERE id(u)={userid} WITH m,g MATCH (g)-[:MEMBER]-(o:USER) return m.role as role,id(g) as id, g.name as name,g.createdby as createdby, count(o)-1 as othermemberscount';
    return cypherQuery(query,{userid: user.id});
	
},
addGroup : function(user, group, done) {
	// add or merge group
	// user creating a main group must have a role in it
	// user can create sub-groups
	// having a role in the sub-group you create is optional
	// so we have 3 cases : main group, sub-group with role, sub-group without rule
	if (group.role != undefined) 
		var role=group.role; 
		else
		var role = 'member';
	if (group.alias != undefined) 
		var alias=group.alias; 
		else
		var alias = user.email;
	if (group.parentGroupId != undefined) {
		var parentGroupId=parseInt(group.parentGroupId);
		if (group.role!= undefined) {
	      var query = 'MATCH (u:USER)-[*1..]-(pg:GROUP) WHERE id(u)={userid} AND id(pg)={groupid} MERGE (pg)-[:CONTAINS]-(g:GROUP {name:{groupName}, createdby:{createdby}}) WITH u,pg,g MERGE (u)-[m:MEMBER]-(g) set m.role={role}, m.alias={alias}, g.rootGroup=pg.rootGroup return id(pg) as parentGroupId, pg.name as parentGroup, id(g) as groupid, g.name as group, u.email as user, m.alias as alias, m.role as role';

		} else {	
	    var query = 'MATCH (u:USER)-[*0..]-(pg:GROUP) WHERE id(u)={userid} AND id(pg)={groupid} MERGE (pg)-[:CONTAINS]-(g:GROUP {name:{groupName}, createdby:{createdby}})  SET g.rootGroup=pg.rootGroup  return id(pg) as parentGroupId, pg.name as parentGroup, id(g) as groupid, g.name as group';
        }
		db.query(query, {userid: user.id, groupName: group.name, createdby: user.email, groupid: parentGroupId,role: role, alias: alias},done);

	} else {
	var query = 'MATCH (u:USER) WHERE id(u)={userid} MERGE (g:GROUP {name:{groupName}, createdby:{createdby}}) WITH u,g MERGE (u)-[m:MEMBER]-(g) set m.role={role}, m.alias={alias}, g.rootGroup=id(g) return u.email as user, m.alias as alias, m.role as role, g.name as group, id(g) as groupid';

	db.query(query, {userid: user.id, groupName: group.name, createdby: user.email, role: role, alias: alias},done);

	}


},
getUserInfo : function(user, done) {
	// return login info, emails, groups and roles, invites pending 
	var userinfo={};

         userinfo.login=true;
         userinfo.email=user.email;
         userinfo.name=user.name;
         userinfo.id=user.id;
        
      
	var query = 'MATCH (u:USER)-[m:MEMBER]-(g:GROUP) WHERE id(u)={userid} return m.alias as alias, m.role as role,id(g) as id, g.name as name,g.createdby as createdby';
    var queryInvites = 'MATCH (g:GROUP)-[r {state:"PENDING"}]-(u:INVITEE) WHERE u.email={email} return id(r) as id, r.role as role, id(g) as groupid, g.name as name,r.invitedby as invitedby';

	db.query(query, {userid: user.id},function(err, result) {
		if (err)
			done(err);
		userinfo.groups=result;
		db.query(queryInvites, {email: user.email},function(err, result) { 
			if (err)
				done(err);
			userinfo.invites=result;
			done(null,userinfo);
		});
		
	});


},
getGroup : function(user, groupid, done) {
    // return group information, list of roles and for each role list of members
    // login user has to be a member to be allowed to retrieve group information

	console.log("get group details for user "+user.id+" group "+groupid)
	var query = 'MATCH (u:USER)-[:MEMBER]-(g:GROUP) WHERE id(u)={userid} AND id(g)={groupid} WITH g MATCH (u2:USER)-[m:MEMBER]-(g) RETURN g.name as name, m.role as role, m.alias as alias, u2.email as email';

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
},

addInvite : function (user, invite, done) {
	if (invite.newrole != undefined) {
		invite.role=invite.newrole;
	}
    var query = 'MATCH (u:USER)-[:MEMBER]-(g:GROUP) WHERE id(u)={userid} AND id(g)={groupid} WITH g MERGE (u:INVITEE {email:{email}}) MERGE (g)-[i:INVITE {role:{role}}]-(u) set i.invitedby={email1}, i.state="PENDING" return g.name as name, id(g) as groupid, i.role as role, u.email as email ' ;
     db.query(query, {userid: user.id, groupid: invite.groupid, email1:user.email ,email: invite.email, role: invite.role}, done);   
},	
acceptInvite : function (user, invite, done) {
    if (invite.alias==undefined) {
    	invite.alias=user.email;
    }
    var query = 'MATCH (u:USER) WHERE id(u)={userid}  WITH u MATCH (g:GROUP)-[r:INVITE]-(i:INVITEE) WHERE i.email={email} AND id(r)={id}  MERGE (u)-[m:MEMBER {role:r.role}]-(g) set r.state="ACCEPTED", m.alias={alias} RETURN  g.name as name, g.createdby as createdby, m.role as role, m.alias as alias' ;
     db.query(query, {userid:user.id, email: user.email, id: invite.id, alias:invite.alias}, done);   
},
addDocumentToGoal : function (user, data, goalid, done) {
    // TODO - assert the realtion between user and given goal 
    var query = 'MATCH (g:GOAL) WHERE id(g)={goalid} MERGE (g)-[a:ATTACHMENT]-(d:DOCUMENT {title:{title}}) set a.by={userid}, a.dateAdded=timestamp(), d.mimetype={mimeType}, d.base64content={base64content} return g.title, d.title' ;
    var params=data;
    params.userid=user.id; 
    params.goalid=parseInt(goalid);
    db.query(query, params, done);   
}
}

module.exports = self;

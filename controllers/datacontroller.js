        


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
getActionsForTopic : function (user,topic,done) {
	// find taks related to user by ACTION and by NEXT relations
   

	var query = 'MATCH (u:USER)-[a:ACTION]-()-[:NEXT*0..]-(t:TODO) WHERE id(u)={userid} return t';
	db.query(query, {userid: user.id},done);
},
getStartableActions : function (user,done) {
	// find taks related to user by ACTION and by NEXT relations
     var queryActions='MATCH (u)-[m:MEMBER]-(g1:GROUP)-[a:ACTION]-(g:GOAL) WHERE id(u)={userid}   return g';
     db.query(queryActions, {userid: user.id},done);
},
getGoal : function (user,goalid,done) {
	// return the path of an ACTION 
	// ensure that current user is linked to the action in a way
   
    var action={};
    var querygoal='MATCH (u)-[*1..]->(g:GOAL)-[:START]->(s) WHERE id(u)={userid} AND id(g)={goalid} return g.userdataschema as userdataschema,s.id as id, g.title as title, s.taskform as taskform';
    var querytask='MATCH (u)-[*1..]->(g:GOAL)-[:NEXT]->(t:TODO) WHERE id(u)={userid} AND id(g)={goalid} return t';
	var query = 'MATCH (u)-[*1..]->(g:GOAL)-[:NEXT*2..]->(t:TODO) WHERE id(u)={userid} AND id(g)={goalid} WITH t MATCH ()-[r]->(t)  return ( {from: id(startNode(r)), cond: r.cond, to: id(endNode(r))}) ';
	var query2 = 'MATCH (u)-[*0..]->(g:GOAL)-[:NEXT*1..]->(t:TODO)  WHERE id(u)={userid} AND id(g)={goalid} return id(t) as id, t.title as title';
	db.query(querygoal, {userid: user.id,goalid: goalid},function(err,data) {
		if (err) {
				done(err);
			} else {
				action.start=data[0];
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
    	// assuming the due date is the same day as the remind date
    	task.dateDue=task.dateRemind;
    	task.dateDueSpec=0; // same day so +0 days)
    	var d = new Date(task.dateRemind);
    	task.instance = d.toUTCString().substr(0,11); // set the instance name to be the remind date string
    }
	var set=[];
	
    set.push('t.dateCreated=timestamp()');
    var setgoal=[];
    var setstart=[];
    //set.push('g.title="'+task.goaltitle+'" ');
     // build the set for  string properties only for the properties we want to store on the node TODO
    for (let att of ['description','distribution','createdFrom','execGroupChoice','execUser','execGroupName','execGroupRole',
    	'occurrence','repetitionWeek', 'repetitionMonth', 'trigOption','trigGroupRole','doneBy','taskform']) {
    	
    	if ( task[att]!=undefined) {
    		console.log ("Attribute "+att);
    		set.push(' t.'+att+'=\''+task[att]+'\'');
    	}
    }
    // build the set for non string properties only for the properties we want to store on the node
    for (let att of ['trigGroupId','execGroupId','dateDue','dateRemind','dateDueSpec','repeatIndex','dateDone']) {
    	
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
    // build the set for  string properties for the node START for the properties we want to store on the node
    
    	
    	if ( task["trigform"]!=undefined) {
    		console.log ("Attribute trigform");
    		setstart.push(' s.taskform=\''+task["trigform"]+'\'');
    	} else {
    		setstart.push(' s.taskform=\'{}\'');
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
        if ( task.occurrence == 'ATWILL') {
              
              groupid = task.trigGroupId; // using notion of starting a task
              useremail = task.trigUser;
              target = task.trigOption;
              grouprole = task.trigGroupRole
              if ((target=="GROUP") && (groupid!=undefined)) {
				var role="ANY";
		        if ( grouprole!=undefined) {
		        	role=grouprole;
		        }
		        // TO DO : ensure the calling user can act on this group

		      var query = 'MATCH (g1:GROUP) WHERE id(g1)='+groupid+' ';
		      // properties in the MATCH to insure creation of task with same title but different instance
			  query+='MERGE (g1)-[a:ACTION]-(g:GOAL {title:"'+task.goaltitle+'"})-[:START]-(s:TODO) WITH a,g,s MERGE (g)-[n:NEXT]-(t:TODO { title:"'+task.title+'" , done:false }) ';
			  
			  query+='WITH  a, s,t,g SET '+set+' , '+setgoal+' , '+setstart+ ', a.role="'+role+'" RETURN t';
			  
			
			} 
			console.log("Creating Goal Action : "+task.goaltitle);
	        console.log("query: "+query);
			db.query(query, done);
        }  else { // normal task creation
        
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
			  query+=', done: false})-[c:CONTRIBUTE]-(g:GOAL {title:"'+task.goaltitle+'"}) ';
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
		} // end of normal task creation
    }

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
startAction : function(user, action, done ) {
    var task = action.task;
    // copy goaltitle to task.
    task.goaltitle=action.title;
    task.occurrence="NOW";
    task.userdata=action.userdata;
    task.userdataschema=action.userdataschema;
    // link the task to the model
    task.createdFrom=task.id;
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
	
	console.log("Retrieving task  "+todo_id);
    
    var query = 'MATCH (t:TODO)--(g:GOAL) WHERE id(t)='+todo_id+'  RETURN id(t) as id, t.title as title, t.done as done, t.description as description, t.instance as instance, t.execGroupRole as execGroupRole, t.execGroupName as execGroupName, t.occurrence as occurrence, t.taskform as taskform, g.userdataschema as userdataschema, g.userdata as userdata  LIMIT 1';
    console.log("query "+query);
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
	if (group.knownAs != undefined) 
		var knownAs=group.knownAs; 
		else
		var knownAs = user.email;
	if (group.parentGroupId != undefined) {
		var parentGroupId=parseInt(group.parentGroupId);
		if (group.role!= undefined) {
	      var query = 'MATCH (u:USER)-[*0..]-(pg:GROUP) WHERE id(u)={userid} AND id(pg)={groupid} MERGE (pg)-[:CONTAINS]-(g:GROUP {name:{groupName}, createdBy:{createdBy}}) WITH u,pg,g MERGE (u)-[m:MEMBER]-(g) set m.role={role}, m.knownAs={knownAs}, g.rootGroup=pg.rootGroup return id(pg) as parentGroupId, pg.name as parentGroup, id(g) as groupId, g.name as group, u.email as user, m.knownAs as knownAs, m.role as role';

		} else {	
	    var query = 'MATCH (u:USER)-[*0..]-(pg:GROUP) WHERE id(u)={userid} AND id(pg)={groupid} MERGE (pg)-[:CONTAINS]-(g:GROUP {name:{groupName}, createdBy:{createdBy}})  SET g.rootGroup=pg.rootGroup  return id(pg) as parentGroupId, pg.name as parentGroup, id(g) as groupId, g.name as group';
        }
		db.query(query, {userid: user.id, groupName: group.name, createdBy: user.email, groupid: parentGroupId,role: role, knownAs: knownAs},done);

	} else {
	var query = 'MATCH (u:USER) WHERE id(u)={userid} MERGE (g:GROUP {name:{groupName}, createdBy:{createdBy}}) WITH u,g MERGE (u)-[m:MEMBER]-(g) set m.role={role}, m.knownAs={knownAs}, g.rootGroup=id(g) return u.email as user, m.knownAs as knownAs, m.role as role, g.name as group, id(g) as groupid';

	db.query(query, {userid: user.id, groupName: group.name, createdBy: user.email, role: role, knownAs: knownAs},done);

	}


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
},
// handle subjects : data concepts that a group can manipulate
getSubjects : function(user, groupid, done) {
	var query = 'MATCH (s:SUBJECT)<-[:USE]-(g:GROUP)-[*0..]->(g1:GROUP) where id(g1)={groupid} return s';
	db.query(query, {userid: user.id, groupid: groupid}, done);
	},
addSubject : function (user, groupid, subject, done) {
	

    var query = 'MATCH (u:USER)-[:MEMBER]-(g:GROUP) WHERE id(u)={userid} AND id(g)={groupid} WITH g MERGE (g)-[:USE]-(s:SUBJECT {name:{subjectName}}) SET s.fields={fields} return s' ;
     db.query(query, {userid: user.id, groupid: groupid, subjectName: subject.name, fields: subject.fields}, done);   
}	

}

module.exports = self;

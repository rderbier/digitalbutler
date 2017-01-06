        


var bcrypt   = require('bcrypt-nodejs');
var dataController=require('../controllers/datacontroller');
//
// configuration =================



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

getTasks : function(req, res) {
    dataController.getTodos(req.user,Date.now(),replyDbCallback(res));
},
getActionsForTopic : function (req,res) {
	// find taks related to user by ACTION and by NEXT relations
    var user = req.user;
    dataController.getActionsForTopic(user,req.params.topic,replyDbCallback(res));

},
getStartableActions : function (req,res) {
	// find taks related to user by ACTION and by NEXT relations
    var user = req.user;
    dataController.getStartableActions(user,replyDbCallback(res));

},
getAction : function (req,res) {
	// find taks related to user by ACTION and by NEXT relations
    var user = req.user;
    dataController.getAction(user,parseInt(req.params.action_id),replyDbCallback(res));

},

createTodo : function(req, res) {
	dataController.createTask(req.user,req.body, replyDbCallback(res));

},

startTask : function(req, res) {
	// create a task based ona task template
	var task=req.body;
	task.occurrence="NOW";  // change ATWILL from the template to NOW for this instance
	task.createdFrom=task.id; // trace the origin of this task

	dataController.createTask(req.user,task, replyDbCallback(res));
},
allocateTaskToUser : function(req, res) {

	var user = req.user;
	var task=req.body;
	dataController.allocateTaskToUser(user,task,replyDbCallback(res));


},

updateTodo : function(req, res) {
	var user = req.user;
	var task=req.body;
	dataController.updateTask(user,parseInt(req.params.todo_id), task, replyDbCallback(res))
},
setTaskDone : function(req, res) {
    var user = req.user;
	var task=req.body;
	dataController.setTaskDone(user,task,replyDbCallback(res));

	
},
purgePersonalTasksCtrl : function (req,res) {
    var user = req.user;
    var days=0; // TODO get this from the body ?
    dataController.purgePersonalTasks(user,days,replyDbCallback(res))
},
deleteTodo : function(req, res) {
	var user = req.user;
    dataController.deleteTodo(user,req.params.todo_id,replyDbCallback(res));

},   
getTaskDetails : function(req, res) {
	var user = req.user;
    dataController.getTaskDetails(user,req.params.todo_id,replyDbCallback(res));

}, 
getAssets : function(req, res) {
	var user = req.user;
	dataController.getAssets(user,replyDbCallback(res));
	


},
getGroups : function(req, res) {
	var user = req.user;
	dataController.getGroups(user,replyDbCallback(res));
	

},
addGroup : function(req, res) {
	var user = req.user;
	var group = req.body;
	dataController.addGroup(user,group,replyDbCallback(res));
	

},
getUserInfo : function(req, res) {
	var user = req.user;
	dataController.getUserInfo(user,replyDbCallback(res));

},
getGroup : function(req, res) {
    // return group information, list of roles and for each role list of members
    // login user has to be a member to be allowed to retrieve group information
	var user = req.user;
	var groupid=parseInt(req.params.group_id);
	dataController.getGroup(user, groupid, replyDbCallback(res));
	
},
getSubjects : function (req,res) {
	// find taks related to user by ACTION and by NEXT relations
    var user = req.user;
    dataController.getSubjects(user,parseInt(req.params.group_id),replyDbCallback(res));

},

addSubject : function(req, res) {
	dataController.addSubject(req.user,parseInt(req.params.group_id), req.body, replyDbCallback(res));

},
}

module.exports = self;

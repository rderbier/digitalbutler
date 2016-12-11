// todo.js
var app = angular.module('digitalbutler');

app.controller('newtaskController',['$rootScope','$scope', '$http', '$location', function newtaskController($rootScope, $scope, $http, $location) {
    $scope.newformvisible = true;
    if ($rootScope.newTask!=undefined) {
         $scope.newTask = $rootScope.newTask;
         $scope.newTask.occurrence = "NOW";
    } else {
       $scope.newTask = {
         occurrence: "NOW"
      };
    }
    $scope.formphase="title";
    var getGroupDetails = function(groupid) {
    	return ($http.get('/api/group/'+groupid));
		
    };
    var getActions = function(topic) {
    	return ($http.get('/api/actions/'));
		
    };
    $scope.taskSchema = {
          "type": "object",
          "title": "TODO",
          "properties": {
              "title":  {"type": "string"},
              "description":  {"type": "string"},
              "topic":  {"type": "string"},
              "instance":  {"type": "string"},
              "distribution": {"type": "string",
                  "enum": ["PERSO","GROUP"]
              },
              "execGroupId": {"type": "number"},
              "execGroupName": {"type": "string"},
              "execGroupRole": { "type": "string" },
              "execUser": { "type": "string" },
              "execGroupChoice": { "type": "string",
                  "enum": ["ANY","ROLE","NAMED"]},
              "trigOption": {"type": "string"},
              "trigGroupId": {"type": "number"},
              "trigGroupRole": { "type": "string" },
              "trigUser": { "type": "string" },
              "occurrence": { "type": "string",
                            "enum": ["NOW","DATE","EVERYDAY","EVERYWEEK","EVERYMONTH","ATWILL","CHAINED"]
                            },
              "repetitionWeek": {"type": "string"},
              "repetitionMonth": {"type": "integer", "minimum": 1,"maximum": 31},
              "chainedFrom": {"type": "number"},
              "duedate": {"type": "string"},
              "duedatestr" : {"type": "string"},
              "done": {
                  "name": "done",
                  "type": "string"
              }
            },
        "required": ["title"]
        };






$scope.taskExplanation = function (task) {
  // create a readable explanation of the task
  var str="Task "+task.title+" must be done "+task.occurrence+" by "+task.execGroupRole+" of group "+task.execGroupName;
  return str;
  } 




$scope.updateTask = function(task,form) {

    $http.put('/api/todo/'+task.id, task)
    .success(function(data) {
        
        console.log(data);
        $scope.getTodos();
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });
};
// handling the notifications from thenew task form 
var clearForm = function () {
	$scope.formphase="title";
	$scope.newTask = {
      occurrence: "NOW"
    };
};
var formDistributionSelected = function () {
	// after topic and distribution selected, check if next is when or group config
	var explanation = "Task '"+$scope.newTask.title+"' ";
    if ($scope.newTask.topic) explanation+= ", which is about '"+$scope.newTask.topic+"'";
	if ( $scope.newTask.distribution=="PERSO") {
	    $scope.formphase="when";
	    explanation+= " must be done by yourself ...";
    } else {
     	$scope.newTask.execGroupId=undefined;
   
    }

    $scope.newTask.explanation = explanation;

}
var formExecGroupSelected = function () {
	// after topic and distribution selected, check if next is when or group config
	var explanation = "Task '"+$scope.newTask.title+"' ";

    if ( $scope.newTask.execGroupId!=undefined) {
    	$scope.newTask.execGroupName=groupList[parseInt($scope.newTask.execGroupId)];
	    $scope.formphase="execgroup";
	    explanation+= " must be done by someone from group '"+$scope.newTask.execGroupName+"'"; 
	    execGroupRoleMap.splice(0,execGroupRoleMap.length);
	    execGroupUserMap.splice(0,execGroupUserMap.length)
	  
	    getGroupDetails($scope.newTask.execGroupId).success( function(group) {
	    	for (var r in group.roles) {
	    		execGroupRoleMap.push({ value: r, name: r });
	    		for ( var m in group.roles[r].members) {
	    			var u=group.roles[r].members[m];
	    			if (u.alias) {
                         execGroupUserMap.push({ value: u.email, name: u.alias+" - "+r });
	    			} else {
						execGroupUserMap.push({ value: u.email, name: u.email+" - "+r });
	    			}
	    			
	    		} 
	    	}
	    	
	    })

	    }
    
    

    $scope.newTask.explanation = explanation;

}
var formBack = function () { 
	if ($scope.formphase=='topic') {
		$scope.formphase='title';
	} else
	if ($scope.formphase=='when') {
		if ($scope.newTask.distribution=="PERSO") 
			$scope.formphase='topic';
		else
			$scope.formphase='execgroup';
	} else
    if ($scope.formphase=='execgroup') {
		$scope.formphase='topic';
    } else
    if ($scope.formphase=='atwill') {
		$scope.formphase='when';
    }
    else
    if ($scope.formphase=='chained') {
		$scope.formphase='when';
    }
};
var formNext = function () { 
	if ($scope.formphase=='title') {
		$scope.newTask.explanation = "Ok, lets configure the task '"+$scope.newTask.title+"'.";
	    $scope.formphase='topic';
	} else
	if ($scope.formphase=='topic') {
		if ($scope.newTask.distribution=="PERSO") 
			$scope.formphase='when';
		else
			$scope.formphase='execgroup';
	} else
	if ($scope.formphase=='execgroup') 		
			$scope.formphase='when';
};

var whenSelected = function () { 
	if ( $scope.newTask.occurrence=="ATWILL") {
		$scope.formphase='atwill';
	} else 
	if ( $scope.newTask.occurrence=="CHAINED") {
		actionsMap.splice(0,actionsMap.length)
		 getActions($scope.newTask.topic).success( function(actions) {
	    	for (var i in actions) {
	    		actionsMap.push({ value: actions[i].id, name: actions[i].title});
	    		
	    	}
	    	
	    });
		 $scope.formphase='chained';
		
    };
	
};
var trigOptionSelected = function () { 
	if ( $scope.newTask.trigOption=="PERSO") {
		//$scope.formphase='when';
	}
};
var trigGroupChoiceSelected = function () { 
	if ( $scope.newTask.trigGroupChoice=="ANY") {
		//$scope.formphase='when';
	}
};
var trigGroupRoleSelected = function () { 
	if ( $scope.newTask.trigGroupRole!=undefined) {
		//$scope.formphase='when';
	}
};
var trigGroupSelected = function () { 
	
	trigGroupRoleMap.splice(0,trigGroupRoleMap.length)
	getGroupDetails($scope.newTask.trigGroupId).success( function(group) {
	    	for (var r in group.roles) {
	    		trigGroupRoleMap.push({ value: r, name: r });
	    		
	    	}
	    	
	    })
};
// when submitting the add form, send the text to the node API
$scope.addTask = function(task,form) {
      if(task.duedate) {
        task.duedateStr=Date.parse(task.duedate);
      }
        if (task.execGroupId!=undefined) {
             task.execGroupName=groupList[parseInt(task.execGroupId)];
        }

        $http.post('/api/todos', task)
        .success(function(data) {
                $scope.newTask = {occurrence: "NOW"}; // clear the form so our user is ready to enter another              
                $rootScope.alert.msg="Task has been created.";
                $rootScope.alert.type="info";
                $location.path("/todos");
            })
        .error(function(data) {
            console.log('Error: ' + data);
            $scope.alert.msg=data.message;
        });
    };

    var groupMap=  [];
    var execGroupRoleMap=[];
    var execGroupUserMap=[];
    var trigGroupRoleMap=[];
    var actionsMap=[];

    var groupList={};

init = function() {
        for (var g in $scope.userinfo.groups) {
          groupMap.push({ value: $scope.userinfo.groups[g].id, name: $scope.userinfo.groups[g].name }); 
          groupList[parseInt($scope.userinfo.groups[g].id)]=$scope.userinfo.groups[g].name;
        }


    	$scope.taskFormTitle = [

          {
            key : "title",
            title: "What has to be done ?"

          },
          {
            key : "description",
            title: "Any details or instruction ?"

          },
          {
            type: "actions",
            condition:"(newTask.title!=undefined) ",
            items: [
              { type: "submit", title: "Create", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},
              { type: "button", title: "More details", style: "btn-info", onClick: formNext},
              { type: "button", title: "Cancel", style: "btn-info", onClick: clearForm}
            ]
          },
          ];
    	$scope.taskFormTopic = [ 

          {
            key : "topic",
            title: "Enter a topic to link tasks together (optional) "
            
          },
          {
            "title": "Who should do this task ?",
            "key": "distribution",
            "type": "radios",
            "titleMap": [
                {"value": "PERSO", "name": "Myself"},
                {"value": "GROUP", "name": "Somebody from one on my groups"}
              ],
            onChange: formDistributionSelected,
            "notitle": false
          },
          {
          	"condition": "newTask.distribution=='GROUP'",
            "key": "execGroupId",
            "title": "Specify which group :",     
             type: "select",
             titleMap: groupMap,
             onChange: formExecGroupSelected
         },
         {
            type: "actions",
            condition:"(newTask.distribution==undefined) ",
            items: [
              
              { type: "button", title: "back", style: "btn-info", onClick: formBack}
            ]
          },
          {
            type: "actions",
            condition:" (newTask.distribution!=undefined) ",
            items: [ 
              { type: "button", title: "back", style: "btn-info", onClick: formBack},
              { type: "button", title: "next", style: "btn-info", onClick: formNext}
            ]
          }
                
          ];

        $scope.taskFormWhen = [
                  {
            "condition": "(newTask.distribution=='PERSO')",
            "title": "When do you want to work on this task ?",
            "key": "occurrence",
            "type": "select",
            "titleMap": [
                {"value": "NOW", "name": "later"},
                {"value": "DATE", "name": "on date"},
                {"value": "EVERYDAY", "name": "every day"},
                {"value": "EVERYWEEK", "name": "every week"},
                {"value": "EVERYMONTH", "name": "every month"},
                {"value": "ATWILL", "name": "when someone is requesting"},
                {"value": "CHAINED", "name": "when another task is done"},
              ],
            "notitle": false,
            onChange: whenSelected
          },
          {
            "condition": "(newTask.distribution=='GROUP')",
            "title": "When do you want people to work on this task ?",
            "key": "occurrence",
            "type": "select",
            "titleMap": [
                {"value": "NOW", "name": "asap"},
                {"value": "DATE", "name": "on date"},
                {"value": "EVERYDAY", "name": "every day"},
                {"value": "EVERYWEEK", "name": "every week"},
                {"value": "EVERYMONTH", "name": "every month"},
                {"value": "ATWILL", "name": "when someone is requesting"},
                {"value": "CHAINED", "name": "when another task is done"},
              ],
            "notitle": false,
            onChange: whenSelected
          },
          {

            "key": "duedate",
            "condition": "newTask.occurrence=='DATE'"
          },
          {

            "key": "repetitionWeek",
            "title":"which day of the week ?",
            "condition": "newTask.occurrence=='EVERYWEEK'",
            "type": "select",
            "titleMap": [
                {"value": "1", "name": "Monday"},
                {"value": "2", "name": "Tuesday"},
                {"value": "3", "name": "Wednesday"},
                {"value": "4", "name": "Thursday"},
                {"value": "5", "name": "Friday"},
                {"value": "6", "name": "Saturday"},
                {"value": "7", "name": "Sunday"},
              ]
          },
          {

            "key": "repetitionMonth",
            "title":"which day of the month ?",
            "condition": "newTask.occurrence=='EVERYMONTH'"
            

          },
          {
            type: "actions",
            condition:"(newTask.occurrence=='NOW') || (newTask.occurrence=='EVERYDAY') ||(newTask.duedate!=undefined) || (newTask.repetitionWeek!=undefined) || (newTask.repetitionMonth!=undefined)",
            items: [
              { type: "button", title: "back", style: "btn-info", onClick: formBack},
              { type: "submit", title: "Create", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},
              
            ]
          },
          {
            type: "actions",
            condition:"!((newTask.occurrence=='NOW') || (newTask.occurrence=='EVERYDAY') ||(newTask.duedate!=undefined) || (newTask.repetitionWeek!=undefined) || (newTask.repetitionMonth!=undefined))",
            items: [
              { type: "button", title: "back", style: "btn-info", onClick: formBack},
              
            ]
          }
          ]
        $scope.taskFormExecGroup = [
        		{
                  "title": "Who in the group ?",
                  "key": "execGroupChoice",
                  "condition": "newTask.execGroupId!=undefined",
                  "type": "radios",
                  "titleMap": [
                    { "value": "ANY","name": "Anyone in the group" },
                    { "value": "ROLE","name": "Anyone with specific role" },
                    { "value": "NAMED","name": "specific member" },
                  ]
                },
                {
                  "title": "Which role in the group ?" ,
                  "key": "execGroupRole",
                  "condition": "newTask.execGroupChoice=='ROLE'",
                  type: "select",
                  titleMap: execGroupRoleMap
                },
                {
                  "title": "Who from the group ?",
                  "key": "execGroupUser",
                  "condition": "newTask.execGroupChoice=='NAMED'",
                  type: "select",
                  titleMap: execGroupUserMap  
                },
                {
		            type: "actions",
		            condition:"(newTask.occurrence=='NOW') || (newTask.occurrence=='EVERYDAY') || (newTask.repetitionWeek!=undefined) || (newTask.repetitionMonth!=undefined)",
		            items: [
		              { type: "button", title: "Back", style: "btn-info", onClick:formBack},
		              { type: "button", title: "Next", style: "btn-info", onClick: function () {$scope.formphase="when";}},
		              
		               
		            ]
		          }
        ];
        $scope.taskFormAtwill = [
           {

            "key": "trigOption",
            "title": "So who can decide to request to do this task ?",
            "condition": "newTask.occurrence=='ATWILL'",
            "type": "radios",
            "titleMap": [
                {"value": "PERSO", "name": "Myself"},
                {"value": "GROUP", "name": "Somebody from one of my groups"}
              ],
            onChange: trigOptionSelected
          },
          {
            type: "fieldset",
            "condition": "newTask.trigOption=='GROUP'",
            items: [
                
                {
                  "key": "trigGroupId",
                  "title": "Specify which group :",
                  
                  type: "select",
                  titleMap: groupMap,
                  onChange: trigGroupSelected
                },
                {
                  "title": "Who in the group ?",
                  "key": "trigGroupChoice",
                  "condition": "newTask.trigGroupId!=undefined",
                  "type": "radios",
                  onChange: trigGroupChoiceSelected,
                  "titleMap": [
                    { "value": "ANY","name": "Anyone in the group" },
                    { "value": "ROLE","name": "Anyone with specific role" }
                  ]
                },
                {
                  "title": "Which role in the group ?" ,
                  "key": "trigGroupRole",
                  type: "select",
                  titleMap: trigGroupRoleMap,
                  "condition": "newTask.trigGroupChoice=='ROLE'",
                  onChange: trigGroupRoleSelected  
                }
            ]
          },
          {
            type: "actions",
            condition: "!((newTask.trigOption=='PERSO') || (newTask.trigGroupChoice=='ANY') || (newTask.trigGroupRole!=undefined))",

            items: [
              { type: "button", title: "back", style: "btn-info", onClick: formBack},
              
            ]
          },
          {
            type: "actions",
            condition: "(newTask.trigOption=='PERSO') || (newTask.trigGroupChoice=='ANY') || (newTask.trigGroupRole!=undefined)",
            items: [
              { type: "button", title: "back", style: "btn-info", onClick: formBack},
              { type: "submit", title: "create task", style: "btn-info"},
              
            ]
          }

        ];
        // panel chained tasks
        $scope.taskFormChained = [
        	{

            "key": "chainedFrom",
            "title": "Select the event which will trigger this task ",
            "type": "select",
            "titleMap": actionsMap
          },
          {
            type: "actions",
            condition: "(newTask.chainedFrom==undefined)",

            items: [
              { type: "button", title: "back", style: "btn-info", onClick: formBack},
              
            ]
          },
          {
            type: "actions",
            condition: "(newTask.chainedFrom!=undefined)",
            items: [
              { type: "button", title: "back", style: "btn-info", onClick: formBack},
              { type: "submit", title: "create task", style: "btn-info"},
              
            ]
          }
           ];



      // add button to the form
      //var actions=
      
      //$scope.newTaskForm.push(actions);
    }
    // retireve todos to init the view 
          // when landing on the page, get all todos and show them
    $http.get('/api/userinfo')
        .success(function(data) {
           if (data.login == true ) {
            $scope.userinfo = data;
            //clearForm();
            init();
           } else {
           	$location.path("/");
           }
            
            
        })
        .error(function(data) {
            $scope.userinfo={login: false}
            $location.path("/");
            console.log('Error: ' + data);
        });
    
}])
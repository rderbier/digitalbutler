// todo.js
var app = angular.module('digitalbutler');

app.controller('todoController',['$scope', '$http', function todoController($scope, $http) {
    $scope.newformvisible = false; 
    $scope.newTask = {
      occurrence: "NOW"
    };
    $scope.showResult=false;
    $scope.taskSchema = {
          "type": "object",
          "title": "TODO",
          "properties": {
              "title":  {"type": "string"},
              "description":  {"type": "string"},
              "distribution": {"type": "string",
                  "enum": ["PERSO","GROUP"]
              },
              "execGroupId": {"type": "number"},
              "execGroupName": {"type": "string"},
              "execGroupRole": { "type": "string" },
              "execUser": { "type": "string" },
              "execGroupChoice": { "type": "string",
                  "enum": ["ANY","ROLE","NAMED"]},
              "trigGroupId": {"type": "number"},
              "trigGroupRole": { "type": "number" },
              "trigUser": { "type": "string" },
              "occurrence": { "type": "string",
                            "enum": ["NOW","DATE","EVERYDAY","EVERYWEEK","EVERYMONTH","ATWILL","CHAINED"]
                            },
              "repetitionWeek": {"type": "string"},
              "repetitionMonth": {"type": "integer", "minimum": 1,"maximum": 31},
              "duedate": {"type": "string"},
              "duedatestr" : {"type": "string"},
              "done": {
                  "name": "done",
                  "type": "string"
              }
            },
        "required": ["title"]
        };
var groupMap=  [];
var groupList={};
for (var g in $scope.userinfo.groups) {
  groupMap.push({ value: $scope.userinfo.groups[g].id, name: $scope.userinfo.groups[g].name }); 
  groupList[parseInt($scope.userinfo.groups[g].id)]=$scope.userinfo.groups[g].name;
}


$scope.taskActionDetailsForm =  [
    {"key": "description",readonly: true},
    {
      "key": "instance",
      "title": "Enter a title for this instance of task",
      "type": "text"     
    },
    {
      type: "actions",
      items: [
      { type: "button", title: "Create an instance of this task", onClick: function () {$scope.startAction($scope.currentTask)}}
      ]
    }
    ];
$scope.taskSelfDetailsForm =  [
    {"key": "description",readonly: true},
    "comment",
    {
      type: "actions",
      items: [
      { type: "button", title: "Done", onClick: function () {$scope.setTaskDone($scope.currentTask)}}
      ]
    }
    ];
$scope.taskGroupDetailsForm =  [
    {"key": "description",readonly: true},
    {
      type: "actions",
      items: [
      { type: "button", title: "Will do it", onClick: function () {$scope.allocateTaskToMe($scope.currentTask)}},
      { type: "button", title: "Done", onClick: function () {$scope.setTaskDone($scope.currentTask)}}
      ]
    }
    ];
var taskForm = [
    {
      type: "help",
          helpvalue: "<h2>Enter task details</h2>"
        },
    "title",
    "description",


    {
      "title": "Who should do this task ?",
      "condition": "newTask.title!=undefined",
      "key": "distribution",
      "type": "radios",
      "titleMap": [
          {"value": "PERSO", "name": "Myself"},
          {"value": "GROUP", "name": "Somebody from one on my groups"}
        ],
      "notitle": false
    },
    {
      type: "fieldset",
      "condition": "newTask.distribution=='GROUP'",
      items: [
          
          {
            "key": "execGroupId",
            "title": "Specify which group :",
            
            type: "select",
            titleMap: groupMap
          },
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
            "condition": "newTask.execGroupChoice=='ROLE'"   
          },
          {
            "title": "Who from the group ?",
            "key": "execGroupUser",
            "condition": "newTask.execGroupChoice=='NAMED'"   
          },
      ]
    },
    

    {
      "condition": "(newTask.distribution=='GROUP') && ((newTask.execGroupChoice=='ANY')||(newTask.execGroupRole!=undefined)||(newTask.execGroupUser!=undefined))",
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
      "notitle": false
    },
    {
      "condition": "(newTask.title!=undefined) && (newTask.distribution=='PERSO')",
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
      "notitle": false
    },
    {

      "key": "trigOption",
      "title": "So who can decide to request to do this task ?",
      "condition": "newTask.occurrence=='ATWILL'",
      "type": "radios",
      "titleMap": [
          {"value": "PERSO", "name": "Myself"},
          {"value": "GROUP", "name": "Somebody from one on my groups"}
        ],
      
    },
    {
      type: "fieldset",
      "condition": "newTask.trigOption=='GROUP'",
      items: [
          
          {
            "key": "trigGroupId",
            "title": "Specify which group :",
            
            type: "select",
            titleMap: groupMap
          },
          {
            "title": "Who in the group ?",
            "key": "trigGroupChoice",
            "condition": "newTask.trigGroupId!=undefined",
            "type": "radios",
            "titleMap": [
              { "value": "ANY","name": "Anyone in the group" },
              { "value": "ROLE","name": "Anyone with specific role" }
            ]
          },
          {
            "title": "Which role in the group ?" ,
            "key": "trigGroupRole",
            "condition": "newTask.trigGroupChoice=='ROLE'"   
          }
      ]
    },
    {

      "key": "duedate",
      "condition": "newTask.occurrence=='DATE'",
      "destroyStrategy": "retain"
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
      
    }
    ];

$scope.newTaskForm = taskForm;
// add button to the form
var actions=
{
  type: "actions",
  items: [
    { type: "submit", title: "Save", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},
    { type: "button", title: "Cancel", style: "btn-info", onClick:function () { $scope.newformvisible=false;}}
  ]
}
$scope.newTaskForm.push(actions);

$scope.taskExplanation = function (task) {
  // create a readable explanation of the task
  var str="Task "+task.title+" must be done "+task.occurrence+" by "+task.execGroupRole+" of group "+task.execGroupName;
  return str;
  } 

    // when landing on the page, get all todos and show them
$scope.getTodos = function() {
        $http.get('/api/todos')
        .success(function(data) {
          //$scope.todos.clear();
          for (var t in data.me) {
               var task = data.me[t];
               var str=$scope.taskExplanation(task);
               task.explanation=str;
               if (task.duedate) {
                  var d=new Date(task.duedate);
                  task.duedatestr=d.toUTCString().substr(0,11);
               }
            }
          for (var t in data.group) {
               var task = data.group[t];
               var str=$scope.taskExplanation(task);
               task.explanation=str;
               if (task.duedate) {
                  var d=new Date(task.duedate);
                  task.duedatestr=d.toUTCString().substr(0,11);
               }
            }
            $scope.todos = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }

  // when submitting the add form, send the text to the node API
  $scope.showTaskDetails = function(task) {
    $scope.currentTask = task;  
    $scope.newformvisible = false;   
};
$scope.showFormNewTask = function(task) {
    $scope.newformvisible = true; 
    $scope.currentTask = null;    
};
// when submitting the add form, send the text to the node API
$scope.setTaskDone = function(task,form) {
      task.done=true;
      $scope.updateTask(task,form);
  }
$scope.allocateTaskToMe = function(task,form) {

    $http.put('/api/allocatetome/'+task.id, task)
    .success(function(data) {
        $scope.todos = data;
        console.log(data);
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });
};
$scope.updateTask = function(task,form) {

    $http.put('/api/todo/'+task.id, task)
    .success(function(data) {
        $scope.todos = data;
        console.log(data);
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });
};
    // when submitting the add form, send the text to the node API
    $scope.addTask = function(task,form) {
      if(task.duedate) {
        task.duedate=Date.parse(task.duedate);
      }
        if (task.execGroupId!=undefined) {
             task.execGroupName=groupList[parseInt(task.execGroupId)];
        }

        $http.post('/api/todos', task)
        .success(function(data) {
                $scope.newTask = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                $scope.newformvisible = false;
                console.log(data);
            })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
    	console.log("deleting node "+id);
        $http.delete('/api/todos/' + id)
        .success(function(data) {
            $scope.todos = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    };
    // retireve todos to init the view 
    $scope.getTodos();
}])
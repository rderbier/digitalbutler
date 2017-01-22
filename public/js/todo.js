// todo.js
var app = angular.module('digitalbutler');

app.controller('todoController',['$scope', '$rootScope','$http', '$location', function todoController($scope, $rootScope, $http, $location) {
    $scope.newformvisible = false; 
    $scope.newTask = {
      occurrence: "NOW"
    };
    $scope.showResult=false;
    $rootScope.menu=[];
    $rootScope.menu.push({label:'new task', fa:'fa-plus-circle', href:'/#/newtask'});
    $rootScope.menu.push({label:'actions', fa:'fa-cogs', href:'/#/actions'});
    
    $rootScope.launchMenu=function(m) {

    }  
    
    opentask = function (){
      $location.path("/opentask/"+$scope.currentTask.id);
    } 
    
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
              "trigGroupId": {"type": "number"},
              "trigGroupRole": { "type": "number" },
              "trigUser": { "type": "string" },
              "occurrence": { "type": "string",
                            "enum": ["NOW","DATE","EVERYDAY","EVERYWEEK","EVERYMONTH","ATWILL","CHAINED"]
                            },
              "repetitionWeek": {"type": "string"},
              "repetitionMonth": {"type": "integer", "minimum": 1,"maximum": 31},
              "duedate": {"type": "string", "format":"date-time"},
              "duedatestr" : {"type": "string"},
              "done": {
                  "name": "done",
                  "type": "string"
              }
            },
        "required": ["title"]
        };



$scope.taskActionDetailsForm =  [
    {"key": "description",readonly: true},
    {
      "key": "instance",
      "title": "Enter a title for this instance of task",
      "type": "text"     
    }

    ];
$scope.taskSelfDetailsForm =  [
    {"key": "description",condition:"todo.description!=null", readonly: true},
    {"key":"instance",condition:"todo.instance!=null",readonly: true},
    {
      type: "help",
      condition: "(todo.done!=true) && (todo.taskform==null)",
      helpvalue: "Just tell me when done ..."
    },
    {
      type: "actions",
      condition: "(todo.done!=true) && (todo.taskform==null)",
      items: [
      { type: "submit", title: "Done" }
      ]
    },
    {
      type: "help",
      condition: "(todo.done!=true) && (todo.taskform!=null)",
      helpvalue: "You have few things to enter to complete this task ..."
    },
    {
      type: "actions",
      condition: "(todo.done!=true) && (todo.taskform!=null)",
      items: [
      { type: "button", title: "Work on it", onClick: opentask }
      ]
    },
    {
      type: "actions",
      condition: "todo.done==true",
      items: [
      { type: "submit",  title: "Hide this task"}
      ]
    }
    ];
$scope.taskGroupDetailsForm =  [
    {"key": "description",readonly: true},
    {
      type: "actions",
      items: [
      { type: "submit", title: "Will do it"}
      ]
    }
    ];
 
$scope.setTaskStrings = function (task) {
  // create a readable explanation of the task
  var role=" anyone ";
    if (task.execGroupRole!="ANY") {
      role = " any "+task.execGroupRole+" ";
    }
  var str="Task "+task.title+" must be done "+task.occurrence+" by "+role+" from group "+task.execGroupName;
  task.explanation=str;
  var header=task.title;
  if ( task.instance ) {
    header+=" - "+task.instance;
  }
  if ( task.duedatestr ) {
    header+=" due "+task.duedatestr;
  }
 
  if (task.distribution=="GROUP") { 
    
    header+=" sent to "+role+" of group "+task.execGroupName;
  }
  
  task.header=header;
  
  } 

    // when landing on the page, get all todos and show them
$scope.getTodos = function() {
        var mytasks=0;
        var mydone=0;
        $http.get('/api/todos')
        .success(function(data) {
          //$scope.todos.clear();
          for (var t in data.me) {
               var task = data.me[t];
               
               if (task.done==true) { 
                  mydone+=1
                } else {
                  mytasks+=1
                };

               $scope.setTaskStrings(task);
               
            }
            data.mytasks=mytasks;
            data.mydone=mydone;
          for (var t in data.group) {
               var task = data.group[t];
               
               
               $scope.setTaskStrings(task);
            }
            $scope.todos = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }
$scope.getActions = function() {

        $http.get('/api/actions')
        .success(function(data) {
          //$scope.todos.clear();
          
               $scope.actions = data;
               
            })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }

  // when submitting the add form, send the text to the node API
$scope.showMyTaskDetails = function(task) {
     
    $scope.newformvisible = false; 
    $scope.mytaskOpened=false;
    $scope.userdataschema={
          "type": "object",
          "title": "TODO",
          readonly: false, 
          "properties": {
              "customername":  {"type": "string"}
            }
          };

    //$scope.userdataschema=JSON.parse('{ "type": "object", "title": "data","properties":{"customer_name":  {"type": "string"},"entry_date":  {"type": "string"}}}');  
    $scope.taskform=["customername",     {
      type: "actions",
      items: [
      { type: "submit",  title: "Hide this task"}
      ]
    }];
    $scope.userdata={"customername": "test"};
    $scope.currentTask = task; 
};
  $scope.showGroupTaskDetails = function(task) {
    $scope.currentGroupTask = task;  
    $scope.newformvisible = false; 
    $scope.mytaskOpened=false;  
};

// TODO : don't need the whole detail here, just show the description / message ?
$scope.getActionDetails=function(action) {
  // complete the form
  if ($scope.currentAction!=action.id) {
    var fieldList = action.field.split(',');
    for (f in fieldList) {
      $scope.taskActionDetailsForm.push(
        {
        key: "attribute-"+f,
        title: fieldList[f],
        type: "text"
      }
      );
    }
    
    $scope.taskActionDetailsForm.push(
        {
        type: "actions",
        items: [
        { type: "submit", title: "Create an instance of this task"}
        ]
      }
    );
    // build the story from action graph

    $scope.currentActionUseCase={"main":[]};

    $http.get('/api/action/'+action.id)
      .success(function(data) {
          
          console.log(data);
          // building the use case from the graph representation
          // we get a list of from-relation-to  segement

          var story=[];
          if (data.length > 0) {
            story.push(data[0].from);
            story.push(data[0].to);
          }
          for (i=1; i<data.length; i++) {
             var title=data[i].from.title;
             for (j=0;j<story.length;j++) {
                 if (story[j].title==title) {
                     story.splice(j+1,0,data[i].to);
                     break;
                 }
             }

          }
          $scope.currentActionUseCase.main=story;
          $scope.currentAction=action.id;
          
      })
    }
}
// when submitting the add form, send the text to the node API
$scope.setTaskDone = function(task,form) {
      if (task.done==true) {
        deleteTodo(task);
      } else {
        task.done=true;
        markTaskAsDone(task);
      }
  }
  // when submitting the add form, send the text to the node API
$scope.checkTask = function(task,$event) {
      if (task.done==true) {
        
      } else {
        task.done=true;
        markTaskAsDone(task);
        $event.stopPropagation();
      }
  }
$scope.allocateTaskToMe = function(task,form) {

    $http.put('/api/allocatetome/'+task.id, task)
    .success(function(data) {
        
        console.log(data);
        $scope.getTodos();
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });
};
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
markTaskAsDone = function(task) {

    $http.put('/api/taskdone/'+task.id, task)
    .success(function(data) {
        
        console.log(data);
        $scope.getTodos();
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });
};
$scope.purgeTasks = function() {

    $http.put('/api/taskpurge')
    .success(function(data) {
        
        console.log(data);
        $scope.getTodos();
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
                $scope.newformvisible = false;

                $scope.getTodos();
            })
        .error(function(data) {
            console.log('Error: ' + data);
            $scope.alert.msg=data.message;
        });
    };

    // delete a todo after checking it
deleteTodo = function(task) {

    	console.log("deleting node "+task.id);
        $http.delete('/api/todo/' + task.id)
        .success(function(data) {
            console.log(data);
            $scope.getTodos();
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    };

    var groupMap=  [];
    var groupList={};
    $scope.mytaskOpened=false;
    init = function() {
        for (var g in $scope.userinfo.groups) {
          groupMap.push({ value: $scope.userinfo.groups[g].id, name: $scope.userinfo.groups[g].name }); 
          groupList[parseInt($scope.userinfo.groups[g].id)]=$scope.userinfo.groups[g].name;
        }

        var taskForm = [
          {
            type: "help",
                helpvalue: "<h2>Enter task details</h2>"
              },
          {
            key : "title",
            title: "What has to be done ?"

          },
          {
            key : "description",
            title: "Any details or instruction ?"

          },
          {
            key : "topic",
            title: "Enter a topic to link tasks together (optional) ",
            condition:"newTask.advanced==true"
          },
          {
            "title": "Who should do this task ?",
            "condition": "(newTask.advanced==true)",
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
            

          },
          {
            type: "actions",
            condition:"(newTask.title!=undefined) && (newTask.advanced!=true)",
            items: [
              { type: "submit", title: "Create", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},
              { type: "button", title: "More details", style: "btn-info", onClick:function () { $scope.newTask.advanced=true;}},
              { type: "button", title: "Cancel", style: "btn-info", onClick:function () { $scope.newformvisible=false;}}
            ]
          },
          {
            type: "actions",
            condition:"(newTask.title!=undefined) && (newTask.advanced==true)",
            items: [
              { type: "submit", title: "Save", style: "btn-info" ,icon: "glyphicon glyphicon-icon-exclamation-sign"},
             
              { type: "button", title: "Cancel", style: "btn-info", onClick:function () { $scope.newformvisible=false;}}
            ]
          },
          {
            type: "actions",
            condition:"(newTask.title==undefined) ",
            items: [

              { type: "button", title: "Cancel", style: "btn-info", onClick:function () { $scope.newformvisible=false;}}
            ]
          }        
          ];

      $scope.newTaskForm = taskForm;
      // add button to the form
      //var actions=
      
      //$scope.newTaskForm.push(actions);
    }
    // retireve todos to init the view 
          // when landing on the page, get all todos and show them
    $http.get('/api/userinfo')
        .success(function(data) {

            $scope.userinfo = data;
            init();
            $scope.getTodos();
            $scope.getActions();
            
        })
        .error(function(data) {
            $scope.userinfo={login: false}
            $location.path("/");
            console.log('Error: ' + data);
        });
    
}])
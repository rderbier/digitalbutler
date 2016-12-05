// todo.js
var app = angular.module('digitalbutler');

app.controller('newtaskController',['$scope', '$http', function newtaskController($scope, $http) {
    $scope.newformvisible = true; 
    $scope.newTask = {
      occurrence: "NOW"
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
                $scope.newTask = {occurrence: "NOW"}; // clear the form so our user is ready to enter another              
                $scope.message="Task has been created.";
            })
        .error(function(data) {
            console.log('Error: ' + data);
            $scope.alert.msg=data.message;
        });
    };

    var groupMap=  [];
    var groupList={};

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
            
            
        })
        .error(function(data) {
            $scope.userinfo={login: false}
            $location.path("/");
            console.log('Error: ' + data);
        });
    
}])
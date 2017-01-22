// todo.js
var app = angular.module('digitalbutler');

app.controller('opentaskController',['$scope', '$rootScope','$http', '$location', '$routeParams', function todoController($scope, $rootScope, $http, $location, $routeParams) {
  $rootScope.menu=[];
  $rootScope.menu.push({label:'Personal tasks', fa:'fa-list-ul', href:'/#/todos'});
  $scope.taskSchema = {
    "type": "object",
    "title": "TODO",
    "properties": {
      "title":  {"type": "string"},
      "description":  {"type": "string"},
      "topic":  {"type": "string"},
      "instance":  {"type": "string"},
      "distribution": {"type": "string", "enum": ["PERSO","GROUP"]},
      "execGroupId": {"type": "number"},
      "execGroupName": {"type": "string"},
      "execGroupRole": { "type": "string" },
      "execUser": { "type": "string" },
      "execGroupChoice": { "type": "string",
      "enum": ["ANY","ROLE","NAMED"]},
      "trigGroupId": {"type": "number"},
      "trigGroupRole": { "type": "number" },
      "trigUser": { "type": "string" },
      "occurrence": { "type": "string", "enum": ["NOW","DATE","EVERYDAY","EVERYWEEK","EVERYMONTH","ATWILL","CHAINED"]},
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



  $scope.taskSelfDetailsForm =  [
  {"key": "description",condition:"todo.description!=null", readonly: true},
  {key:"instance",condition:"todo.instance!=null",readonly: true},
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
    { type: "button", title: "Work on it", onClick: "todo.open=true" }
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

    goBack = function() {
      $location.path("/todos");
    }
    saveTask = function() {
    }


    showTaskDetails = function(task) {
      $scope.currentTask = task;

      $scope.userdataschema=JSON.parse(task.userdataschema);
    /*{
          "type": "object",
          "title": "TODO",
          readonly: false, 
          "properties": {
              "customername":  {"type": "string"}
            }
          };
          */

    //$scope.userdataschema=JSON.parse('{ "type": "object", "title": "data","properties":{"customer_name":  {"type": "string"},"entry_date":  {"type": "string"}}}');  
    $scope.taskform=JSON.parse(task.taskform);
    var actions=   {
      type: "actions",
      items: [
      { type: "button", title: "Cancel", style: "btn-info", onClick: goBack},
      { type: "button", title: "Save and keep", style: "btn-info", onClick: saveTask},
      { type: "button", title: "Save and finish", style: "btn-info" ,onClick: setTaskDone},

      ]
    };
    $scope.taskform.push(actions);
    /*["customername",     {
      type: "actions",
      items: [
      { type: "submit",  title: "Hide this task"}
      ]
    }];
    */
    if (task.userdata!=undefined) {
        $scope.userdata=JSON.parse(task.userdata);
    } else {
      $scope.userdata={};
    }
    
    
    $scope.taskready=true;
  };


// 
setTaskDone = function() {
  var task= $scope.currentTask;
  task.userdata=JSON.stringify($scope.userdata);
  task.done=true;
  $http.put('/api/taskdone/'+task.id, task)
  .success(function(data) {

    console.log(data);
    goBack();
  })
  .error(function(data) {
    console.log('Error: ' + data);
  });

}





    // retrieve task
    var taskid=$routeParams.taskid;
    $http.get('/api/todo/'+taskid)
    .success(function(data) {
      showTaskDetails(data[0]);
    })
    .error(function(data) {
      $scope.userinfo={login: false}
      $location.path("/");
      console.log('Error: ' + data);
    });
    
  }])
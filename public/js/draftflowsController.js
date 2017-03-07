
/* draftflows is used to list all the in-complete flows ( still in draft)
*  on selection page is displaying some details on the flow
*  on action 'complete' the completeFlow is used to add steps or modify the flow
*/
var app = angular.module('digitalbutler');

app.controller('draftflowsController',['$scope', '$rootScope','$http', '$location', function ($scope, $rootScope, $http, $location) {

    $rootScope.menu=[];
    $rootScope.menu.push({label:'new task', fa:'fa-plus-circle', href:'/#/newtask'});
    $rootScope.menu.push({label:'Personal tasks', fa:'fa-list-ul', href:'/#/todos'});
    

 $scope.actionSchema = {
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
    {"key": "description",condition: "todo.description!=undefined", readonly: true},

    {
        type: "actions",
        items: [
        { type: "submit", title: "Complete this chain of actions"}
        ]
      }

    ];


var setTaskStrings = function (task) {
  // create a readable explanation of the task
  var role=" anyone ";
  var str=task.title;
  if (task.distribution=="PERSO") {
  	str+=" must be done by "+task.execUser;
  } else {
    if (task.execGroupRole!="ANY") {
      role = " any "+task.execGroupRole+" ";
    }
    str+=" must be done by "+role+" from group "+task.execGroupName;
  }
  task.explanation=str;
  var header=task.title;
  
  task.header=header;
  
  } 

    // when landing on the page, get all todos and show them

$scope.getActions = function() {

        $http.get('/api/flows')
        .success(function(data) {
          //$scope.todos.clear();
               for (let a of data) {
               	  setTaskStrings(a);
               }
               $scope.actions = data;
               
            })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }

$scope.getActionDetails=function(action) {
  // complete the form

  if ($scope.currentAction!=action.id) {


    // build the story from action graph

    $scope.currentActionUseCase={"main":[]};

    $http.get('/api/flow/'+action.id)
      .success(function(data) {
          
          console.log(data);
          // building the use case from the graph representation
          // we get a list of from-relation-to  segement

          var story=[];
          if (data.path.length > 0) {
            story.push(data.path[0].from);
            story.push(data.path[0].to);
          }
          for (i=1; i<data.path.length; i++) {
             var title=data.path[i].from.title;
             for (j=0;j<story.length;j++) {
                 if (story[j].title==title) {
                     story.splice(j+1,0,data.path[i].to);
                     break;
                 }
             }

          }
          $scope.currentActionUseCase.main=story;
          $scope.currentAction=action.id;
          
      })
    }
}


$scope.completeFlow = function(task,form) {


    $location.path("/completeflow/"+task.id);

};
    




    init = function() {
    }
    // retireve todos to init the view 
          // when landing on the page, get all todos and show them
    $http.get('/api/userinfo')
        .success(function(data) {

            $scope.userinfo = data;
            init();
        
            $scope.getActions();
            
        })
        .error(function(data) {
            $scope.userinfo={login: false}
            $location.path("/");
            console.log('Error: ' + data);
        });
    
}])
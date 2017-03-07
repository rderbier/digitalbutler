// todo.js
var app = angular.module('digitalbutler');
//
// handle groups  and members
//

app.controller('groupsController',['$scope', '$http', function groupsController($scope, $http) {
        var groupMap=[];
    var roleMap=[];
    var groupList={};
     // sub-group with parent group not implemented yet.
     $scope.groupSchema = {
          "type": "object",
          "title": "TODO",
          "properties": {
             
              "name": {"type": "string"},
              "role" :{ "type": "string" },
              "alias": { "type": "string" }
            },
        "required": ["name"]
        };
    $scope.addGroup = function (data,form) {
        $scope.$broadcast('schemaForm.error.name','usernameAlreadyTaken','The username is already taken');
    }
    $scope.addGroupForm = [
      
                  {
                        "title": "What is the group name  " ,
                        "key": "name" 
                   },
   
                    {
                        "title": "What will be your role in this group ?" ,
                        "key": "role"
                        
                    },
                    {
                        "title": "You will known as ... " ,
                        "key": "alias"
                    },

                    {
                      type: "actions",
                      condition:"true",
                      items: [
                      
                        { type: "submit", title: "Confirm", style: "btn-info"}

                      ]
                    }
               ]    

    $scope.group = {};
    $scope.showResult=false;
    $scope.grouplist=[];
    $scope.groupdetailslist=[];
    $scope.currentgroup=undefined;
    $scope.addGroupFormVisible = false;
    // when landing on the page, get all todos and show them
    $scope.getGroupsInfo = function() {
        $http.get('/api/groups')
            .success(function(data) {
                $scope.grouplist = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    }
    $scope.toggleAddGroupForm = function() {
        $scope.addGroupFormVisible = !$scope.addGroupFormVisible;
    }
    $scope.getGroupDetails = function(groupid) {
    $http.get('/api/group/'+groupid)
        .success(function(data) {
            $scope.groupdetailslist[groupid] = data;
            $scope.currentgroup=groupid;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
    }
    $scope.getGroupsInfo();
}])
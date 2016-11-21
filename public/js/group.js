// todo.js
var app = angular.module('digitalbutler');
//
// handle groups  and members
//

app.controller('groupsController',['$scope', '$http', function groupsController($scope, $http) {
    $scope.formData = {};
    $scope.showResult=false;
    $scope.grouplist=[];
    $scope.groupdetailslist=[];
    $scope.currentgroup=undefined;
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
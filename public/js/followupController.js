/*
   Followup lists tasks you have ask to someone and flows you have started 
   provides status 'complete' or 'pending on ...'
   provides access to detail status (
 */
var app = angular.module('digitalbutler');

app.controller('followupController',['$scope', '$rootScope','$http', '$location', function followupController($scope, $rootScope, $http, $location) {

    $rootScope.menu=[];
    // to do : decide what should appear here
    $rootScope.menu.push({label:'new task', fa:'fa-plus-circle', href:'/#/newtask'});
    $rootScope.menu.push({label:'Personal tasks', fa:'fa-list-ul', href:'/#/todos'});
    $scope.requestedTasks=[];

    function init() {
    	
    }

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

  }]);
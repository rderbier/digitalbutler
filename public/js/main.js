/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */
var app = angular.module('digitalbutler', [
  'schemaForm', 'schemaForm-datepicker', 'schemaForm-timepicker', 'schemaForm-datetimepicker','ngRoute','schemaForm', 'ui.bootstrap'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {templateUrl: "partials/landing.html", controller: "PageCtrl"})
    // Pages
    .when("/todos", {templateUrl: "partials/mytasks.html", controller: "todoController"})
    .when("/opentask/:taskid", {templateUrl: "partials/opentask.html", controller: "opentaskController"})
    .when("/actions", {templateUrl: "partials/actions.html", controller: "actionsController"})
    .when("/startaction/:actionid", {templateUrl: "partials/startaction.html", controller: "startactionController"})
    .when("/newtask", {templateUrl: "partials/newtask.html", controller: "newtaskController"})
    .when("/sharedtasks", {templateUrl: "partials/sharedtasks.html", controller: "todoController"})
    .when("/location", {templateUrl: "partials/asset.html", controller: "assetController"})
    .when("/groups", {templateUrl: "partials/groups.html", controller: "groupsController"})
    .when("/help", {templateUrl: "partials/help.html", controller: "PageCtrl"})
    .when("/pricing", {templateUrl: "partials/pricing.html", controller: "PageCtrl"})
    .when("/services", {templateUrl: "partials/services.html", controller: "PageCtrl"})
    .when("/contact", {templateUrl: "partials/contact.html", controller: "PageCtrl"})
    // Blog
    .when("/register", {templateUrl: "partials/register.html"})
    .when("/help/tasks", {templateUrl: "help/help-tasks.html", controller: "PageCtrl"})
    .when("/help/about", {templateUrl: "help/help-about.html", controller: "PageCtrl"})
    // else 404
    .otherwise("/404", {templateUrl: "partials/404.html", controller: "PageCtrl"});
}]);

/**
 * homecontrol
 */
app.controller('mainCtrl',  function mainCtrl($rootScope, $scope, $location, $http) {
    console.log("mainCtrl started");
      // when landing on the page, get all todos and show them
    $http.get('/api/userinfo')
        .success(function(data) {

            $scope.userinfo = data;
            
        })
        .error(function(data) {
            $scope.userinfo={login: false}
            $location.path("/");
            console.log('Error: ' + data);
        });
  if (window.hasOwnProperty('webkitSpeechRecognition')) {
     var recognition = new webkitSpeechRecognition();
   }
   
  $scope.command="";

  $scope.help = function () {
    if ( $scope.helpContext ) {
      $location.path("#/help/$scope.helpContext");
    } else {
      $location.path("#/help/about");
    }
  }
  $rootScope.alert={msg:""};
  $rootScope.info = function(msg) {
    $rootScope.alert.type="info";
    $rootScope.alert.msg=msg;
    
  }
  $rootScope.closeAlert = function () {
    $rootScope.alert={msg:""};
  }
  $scope.endofrecognition = function(e) {
        $scope.command = e.results[0][0].transcript;
        recognition.stop();
        $scope.sendCommand($scope.command);   
        $scope.$apply();
      };
  $scope.startDictation = function() {
 
    if (recognition!=undefined) {
 
      
 
      recognition.continuous = false;
      recognition.interimResults = false;
 
      recognition.lang = "en-US";
      
      $scope.command="Listening ...";
      recognition.onresult = $scope.endofrecognition;

      recognition.start();
      recognition.onerror = function(e) {
        recognition.stop();
      }
 
    }
  }


  $scope.sendCommand = function(command) {
    // try to understand locally
  
    var getit=false;;
    var match;
    match=command.match(/(?:[\w,\s]*)new task/i);
        if(match!=null) {
           getit=true;
           $location.path("/newtask");
        }
    match=command.match(/(?:[\w,\s]*)have to ([\w,\s]*)/i);
    if(match!=null) {
           getit=true;
           $rootScope.newTask={ title: match[1].trim(), type: 'reminder'}

           
           $location.path("/newtask");
        }

    if (getit==false) {
            
    // !!! use this instead of $Scope as with are using nested controllers 
      console.log("Sending command "+this.command);
      $scope.showResult=false;
          $http.get('/command', {params: { command: this.command} }).success(function(data) {

                  
                  $rootScope.alert = {msg: data.message};
                  $scope.context = data.context;
                  $scope.page=data.page;
                  $scope.getit=data.getit;
                  if (data.getit==true) {
                    $location.path(data.page);
                  } else {
                    // $location.path('help');
                    $rootScope.alert = {msg: "Sorry, did not get : '"+$scope.command+"' !"};
                    $scope.command = ""; // clear the form so our user is ready to enter another
                  }
                  console.log(data);
              })
              .error(function(data) {
                  console.log('Error: ' + data);
              });
      }
   }
 });


/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function PageCtrl($scope, $location, $http) {
  console.log("Page Controller started");

});
// todo.js
var app = angular.module('digitalbutler');

app.controller('completeFlowController',['$scope', '$rootScope','$http', '$location', '$routeParams', function ($scope, $rootScope, $http, $location, $routeParams) {

	$rootScope.menu=[];
	$rootScope.menu.push({label:'Personal tasks', fa:'fa-list-ul', href:'/#/todos'});
	$rootScope.menu.push({label:'actions', fa:'fa-cogs', href:'/#/actions'});

    // retrieve action
    var actionid=$routeParams.actionid;

    // build the story from action graph

    $scope.currentActionUseCase={"main":[]};

    goBack = function() {
    	$location.path("/actions");
    }

    showStartDetails = function(action) {
    	    $scope.action=action;
	    	var task = action.start;
	    	var story=[];
	    	if (action.path.length > 0) {
	    		story.push(action.path[0].from);
	    		story.push(action.path[0].to);
	    	}
	    	for (i=1; i<action.path.length; i++) {
	    		var title=action.path[i].from.title;
	    		for (j=0;j<story.length;j++) {
	    			if (story[j].title==title) {
	    				story.splice(j+1,0,action.path[i].to);
	    				break;
	    			}
	    		}

	    	}
	    	$scope.currentActionUseCase.main=story;

	    	var userdataschema=JSON.parse(action.goal.userdataschema);
	    	/*{
	          "type": "object",
	          "title": "TODO",
	          readonly: false, 
	          "properties": {
	              "customername":  {"type": "string"}
	            }
	          };
	          */
	         // add some fixed fields to the data schema 
	         userdataschema.properties["instance"] = {"type": "string"};

	         $scope.userdataschema = userdataschema;

	    	//$scope.userdataschema=JSON.parse('{ "type": "object", "title": "data","properties":{"customer_name":  {"type": "string"},"entry_date":  {"type": "string"}}}');  
	    	$scope.taskform=JSON.parse(action.start.taskform);
	    	// add fixed form fields and buttons to the form 
	    	$scope.taskform.splice(0,0,"instance");
	    	var actions=   {
	    		type: "actions",
	    		items: [
	    		{ type: "button", title: "Cancel", style: "btn-info", onClick: goBack},
	    		{ type: "button", title: "Launch the action", style: "btn-info" ,onClick: launchAction},

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
		    $scope.userdata={};
		    $scope.action=action;
		};

		$http.get('/api/flow/'+actionid)
		.success(function(data) {

			showStartDetails(data);
          // building the use case from the graph representation
          // we get a list of from-relation-to  segement

          
          
          
      });

	}])

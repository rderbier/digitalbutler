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
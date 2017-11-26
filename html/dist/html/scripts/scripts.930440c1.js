"use strict";function refreshLoop(a,b,c){timer=b(function(){},1e3),timer.then(function(){console.log("INFO: Timer triggered"),c.getStatus().then(function(b){a.status=b.data},function(a){console.error("ERROR: Request failed: "+a.statusText)}),a.poll&&refreshLoop(a,b,c)},function(){console.error("ERROR: Timer rejected!")})}angular.module("htmlApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch"]).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/home",{templateUrl:"views/main.html",controller:"MainCtrl",controllerAs:"main"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl",controllerAs:"about"}).otherwise({redirectTo:"/"})}]);var timer;angular.module("htmlApp").controller("MainCtrl",["$scope","$timeout","MainFactory",function(a,b,c){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"],a.togglePoll=function(){console.log("INFO: Handling togglePoll"),a.poll?(a.text="Start polling",a.poll=!1):(a.text="Stop polling",a.poll=!0,refreshLoop(a,b,c))},a.requestPing=function(){console.log("INFO: Handling requestPing");var a={command:"ping",source:"ui"};c.postCommand(a).then(function(a){console.log("INFO: Ping command submitted to server: "+a.statusText)},function(a){console.error("ERROR: Request failed: "+a.statusText)})},a.lastUpdate="No update yet",a.poll=!1,a.text="Start polling",a.status={}}]),angular.module("htmlApp").controller("AboutCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),console.log("Initialise services");var baseURL="";angular.module("htmlApp").factory("MainFactory",["$http",function(a){var b={};return b.getStatus=function(){return a.get(baseURL+"/v1/twin/status")},b.postCommand=function(b){return a.post(baseURL+"/v1/twin/command",b)},b}]),angular.module("htmlApp").run(["$templateCache",function(a){a.put("views/about.html",'<!--\nCopyright 2018 NTT Group\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this \nsoftware and associated documentation files (the "Software"), to deal in the Software \nwithout restriction, including without limitation the rights to use, copy, modify, \nmerge, publish, distribute, sublicense, and/or sell copies of the Software, and to \npermit persons to whom the Software is furnished to do so, subject to the following \nconditions:\n\nThe above copyright notice and this permission notice shall be included in all copies \nor substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, \nINCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR \nPURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE \nFOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR \nOTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER \nDEALINGS IN THE SOFTWARE.\n--> <div class="jumbotron"> <p class="lead"><img src="images/golang.ce23e79a.png" width="80" height="80"> <br></p> <p>Hello Gopher</p> </div> <p> This is a digital twin of the Anki Overdrive which shows the current status of the cars. The twin works both ways, which means that the cars can also be controlled from this twin, e.g. spped and lane offset. </p>'),a.put("views/main.html",'<!--\nCopyright 2018 NTT Group\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this \nsoftware and associated documentation files (the "Software"), to deal in the Software \nwithout restriction, including without limitation the rights to use, copy, modify, \nmerge, publish, distribute, sublicense, and/or sell copies of the Software, and to \npermit persons to whom the Software is furnished to do so, subject to the following \nconditions:\n\nThe above copyright notice and this permission notice shall be included in all copies \nor substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, \nINCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR \nPURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE \nFOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR \nOTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER \nDEALINGS IN THE SOFTWARE.\n--> <div> <h2>Status from Anki Overdrive</h2> <br> <p><a class="btn btn-lg btn-success" ng-click="togglePoll()">{{ text }}</a></p> <br> <p> <table class="table table-striped"> <tr> <td>Last Update</td> <td>{{ lastUpdate }}</td> <td> <a ng-click="requestPing()" class="btn btn-link"> <span class="glyphicon glyphicon-repeat"></span> </a> </td> </tr> <tr> <td>Speed</td> <td>{{ status.speed }}</td> <td> <a ng-click="changeSpeedUp()" class="btn btn-link"> <span class="glyphicon glyphicon-circle-arrow-up"></span> </a> <a ng-click="changeSpeedDown()" class="btn btn-link"> <span class="glyphicon glyphicon-circle-arrow-down"></span> </a> <a ng-click="showInitialise()" class="btn btn-link"> <span class="glyphicon glyphicon-off"></span> </a> </td> </tr> <tr> <td>Offset</td> <td>{{ status.offset }}</td> <td> <a ng-click="changeLaneRight()" class="btn btn-link"> <span class="glyphicon glyphicon-circle-arrow-right"></span> </a> <a ng-click="changeLaneLeft()" class="btn btn-link"> <span class="glyphicon glyphicon-circle-arrow-left"></span> </a> <a ng-click="showInitialise()" class="btn btn-link"> <span class="glyphicon glyphicon-cog"></span> </a> </td> </tr> <tr> <td>Lights</td> <td>No feedback given</td> <td> <a ng-click="changeLight()" class="btn btn-link"> <span class="glyphicon glyphicon-star"></span> </a> <a ng-click="changeLightPattern()" class="btn btn-link"> <span class="glyphicon glyphicon-asterisk"></span> </a> </td> </tr> <tr> <td>Piece ID</td> <td>{{ status.piece_id }}</td> <td> <a class="btn btn-link"> <span class="glyphicon glyphicon-xxx"></span> </a> </td> </tr> <tr> <td>Piece Location</td> <td>{{ status.piece_location }}</td> <td> <a class="btn btn-link"> <span class="glyphicon glyphicon-xxx"></span> </a> </td> </tr> <tr> <td>Version</td> <td>{{ status.version }}</td> <td> <a ng-click="requestVersion()" class="btn btn-link"> <span class="glyphicon glyphicon-repeat"></span> </a> </td> </tr> <tr> <td>Battery Level</td> <td>{{ status.level }}</td> <td> <a ng-click="requestLevel()" class="btn btn-link"> <span class="glyphicon glyphicon-repeat"></span> </a> </td> </tr> </table> </p> </div>')}]);
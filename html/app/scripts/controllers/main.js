// Copyright 2018 NTT Group

// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to the following
// conditions:

// The above copyright notice and this permission notice shall be included in all copies
// or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

'use strict';

var timer;

function refreshLoop($scope, $timeout, MainFactory) {
	timer = $timeout(function () {
		//console.log('INFO: Timer set');
	}, 200);
	timer.then(function () {
		console.log('INFO: Timer triggered');
		MainFactory.getStatus()
			.then(
			function (response) { // ok
				$scope.status = response.data;

				//Bind selected car model
				if(!$scope.car0BtId) {
          $scope.car0BtId = $scope.status[0].carID;
        }
        if(!$scope.car1BtId) {
          $scope.car1BtId = $scope.status[1].carID;
        }
        if(!$scope.car2BtId) {
          $scope.car2BtId = $scope.status[2].carID;
        }
        if(!$scope.car3BtId) {
          $scope.car3BtId = $scope.status[3].carID;
        }

        //Translate car offset to laneNo
        $scope.status[0].laneOffset = MainFactory.translateCarOffsetToLane($scope.status[0].laneOffset);
        $scope.status[1].laneOffset = MainFactory.translateCarOffsetToLane($scope.status[1].laneOffset);
        $scope.status[2].laneOffset = MainFactory.translateCarOffsetToLane($scope.status[2].laneOffset);
        $scope.status[3].laneOffset = MainFactory.translateCarOffsetToLane($scope.status[3].laneOffset);

			},
			function (response) { // nok
				console.error('ERROR: getStatus request failed: ' + response.statusText);

				// DEBUG: use some mock data if the back-end is missing
        $scope.status[1].carID = 'edef582991e2';
        $scope.status[2].carID = 'fb8f2bab1e4b';
        $scope.car1BtId = $scope.status[1].carID;
        $scope.car2BtId = $scope.status[2].carID;
        $scope.status[1].laneOffset = '1';
        $scope.status[2].laneOffset = '2';
        $scope.status[1].carSpeed = '45';
        $scope.status[2].carSpeed = '46';
        $scope.status[1].laneNo = '1';
        $scope.status[2].laneNo = '2';
        $scope.status[1].carBatteryLevel = '3801';
        $scope.status[2].carBatteryLevel = '3902';
        $scope.status[1].posTileNo = '1';
        $scope.status[2].posTileNo = '2';
        $scope.status[1].posTileType = 'STRAIGHT';
        $scope.status[2].posTileType = 'CURVE';
			}
			);
		if ($scope.poll) {
			refreshLoop($scope, $timeout, MainFactory);
		}
	}, function () {
		console.error('ERROR: Timer rejected!');
	});
}

/**
 * @ngdoc function
 * @name htmlApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the htmlApp
 */
angular.module('htmlApp')
	.controller('MainCtrl', ['$scope', '$timeout', 'MainFactory', 'MainConfig',
		function ($scope, $timeout, MainFactory, MainConfig) {
			this.awesomeThings = [
				'HTML5 Boilerplate',
				'AngularJS',
				'Karma'
			];

		// Handler function for togging of status polling
		$scope.togglePoll = function () {
			console.log('INFO: Handling togglePoll');
			if ($scope.poll) {
				$scope.text = 'Start polling';
				$scope.poll = false;
			} else {
				$scope.text = 'Stop polling';
				$scope.poll = true;
				refreshLoop($scope, $timeout, MainFactory);
			}
		};

		// Handler function for pinging the car
		$scope.requestPing = function (carNo) {
			console.log('INFO: Handling requestPing for carno '+carNo);
			var command = {
				command: 'ping',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: Ping command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for version of the car
		$scope.requestVersion = function (carNo) {
			console.log('INFO: Handling requestVersion for carno '+carNo);
			var command = {
				command: 'ver',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: Version command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

    // Handler function for changeSpeedUp of the car (250-1000)
    $scope.swapCar = function (carNo) {
      console.log('INFO: Handling swap bluetooth id for carno '+carNo);
      var command = {
        command: 'swap',
        param1: ''+$scope['car' + carNo + 'BtId'],
        carNo: carNo,
        source: 'ui'
      };
      MainFactory.postCommand(command)
        .then(
          function (response) { // ok
            console.log('INFO: Swap command submitted to server: '+response.statusText);
          },
          function (response) { // nok
            console.error('ERROR: Request failed: ' + response.statusText);
          }
        );
    };

		// Handler function for changeSpeedUp of the car (250-1000)
		$scope.changeSpeedUp = function (carNo) {
			console.log('INFO: Handling changeSpeedUp for carno '+carNo);
			var command = {
				command: 's',
				param1: ''+MainConfig.highSpeed,
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: SpeedUp command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeSpeedDown of the car (250-1000)
		$scope.changeSpeedDown = function (carNo) {
			console.log('INFO: Handling changeSpeedDown for carno '+carNo);
			var command = {
				command: 's',
				param1: ''+MainConfig.slowSpeed,
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: SpeedDown command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeSpeedStop of the car (250-1000)
		$scope.changeSpeedStop = function (carNo) {
			console.log('INFO: Handling changeSpeedStop for carno '+carNo);
			var command = {
				command: 's',
        param1: '0',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: SpeedStop command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeLaneLeft with the car (-68-+68)
		$scope.changeLaneLeft = function (carNo) {
			console.log('INFO: Handling changeLaneLeft for carno '+carNo);
			var command = {
				command: 'c',
				param1: '', // Will be evaluated by server
				param2: 'left',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: changeLaneLeft command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeLaneRight with the car (-68-+68)
		$scope.changeLaneRight = function (carNo) {
			console.log('INFO: Handling changeLaneRight for carno '+carNo);
			var command = {
				command: 'c',
				param1: '', // Will be evaluated by server
				param2: 'right',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: changeLaneRight command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for showInitialise
		$scope.showInitialise = function (carNo) {
			console.log('INFO: Handling showInitialise for carno '+carNo);
		};

		// Handler function for changeLight
		$scope.changeLight = function (carNo) {
			console.log('INFO: Handling changeLight for carno '+carNo);
			var command = {
				command: 'l',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: changeLight command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for changeLightPattern
		$scope.changeLightPattern = function (carNo) {
			console.log('INFO: Handling changeLightPattern for carno '+carNo);
			var command = {
				command: 'lp',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: changeLightPattern command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Handler function for requestLevel
		$scope.requestLevel = function (carNo) {
			console.log('INFO: Handling requestLevel for carno '+carNo);
			var command = {
				command: 'bat',
				carNo: carNo,
				source: 'ui'
			};
			MainFactory.postCommand(command)
				.then(
				function (response) { // ok
					console.log('INFO: requestLevel command submitted to server: '+response.statusText);
				},
				function (response) { // nok
					console.error('ERROR: Request failed: ' + response.statusText);
				}
				);
		};

		// Initialise
		$scope.lastUpdate = 'N/A';
		$scope.poll = false;
		$scope.text = 'Start polling';
		$scope.status = [{},{},{}];

		MainFactory.getCars()
      .then(
        function(response) {  // ok
          $scope.cars = response.data;
        },
        function (response) { // nok
          console.error('ERROR: getCars request failed: ' + response.statusText);

          // DEBUG: use mock data for cars if the back-end is missing
          $scope.cars = [
              {'model': '0 ROUNDSHOCK (BLUE)', 'btid': 'edef582991e2'},
              {'model': '1 SKULL (BLACK)', 'btid': 'fb8f2bab1e4b'},
              {'model': '2 NUKE (GREEN/BLACK)', 'btid': 'fb2c43ca4073'},
              {'model': '3 NUKE (GREEN/BLACK)', 'btid': 'f458e8027a27'},
              {'model': '4 BIGBANG (GREEN)', 'btid': 'c3f8b8e6ba79'},
              {'model': '5 BIGBANG (GREEN)', 'btid': 'd1ffcbf22347'},
              {'model': '6 THERMO (RED)', 'btid': 'e07c5f42d543'},
              {'model': '7 THERMO (RED)', 'btid': 'e67a69585ca4'},
              {'model': '8 GUARDIAN (BLUE/SILVER)', 'btid': 'd4435b819516'},
              {'model': '9 GUARDIAN (BLUE/SILVER)', 'btid': 'e58aa933a106'},
              {'model': '10 GROUNDSHOCK (BLUE)', 'btid': 'f4f96680d1f2'},
              {'model': '11 SKULL (BLACK)', 'btid': 'ec7d32207f95'},
              {'model': '12 NUKE (BREEN/BLACK)', 'btid': 'f094f611c8e5'},
              {'model': '13 NUKE (BREEN/BLACK)', 'btid': 'd72c9a461b87'},
              {'model': '14 BIGBANG (GREEN)', 'btid': 'ea90f84f2804'},
              {'model': '15 BIGBANG (GREEN)', 'btid': 'f30da22227b1'},
              {'model': '16 THERMO (RED)', 'btid': 'd00a4e9b93d3'},
              {'model': '17 THERMO (RED)', 'btid': 'f65332e1688c'},
              {'model': '18 GURDIAN (BLUE/SILVER)', 'btid': 'eee9ed31eac1'},
              {'model': '19 GURDIAN (BLUE/SILVER)', 'btid': 'd3c74657a020'},
              {'model': '20 MUSCLE (GRAY)', 'btid': 'd4b42cc5cf27'},
              {'model': '21 PICKUPTRUCK (GRAY)', 'btid': 'd00a267f9e09'},
              {'model': 'XX FREEWHEEL (GREEN/SILVER)', 'btid': 'df46034abd1b'}
          ];
        }
      );

    if(!$scope.poll) {
      $scope.togglePoll();
    }
	}]);



'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:ToolCtrl
 * @description
 * # ToolCtrl
 * Controller of the zimmoApp
 */
angular.module('zimmoApp')
  .controller('ToolCtrl',   ['$scope', '$state', 'principal', function($scope, $state, principal) {

    this.currentUser = 'ss';
    $scope.signout = function() {
      principal.authenticate(null);
      $state.go('getstarted');
    };
    $scope.signin = function() {

      // here, we fake authenticating and give a fake user
      principal.authenticate({
        name: 'Test User',
        roles: ['User']
      });

      if ($scope.returnToState) $state.go($scope.returnToState.name, $scope.returnToStateParams);
      else $state.go('home');
    };

  }])
  .run(['$rootScope', '$state', '$stateParams', 'authorization', 'principal',
    function($rootScope, $state, $stateParams, authorization, principal) {
      $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
        console.log('tool.js StateChange');
        $rootScope.toState = toState;
        $rootScope.toStateParams = toStateParams;
        if (principal.isIdentityResolved()){
          console.log('tool.js if isIdent');
          authorization.authorize();
        }
      });
    }
  ])
;

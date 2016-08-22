'use strict';

/**
 * @ngdoc overview
 * @name zimmoApp
 * @description
 * # zimmoApp
 *
 * Main module of the application.
 */
angular
    .module('zimmoApp', ['ui.router','ngMessages','ngTable','ui.bootstrap','leaflet-directive','ngCookies','angularFileUpload'])

    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider','$logProvider','$locationProvider', function ($stateProvider, $urlRouterProvider, $httpProvider,$logProvider,$locationProvider) {
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;
        $logProvider.debugEnabled(false);
        //$locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl as c_main',
                authenticate: false
            })
            .state('getstarted', {
                url: '/getstarted',
                templateUrl: 'views/getstarted.html',
                controller: 'MainCtrl as c_main',
                authenticate: false
            })
            .state('fotos', {
                url: '/fotos',
                templateUrl: 'views/fotos.html',
                controller: 'MainCtrl as c_main',
                authenticate: false
            })
            .state('tool', {
                url: '/tool',
                templateUrl: 'views/tool.html',
                controller: 'ToolCtrl as c_tool',
                authenticate: true,
                roles: []

            })
            .state('tool.dashboard', {
                url: '/dashboard',
                templateUrl: 'views/tool_dashboard.html',
                authenticate: true,
                roles: ['role_5']

            })
            .state('tool.user', {
                url: '/user',
                templateUrl: 'views/tool_user.html',
                authenticate: true,
                roles: []
            })
            .state('tool.expose', {
                url: '/expose',
                templateUrl: 'views/tool_expose.html',
                authenticate: true,
                roles: [],
                controller: function($scope,$stateParams){

                    $scope.c_tool.feedbackVisible = false;
                }
            })
            .state('tool.exposeOne', {
                url: '/expose/:exposeid',
                templateUrl: 'views/tool_expose.html',
                authenticate: true,
                roles: [],
                controller: function($scope,$stateParams){
                    $scope.c_tool.setRecord($stateParams.exposeid);
                }
            })
            .state('tool.suche', {
                url: '/suche',
                templateUrl: 'views/tool_suche.html',
                authenticate: true,
                roles: []
            })
            .state('tool.sucheOne', {
                url: '/suche/:exposeid',
                templateUrl: 'views/tool_suche.html',
                authenticate: true,
                roles: [],
                controller: function($scope,$stateParams){
                    $scope.c_tool.exposeSearch(true,{id:$stateParams.exposeid});
                }
            })
            .state('tool.team', {
                url: '/team',
                templateUrl: 'views/tool_team.html',
                authenticate: true,
                roles: []
            })
            .state('tool.accessdenied', {
                url: '/denied',
                templateUrl: 'views/tool_denied.html',
                roles: []
            })
            .state('exit', {
                url: '/exit',
                templateUrl: 'views/exit.html',
                controller: 'MainCtrl as c_main',
                roles: []
            })
        ;


    }])

    .run(['$rootScope', '$state', 'AuthService',function ($rootScope, $state, AuthService) {
        // Redirect to login if route requires auth and you're not logged in
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
            if (toState.authenticate && !AuthService.checkAuthenticated()){
                // User isn’t authenticated
                $state.transitionTo("getstarted");
                $rootScope.returnToState = toState;
                event.preventDefault();
            }
        });
    }])
    .service('AuthService',['$cookies', function($cookies){
        var self = this;
        this.userObj = undefined;

        this.checkAuthenticated = function(){
            return true;
            var phpcookie = $cookies.get("zuumeoImmoApp_Session_Session");
            console.info("auth")
            if(phpcookie || (self.userObj !== undefined && self.userObj.isAuthenticated) ){
                //Update Cookie
                var now = new Date(),
                exp = new Date(now.getFullYear(), now.getMonth(), now.getDate()+2);
                $cookies.put("zuumeoImmoApp_Session_Session",phpcookie,{expires: exp});
                return true;
            }

        };

    }])

;


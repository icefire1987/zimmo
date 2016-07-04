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
    .module('zimmoApp', ['ui.router','ngMessages','ngTable'])

    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider,AuthService) {
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;


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
                controller: 'ToolCtrl as c_tool',
                authenticate: true,
                roles: ['role_5']

            })
            .state('tool.user', {
                url: '/user',
                templateUrl: 'views/tool_user.html',
                controller: 'ToolCtrl as c_tool',
                authenticate: true,
                roles: []
            })
            .state('tool.expose', {
                url: '/expose',
                templateUrl: 'views/tool_expose.html',
                controller: 'ToolCtrl as c_tool',
                authenticate: true,
                roles: []
            })
            .state('tool.suche', {
                url: '/suche',
                templateUrl: 'views/tool_suche.html',
                controller: 'ToolCtrl as c_tool',
                authenticate: true,
                roles: []
            })
            .state('tool.team', {
                url: '/team',
                templateUrl: 'views/tool_team.html',
                controller: 'ToolCtrl as c_tool',
                authenticate: true,
                roles: []
            })
            .state('tool.accessdenied', {
                url: '/denied',
                templateUrl: 'views/tool_denied.html',
                controller: 'ToolCtrl as c_tool',
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
    .service('AuthService', function(){
        var self = this;
        this.userObj = undefined;

        this.checkAuthenticated = function(){
            return true;
            return self.userObj !== undefined && self.userObj.isAuthenticated;
        };

    })

;


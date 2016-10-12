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
    .module('zimmoApp', ['ui.router','ngMessages','ngTable','ui.bootstrap','leaflet-directive','ngCookies','angularFileUpload','ngStorage','ngSanitize'])

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
                roles: [],
                controller: function($scope,$stateParams,UserService) {
                    angular.copy($scope.c_tool.userObj,$scope.c_tool.userObjTemp);
                    $scope.c_tool.checkInvite();
                }
            })
            .state('tool.expose', {
                url: '/expose',
                templateUrl: 'views/tool_expose.html',
                authenticate: true,
                roles: [],
                controller: function($scope,$stateParams){
                    // function to reset
                    $scope.c_tool.currentExpose = {};
                    $scope.c_tool.images = {object:[],grundriss:[],energieausweis:[]};
                    $scope.c_tool.feedbackVisible = false;
                    $scope.c_tool.getPresets('lage');
                    $scope.c_tool.getPresets('objekt');

                }
            })
            .state('tool.exposeOne', {
                url: '/expose/:exposeid',
                templateUrl: 'views/tool_expose.html',
                authenticate: true,
                roles: [],
                controller: function($scope,$stateParams){
                    $scope.c_tool.setRecord($stateParams.exposeid);
                    $scope.c_tool.getPresets('lage');
                    $scope.c_tool.getPresets('objekt');

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
            .state('tool.config', {
                url: '/config',
                templateUrl: 'views/tool_config.html',
                authenticate: true,
                roles: [],
                controller: function($scope,$stateParams){
                    $scope.c_tool.getConfig();
                }
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

    .run(['$rootScope', '$state', 'AuthService','UserService',function ($rootScope, $state, AuthService, UserService) {

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
    .service('AuthService',['UserService','$cookies','$rootScope', function(UserService,$cookies,$rootScope){
        var self = this;
        this.checkAuthenticated = function(){
            //return true;
            var phpcookie = $cookies.get("zuumeoImmoApp_Session");
            if( phpcookie || (UserService.userObj !== undefined && UserService.userObj.isAuthenticated) ){
                UserService.updateUserFromDB();
                //Update Cookie
                var now = new Date(),
                exp = new Date(now.getFullYear(), now.getMonth(), now.getDate()+2);
                $cookies.put("zuumeoImmoApp_Session",phpcookie,{expires: exp});
                return true;
            }

        };

        this.UserIsAuthenticated = function(){
            UserService.userObj.isAuthenticated = true;
        }

    }])
    .service('UserService',['$rootScope','$http','$localStorage','$cookies', function($rootScope,$http,$localStorage,$cookies){
        // on local:
        var scriptbase = 'http://localhost/Zimmo/app/';
        // on webserver:
        //var scriptbase = '';

        var self = this;
            self.userObj = {};

        this.getUserFromStorage = function(){
            self.userObj = $localStorage.user;
        };
        this.updateUserFromDB = function(){
            var credentials = {'action':'getCurrentUser','formdata':{}};

            $http({
                url: scriptbase + 'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
                .then(function(response) {
                    try{
                        var resObj = response.data;
                        if(resObj.code===1) {
                            self.userObj = JSON.parse(resObj.txt);
                        }
                    }catch(e){
                        console.log(e);
                    }

                });
        };

        this.updateUserObj = function(key,val){
            self.userObj[key] = val;
        };
        this.updateUserObjTeam = function(key,val){
            self.userObj.team[key] = val;
        };

        this.clear = function(){
            self.userObj = {};
            console.log($cookies.get("zuumeoImmoApp_Session"))
            $cookies.remove("zuumeoImmoApp_Session");
            console.log("Clear");
        };

        this.getUser = function () {
            return self.userObj;

        };

    }])

;


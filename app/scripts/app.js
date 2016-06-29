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
    .module('zimmoApp', ['ui.router'])

    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.defaults.withCredentials = true;
        $httpProvider.defaults.useXDomain = true;


        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl as c_main',
                data: {
                    requireLogin: false
                }
            })
            .state('getstarted', {
                url: '/getstarted',
                templateUrl: 'views/getstarted.html',
                controller: 'MainCtrl as c_main',
                data: {
                    requireLogin: false
                }

            })
            .state('tool', {
                url: '/tool',
                templateUrl: 'views/tool.html',
                controller: 'ToolCtrl as c_tool',
                data: {
                    requireLogin: true, // this property will apply to all children of 'tool'
                    roles: []
                }
            })
            .state('tool.dashboard', {
                url: '/dashboard',
                templateUrl: 'views/tool_dashboard.html',
                roles: ['role_5']

            })
            .state('tool.user', {
                url: '/user',
                templateUrl: 'views/tool_user.html',
                roles: []
            })
            .state('tool.accessdenied', {
                url: '/denied',
                templateUrl: 'views/tool_denied.html',
                roles: []
            })
        ;
    }])


;


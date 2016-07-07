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
    .module('zimmoApp', ['ui.router','ngMessages','ngTable','ui.bootstrap','leaflet-directive','ngCookies'])

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
                    $scope.c_tool.currentExpose = {"id":"2","geschaeftsart":"2","strasse":"Schnellerstr","hausnummer":"90D","plz":"12439","ort":"Berlin","bezirk":"","land":"1","go":"123","lieferung":"0000-00-00","moebiliert":"","objekttyp":"3","lageHaus":"","lageStockwerk":"","stockwerke":"","stockwerk":"0","haustyp":"","baujahr":"","sanierung":"","renovierung":"","besonderheit":"","exposetitel":"neueingabe mit foto","provision":"","provisionEinheit":"eur","kaution":"","kautionEinheit":"eur","kaltmiete":"800","pauschalmiete":"","nebenkosten":"","kaufpreis":"","stellplatz":"","stellplatztyp":"","stellplatzkosten":"","wohnflaeche":"75","grundstueckflaeche":"","zimmer":"","schlafzimmer":"1","balkon":"","terrasse":"","aussenflaeche_balkon":"","aussenflaeche_terrasse":"","decke":"","wcgast":"","badezimmer":"","badtyp":"null","badbesonderheit":"[]","heizung":"","boden":"","kueche":"","kuecheausstattung":"","innenausstattung":"","energiewert":"","energieausweisTyp":"Bedarfsausweis","denkmalschutz":"","zustand":"","lage":"","manualTextLage":"","manualTextAusstattung":"","manualTextObjekt":"","updatedatum":"2016-07-06 17:08:29","userID":"2","map":{"lat":"52.4526587","lon":"13.5269479","zoom":"14"}};
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
            var phpcookie = $cookies.get("zuumeoImmoApp_Session_Session");
            console.log(phpcookie);
            if(phpcookie || (self.userObj !== undefined && self.userObj.isAuthenticated) ){
                return true;
            }

        };

    }])

;


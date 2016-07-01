'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:ToolCtrl
 * @description
 * # ToolCtrl
 * Controller of the zimmoApp
 */
angular.module('zimmoApp')
    .controller('ToolCtrl',['$http','$state','AuthService', function ($http,$state,AuthService) {
        var vm = this;
        this.dataSearch = {
            nummer: false,
            strasse: false,
            id: false
        }
        this.exposeSearchAll = function () {
            var credentials = {
                action: 'exposeSearchAll',
                formdata: false
            }
            $http({
                //url: 'scripts/php/ajaxCtrl.php',
                url: 'http://localhost/Zimmo/app/scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(function(response) {

            })
        }
        this.exposeSearchOne = function () {

        }

        this.logout = function(){
            var credentials = {
                action: 'logout'
            }
            $http({
                //url: 'scripts/php/ajaxCtrl.php',
                url: 'http://localhost/Zimmo/app/scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(function(response) {
                console.log(response);
                AuthService.userObj = undefined;
                $state.go("exit");
            })

        }
    }])
    .run(
        function () {
            console.log('run tool.js');
        }
    )
;

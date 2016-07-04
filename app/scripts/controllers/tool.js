'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:ToolCtrl
 * @description
 * # ToolCtrl
 * Controller of the zimmoApp
 */
angular.module('zimmoApp')
    .controller('ToolCtrl',['$http','$state','AuthService','NgTableParams',  function ($http,$state,AuthService,NgTableParams) {
        // on local:
        var scriptbase = 'http://localhost/Zimmo/app/';
        // on webserver:
        //var scriptbase = '';
        var vm = this;

        this.searchObj = {
            formdata: {
                nummer: '',
                strasse: '',
                id: ''
            }
        };
        this.exposeSearch = function (searchdata) {
            var credentials = {
                action: 'exposeSearchAll',
                formdata: false
            };
            if(searchdata===true){
                credentials = {
                    action: 'exposeSearchOne',
                    formdata: vm.searchObj.formdata
                };
                console.log(credentials)
            }
           
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(function(response) {
                var resultset = JSON.parse(response.data.txt);
                vm.cols = [
                    {field: "id", title: "ID", sortable: "id", show: true},
                    {field: "go", title: "Nummer", sortable: "go", show: true},
                    {field: "strasse", title: "Strasse", sortable: "strasse", show: true},
                    {field: "plz", title: "PLZ", sortable: "plz", show: true},
                    {field: "ort", title: "Ort", sortable: "ort", show: true},
                    {field: "ga", title: "Geschäftsart", sortable: "ga", show: true},
                    {field: "oa", title: "Objektart", sortable: "oa", show: true}
                ];
                vm.resultAll_tableParams = new NgTableParams({}, { dataset: resultset});
            })
            ;
        };

        this.logout = function(){
            var credentials = {
                action: 'logout'
            };
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(function(response) {
                console.log(response);
                AuthService.userObj = undefined;
                $state.go("exit");
            })
            ;
        };
    }])
    .run(
        function () {
            console.log('run tool.js');
        }
    )
;

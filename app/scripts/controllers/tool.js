'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:ToolCtrl
 * @description
 * # ToolCtrl
 * Controller of the zimmoApp
 */
angular.module('zimmoApp')
    .controller('ToolCtrl',['$http','$state','AuthService','NgTableParams','$timeout',  function ($http,$state,AuthService,NgTableParams,$timeout) {

        // on local:
        var scriptbase = 'http://localhost/Zimmo/app/';
        // on webserver:
        //var scriptbase = '';
        var vm = this;
            vm.currentExpose = {};
            vm.feedback = {};
            vm.feedbackVisible = false;

        this.searchObj = {
            formdata: {
                nummer: '',
                strasse: '',
                id: ''
            }
        };

        this.showFeedback = function(responsedata){

            vm.feedback.type = responsedata.type;
            vm.feedback.text = responsedata.feedbacktext;
            vm.feedbackVisible = true;
            $timeout(function () {
                vm.feedbackVisible = false;
            }, 4000);
        }
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
            }
           
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(function(response) {
                console.log(response);
                if(response.data.type==="success" || response.data.type==="err"){
                    vm.showFeedback(response.data);
                }
                var resultset = JSON.parse(response.data.text);
                vm.cols = [
                    {field: "id", title: "ID", sortable: "id", show: true},
                    {field: "go", title: "Nummer", sortable: "go", show: true},
                    {field: "strasse", title: "Strasse", sortable: "strasse", show: true},
                    {field: "plz", title: "PLZ", sortable: "plz", show: true},
                    {field: "ort", title: "Ort", sortable: "ort", show: true},
                    {field: "ga", title: "Geschäftsart", sortable: "ga", show: true},
                    {field: "oa", title: "Objektart", sortable: "oa", show: true},
                    {field: "action", title: "", dataType: "command", show: true}
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
        this.del = function(obj){
            var credentials = {
                action: 'exposeDelete',
                formdata: obj
            };
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(
                function(response) {
                    console.log(response.data);
                    if(response.data.type==="success" || response.data.type==="err"){
                        vm.showFeedback(response.data);
                        for(var x=0; x<vm.resultAll_tableParams.data.length;x++){
                            if(vm.resultAll_tableParams.data[x].id==obj.id){
                                vm.resultAll_tableParams.data.splice(x,1);
                            }

                        }

                    }
                },
                function(data){
                    console.log("err");
                }
            );
        };
        this.pdf = function(obj){
            var credentials = {
                action: 'createPDF',
                formdata: obj
            };
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(
                function(response) {
                    console.log(response.data);
                    if(response.data.type==="success" || response.data.type==="err"){
                        vm.feedback = response.data;
                    }
                },
                function(data){
                    console.log("err");
                }
            );

        }
        this.setRecord = function(id){
            var credentials = {
                action: 'echoRecord',
                formdata: {id: id}
            };
            $http({
                url: scriptbase+'scripts/php/ajaxCtrl.php',
                method: 'POST',
                data: JSON.stringify(credentials),
                withCredentials: true

            })
            .then(
                function(response) {
                    console.log(response.data);
                    if(response.data.type==="success" || response.data.type==="err"){
                        vm.feedback = response.data;
                        vm.currentExpose = response.data.text;
                    }
                },
                function(data){
                    console.log("err");
                }
            );
        }
    }])
    .run(
        function () {
            console.log('run tool.js');
        }
    )
;

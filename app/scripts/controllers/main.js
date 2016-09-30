'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the zimmoApp
 */

angular.module('zimmoApp')
  .controller('MainCtrl',['$http','$cookies','$state','$location','$rootScope','$localStorage','AuthService', function ($http,$cookies,$state,$location,$rootScope,$localStorage,AuthService) {
      // on local:
      var scriptbase = 'http://localhost/Zimmo/app/';
      // on webserver:
      //var scriptbase = '';

    var vm = this;
    this.dataLoading = false;

    this.loginObj = {
      tab: 2,
      error: false,
      formdata : {
        mailaddress:'',
        password:''
      }
    };


    this.regObj = {
        formdata : {
            prename : '',
            lastname : '',
            mailaddress: '',
            password: '',
            agb : false,

        },
        error : false
    };

    this.doLogin = function(){
      //$event.preventDefault();
        var credentials = {'action':'login','formdata':vm.loginObj.formdata};
        $http({
            url: scriptbase+'scripts/php/ajaxCtrl.php',
            method: 'POST',
            data: JSON.stringify(credentials),
            withCredentials: true

        })
        .then(function(response) {
            try{
                var resObj = response.data;
                if(resObj.code===1) {
                    AuthService.UserIsAuthenticated;
                    $localStorage.user = JSON.parse(resObj.data);
                    $localStorage.session = JSON.parse(resObj.session);
                    // LOGIN erfolgreich
                    if ($rootScope.returnToState){
                        $state.go($rootScope.returnToState);
                    }else{
                        $state.go("tool");
                    }
                }
            }catch(e){
                console.log(e);
            }
            
        });


    };

      this.doRegister = function(){
          //$event.preventDefault();
          this.dataLoading = true;
          var credentials = {'action':'register','formdata':vm.regObj.formdata};
          $http({
              url: scriptbase+'scripts/php/ajaxCtrl.php',
              method: 'POST',
              data: JSON.stringify(credentials),
              withCredentials: true

          })
              .then(function(response) {
                  vm.dataLoading = false;
                  console.log(response.data);
              //$http.defaults.headers.common["X-AUTH-TOKEN"] = response.data.token;
          });


      };

  }])
    .run(function(){
        console.log('run main.js');
    })
;

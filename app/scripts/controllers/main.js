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
            //url: 'scripts/php/ajaxCtrl.php',
            url: 'http://localhost/Zimmo/app/scripts/php/ajaxCtrl.php',
            method: 'POST',
            data: JSON.stringify(credentials),
            withCredentials: true

        })
        .then(function(response) {
            console.log(response.data);
            try{
                var resObj = response.data;
                if(resObj.code===1) {
                    AuthService.userObj.isAuthenticated = true;
                    $localStorage.user = JSON.parse(resObj.data);
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
              //url: 'scripts/php/ajaxCtrl.php',
              url: 'http://localhost/Zimmo/app/scripts/php/ajaxCtrl.php',
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

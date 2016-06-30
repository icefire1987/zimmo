'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the zimmoApp
 */

angular.module('zimmoApp')
  .controller('MainCtrl',["$http","$state", function ($http,$state) {
    var vm = this;
    this.dataLoading = false;

    this.loginObj = {
      tab: 1,
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
        var credentials = {"action":"login","formdata":vm.loginObj.formdata};
        $http({
            //url: 'scripts/php/ajaxCtrl.php',
            url: 'http://localhost/Zimmo/app/scripts/php/ajaxCtrl.php',
            method: "POST",
            data: JSON.stringify(credentials),
            withCredentials: true

        })
        .then(function(response) {
            console.log(response.data);
            try{
                var resObj = response.data;
                console.log($state)
                console.log(resObj.code)
                if(resObj.code===1){
                    $state.go('tool');
                }
            }catch(e){
                console.log(e);
            }
            //$http.defaults.headers.common["X-AUTH-TOKEN"] = response.data.token;
        });


    };

      this.doRegister = function(){
          //$event.preventDefault();
          this.dataLoading = true;
          var credentials = {"action":"register","formdata":vm.regObj.formdata};
          $http({
              //url: 'scripts/php/ajaxCtrl.php',
              url: 'http://localhost/Zimmo/app/scripts/php/ajaxCtrl.php',
              method: "POST",
              data: JSON.stringify(credentials),
              withCredentials: true

          })
              .then(function(response) {
                  vm.dataLoading = false;
                  console.log(response.data);
              //$http.defaults.headers.common["X-AUTH-TOKEN"] = response.data.token;
          });


      };

  }]);

'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the zimmoApp
 */

angular.module('zimmoApp')
  .controller('MainCtrl',["$http", function ($http) {
    var vm = this;


    this.loginObj = {
      tab: 1,
      error: false,
      formdata : {
        mailaddress:'',
        password:''
      }
    };

    this.regObj = {
      username : '',
      mailaddress: '',
      password: '',
      agb : false,
      error : false
    };

    this.doLogin = function(){
      //$event.preventDefault();
        var credentials = {"action":"login","username":"horst"};
        var loc = window.location.pathname;
        console.log(loc);
        $http({
            //url: 'scripts/php/ajaxCtrl.php',
            url: 'http://localhost/Zimmo/app/scripts/php/ajaxCtrl.php',
            method: "POST",
            data: JSON.stringify(credentials),
            withCredentials: true

        })
        .then(function(response) {
            console.log(response.data);
            //$http.defaults.headers.common["X-AUTH-TOKEN"] = response.data.token;
        });


    };

      this.doRegister = function(){
          //$event.preventDefault();

          var credentials = {"action":"check"};
          $http.post("http://127.0.0.1/Zimmo/app/scripts/php/ajaxCtrl.php", credentials).then(function(response) {
              console.log(response.data);
              //$http.defaults.headers.common["X-AUTH-TOKEN"] = response.data.token;
          });


      };

  }]);

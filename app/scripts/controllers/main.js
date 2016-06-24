'use strict';

/**
 * @ngdoc function
 * @name zimmoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the zimmoApp
 */
angular.module('zimmoApp')
  .controller('MainCtrl', function () {
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

    this.doLogin = function(event){
      //$event.preventDefault();
      console.log('jo');
      console.log(event);
      console.log(vm);
    };

  });

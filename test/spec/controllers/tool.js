'use strict';

describe('Controller: ToolCtrl', function () {

  // load the controller's module
  beforeEach(module('zimmoApp'));

  var ToolCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ToolCtrl = $controller('ToolCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ToolCtrl.awesomeThings.length).toBe(3);
  });
});

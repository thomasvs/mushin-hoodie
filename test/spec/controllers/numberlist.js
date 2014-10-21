// vi:si:et:sw=2:sts=2:ts=2
describe(
  'Controller: NumberListCtrl', function () {
   beforeEach(module('mushin'));

    beforeEach(
      inject(
        function ($controller, $rootScope) {
          scope = $rootScope.$new();
          controller = $controller;

        }
      )
    );

    it('should initialize', function () {
      attrs = {
        type: 'unknown-type'
      };

      var $nlc = controller('NumberListCtrl', {
        $scope: scope,
        $attrs: attrs,
      });

    });
  }
);

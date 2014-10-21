// vi:si:et:sw=2:sts=2:ts=2
describe(
  'Controller: NumberListCtrl', function () {
   beforeEach(module('mushin'));

    beforeEach(
      inject(
        function ($controller, $rootScope) {
          it('should initialize', function () {
            var $nlc = $controller('NumberListCtrl', {});
          });
        }
      )
    );
  }
);

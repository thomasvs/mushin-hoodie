// vi:si:et:sw=2:sts=2:ts=2
describe(
  'Controller: NumberListController', function () {

    var scope, controller, createController;

    beforeEach(module('mushin'));

    beforeEach(
      inject(
        function ($controller, $rootScope) {
          scope = $rootScope.$new();
          controller = $controller;

          createController = function(all, type, data, active, multiple) {
            if (typeof all === 'undefined') { all = false; }
            if (typeof type === 'undefined') { type = 'unknown-type'; }
            if (typeof data === 'undefined') { data = 'data'; }
            if (typeof active === 'undefined') { active = 'active'; }
            if (typeof multiple === 'undefined') { multiple = true; }
            attrs = {
              'all':  all,
              'type': type,
              'data': data,
              'active': active,
              'multiple': multiple,
            };

            return $controller('NumberListController', {
              $scope: scope,
              $attrs: attrs,
            });

          };

        }
      )
    );

    it('should initialize even with (wrong) boolean properties',
      function () {
        var $nlc = createController(false, 'unknown-type', 'haha', true,
          true);
    });

    it('should emit NUMBER_TOGGLED with type and name', function () {
        scope.active = {};
        var $nlc = createController();

        spyOn(scope, "$emit");

        scope.toggle('1');

        expect(scope.$emit).toHaveBeenCalledWith(
          "NUMBER_TOGGLED", "unknown-type", "1");
        expect(scope.active["1"]).toEqual({ "active": true });
    });
  }
);

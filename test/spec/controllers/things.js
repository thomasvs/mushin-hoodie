// vi:si:et:sw=2:sts=2:ts=2
describe(
  'Controller: ThingsController', function () {
    beforeEach(module('mushin'));
    beforeEach(module('hoodie', function ($provide) {
      $provide.value('hoodie', hoodieApi);
      spyOn(hoodieApi.store, 'on');
      spyOn(hoodieApi.store, 'findAll').andReturn([
        { type: 'foo', value: '33' },
        { type: 'bar', value: '34' },
        { type: 'foo', value: '35' }
      ]);
    }));


    var hoodie;
    var hoodieStore;
    var $rootScope;
    var $q;

    var $hoodieApi = (new Hoodie());
    var api = hoodieApi.store;

    var controller;


    beforeEach(inject(function ($controller, _$rootScope_, _hoodieStore_, _hoodie_, _$q_) {
      $rootScope = _$rootScope_;
      hoodie = _hoodie_;
      hoodieStore = _hoodieStore_;
      $q = _$q_;

      scope = $rootScope.$new();
      controller = $controller;
    }));

    it('should have hoodieStore', function () {
      expect(hoodieStore).toBeDefined();
    });

    it('should have controller', function () {
      expect(controller).toBeDefined();
    });
  }
);
*/
